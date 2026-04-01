"""
CommodityIQ — production FastAPI analytics API (single file).

From repo root:
  cd backend && uvicorn main:app --reload

pip install fastapi uvicorn numpy pandas scipy scikit-learn redis python-dotenv slowapi anthropic
"""

from __future__ import annotations

import asyncio
import functools
import hashlib
import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Literal

import numpy as np
import pandas as pd
import redis.asyncio as redis
from anthropic import AsyncAnthropic
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator
from scipy import stats
from scipy.optimize import minimize
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("commodityiq")

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------


class Settings:
    API_KEY: str = os.getenv("API_KEY", "dev_key")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    MODEL: str = "claude-sonnet-4-20250514"
    RISK_FREE: dict[str, float] = {"INR": 0.065, "USD": 0.045, "EUR": 0.035}
    MC_SIMULATIONS: int = 10_000


settings = Settings()
executor = ThreadPoolExecutor(max_workers=os.cpu_count() or 4)
redis_client: redis.Redis | None = None


async def get_redis() -> redis.Redis | None:
    global redis_client
    if redis_client is None:
        try:
            redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await redis_client.ping()
        except Exception as e:
            logger.warning("Redis unavailable: %s — caching disabled", e)
            redis_client = None
    return redis_client


def cache_key(payload: dict | BaseModel) -> str:
    data = payload.model_dump() if isinstance(payload, BaseModel) else payload
    raw = json.dumps(data, sort_keys=True, default=str).encode()
    return hashlib.sha256(raw).hexdigest()


async def cache_get(key: str) -> Any | None:
    r = await get_redis()
    if not r:
        return None
    try:
        v = await r.get(key)
        return json.loads(v) if v else None
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: int) -> None:
    r = await get_redis()
    if not r:
        return
    try:
        await r.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


# -----------------------------------------------------------------------------
# Pydantic models
# -----------------------------------------------------------------------------

AssetClass = Literal["equity", "commodity", "bond", "cash", "crypto", "other"]


class Asset(BaseModel):
    name: str
    symbol: str
    assetClass: AssetClass = "commodity"
    investedAmount: float = Field(ge=0)
    currentPrice: float = Field(gt=0)
    quantity: float = Field(gt=0)
    expectedReturn: float = Field(description="Annual expected return, decimal e.g. 0.08")
    volatility: float = Field(ge=0, description="Annual volatility, decimal")


RiskTol = Literal["conservative", "moderate", "aggressive"]
Curr = Literal["INR", "USD", "EUR"]


class PortfolioInput(BaseModel):
    assets: list[Asset] = Field(min_length=1)
    riskTolerance: RiskTol = "moderate"
    duration: int = Field(5, ge=1, le=40, description="Horizon in years")
    inflationRate: float = Field(0.03, ge=0, le=0.25)
    currency: Curr = "USD"
    correlationMatrix: list[list[float]] | None = None

    @model_validator(mode="after")
    def validate_corr(self) -> PortfolioInput:
        n = len(self.assets)
        if self.correlationMatrix is not None:
            cm = np.array(self.correlationMatrix, dtype=float)
            if cm.shape != (n, n):
                raise ValueError("correlationMatrix must be n×n for n assets")
            if not np.allclose(cm, cm.T):
                raise ValueError("correlationMatrix must be symmetric")
        return self


# -----------------------------------------------------------------------------
# Structured errors
# -----------------------------------------------------------------------------


def err_validation(message: str, field: str | None = None) -> JSONResponse:
    body: dict[str, Any] = {"error": "VALIDATION_ERROR", "message": message}
    if field:
        body["field"] = field
    return JSONResponse(status_code=422, content=body)


def err_computation(message: str) -> JSONResponse:
    return JSONResponse(status_code=500, content={"error": "COMPUTATION_ERROR", "message": message})


# -----------------------------------------------------------------------------
# Portfolio math (vectorized)
# -----------------------------------------------------------------------------


def _build_covariance(assets: list[Asset], corr: np.ndarray | None) -> tuple[np.ndarray, np.ndarray]:
    n = len(assets)
    vol = np.array([a.volatility for a in assets], dtype=np.float64)
    mu = np.array([a.expectedReturn for a in assets], dtype=np.float64)
    if corr is None:
        corr = np.eye(n) * 0.6 + np.ones((n, n)) * 0.4
        np.fill_diagonal(corr, 1.0)
    outer = np.outer(vol, vol)
    cov = outer * corr
    return mu, cov


def _current_weights(assets: list[Asset]) -> np.ndarray:
    vals = np.array([a.currentPrice * a.quantity for a in assets], dtype=np.float64)
    s = vals.sum()
    if s <= 0:
        raise ValueError("Total portfolio value must be positive")
    return vals / s


def portfolio_analysis_compute(body: PortfolioInput) -> dict[str, Any]:
    assets = body.assets
    w = _current_weights(assets)
    mu, cov = _build_covariance(
        assets,
        np.array(body.correlationMatrix, dtype=np.float64) if body.correlationMatrix else None,
    )
    port_ret = float(w @ mu)
    var = float(w @ cov @ w)
    vol = float(np.sqrt(max(var, 1e-18)))
    rf = settings.RISK_FREE[body.currency]
    sharpe = float((port_ret - rf) / vol) if vol > 1e-12 else 0.0
    rng_sd = np.random.default_rng(99)
    d_ex = rng_sd.normal(port_ret / 252.0, vol / np.sqrt(252.0), (2000, 252))
    down_sz = np.sqrt(np.mean(np.minimum(0.0, d_ex - rf / 252.0) ** 2, axis=1) * 252.0)
    sortino_denom = float(np.median(np.maximum(down_sz, 1e-12)))
    sortino = float((port_ret - rf) / sortino_denom) if sortino_denom > 1e-12 else sharpe

    total_invested = float(sum(a.investedAmount for a in assets))
    current_value = float(sum(a.currentPrice * a.quantity for a in assets))
    pnl = current_value - total_invested
    pnl_pct = float(pnl / total_invested) if total_invested > 1e-9 else 0.0

    rng = np.random.default_rng(42)
    n_days, n_sims_dd = 252, 2000
    daily_mu, daily_sig = port_ret / 252.0, vol / np.sqrt(252.0)
    rets = rng.normal(daily_mu, daily_sig, (n_sims_dd, n_days))
    cum = np.cumprod(1.0 + rets, axis=1)
    peak = np.maximum.accumulate(cum, axis=1)
    dd = np.maximum(0.0, (peak - cum) / np.maximum(peak, 1e-12))
    max_drawdown = float(np.median(np.max(dd, axis=1)))

    z = stats.norm.ppf(0.05)
    daily_var = float(abs(z * daily_sig - daily_mu))
    var_95 = float(current_value * daily_var)
    rng_var = np.random.default_rng(100)
    dret = rng_var.normal(daily_mu, daily_sig, 100_000)
    cut = np.percentile(dret, 5)
    tail = dret[dret <= cut]
    cvar_95 = float(-current_value * float(np.mean(tail)))

    hhi = float(np.sum(np.square(w)))
    risk_score = min(100.0, max(0.0, 40 * vol + 30 * hhi + 20 * max_drawdown))
    if body.riskTolerance == "conservative":
        risk_score *= 1.1
    elif body.riskTolerance == "aggressive":
        risk_score *= 0.9
    risk_score = min(100.0, float(risk_score))
    if risk_score < 33:
        rc = "low"
    elif risk_score < 66:
        rc = "medium"
    else:
        rc = "high"

    return {
        "portfolioReturn": port_ret,
        "volatility": vol,
        "variance": var,
        "sharpeRatio": sharpe,
        "sortinoRatio": sortino,
        "maxDrawdown": max_drawdown,
        "VaR95": var_95,
        "CVaR95": abs(cvar_95),
        "totalInvested": total_invested,
        "currentValue": current_value,
        "pnl": pnl,
        "pnlPercent": pnl_pct * 100,
        "HHI": hhi,
        "riskScore": risk_score,
        "riskCategory": rc,
    }


def _monte_carlo_sync(body: PortfolioInput) -> dict[str, Any]:
    w = _current_weights(body.assets)
    mu, cov = _build_covariance(
        body.assets,
        np.array(body.correlationMatrix, dtype=np.float64) if body.correlationMatrix else None,
    )
    port_mu = float(w @ mu)
    port_sig = float(np.sqrt(max(float(w @ cov @ w), 1e-18)))
    v0 = float(sum(a.currentPrice * a.quantity for a in body.assets))
    t_days = int(max(1, body.duration * 252))
    n = settings.MC_SIMULATIONS
    rng = np.random.default_rng(12345)
    daily_mu = port_mu / 252.0
    daily_sig = port_sig / np.sqrt(252.0)
    shocks = rng.normal(daily_mu, daily_sig, size=(n, t_days))
    growth = np.prod(1.0 + shocks, axis=1)
    future_vals = v0 * growth
    infl = body.inflationRate
    real_vals = future_vals / ((1.0 + infl) ** body.duration)
    expected = float(np.mean(future_vals))
    median = float(np.median(future_vals))
    best = float(np.percentile(future_vals, 95))
    worst = float(np.percentile(future_vals, 5))
    prob_loss = float(np.mean(future_vals < v0))
    prob_double = float(np.mean(future_vals >= 2 * v0))
    ci = {
        "80": {"low": float(np.percentile(future_vals, 10)), "high": float(np.percentile(future_vals, 90))},
        "95": {"low": float(np.percentile(future_vals, 2.5)), "high": float(np.percentile(future_vals, 97.5))},
    }
    bands = {str(p): float(np.percentile(future_vals, p)) for p in (5, 25, 50, 75, 95)}
    n_paths_sample = min(50, n)
    sample_paths = (v0 * np.cumprod(1.0 + shocks[:n_paths_sample, :], axis=1)).tolist()
    return {
        "expectedFutureValue": expected,
        "medianFutureValue": median,
        "inflationAdjustedExpected": float(np.mean(real_vals)),
        "bestCaseScenario": best,
        "worstCaseScenario": worst,
        "probabilityOfLoss": prob_loss,
        "probabilityOfDoubling": prob_double,
        "confidenceIntervals": ci,
        "percentileBands": bands,
        "samplePaths": sample_paths,
    }


async def run_monte_carlo(body: PortfolioInput) -> dict[str, Any]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, functools.partial(_monte_carlo_sync, body))


def _efficient_frontier_sync(body: PortfolioInput) -> dict[str, Any]:
    assets = body.assets
    n = len(assets)
    mu, cov = _build_covariance(
        assets,
        np.array(body.correlationMatrix, dtype=np.float64) if body.correlationMatrix else None,
    )
    w0 = _current_weights(assets)
    rf = settings.RISK_FREE[body.currency]

    def portfolio_var(wv: np.ndarray) -> float:
        return float(wv @ cov @ wv)

    def neg_sharpe(wv: np.ndarray) -> float:
        wv = wv / np.sum(wv)
        pr = wv @ mu
        pv = np.sqrt(max(float(wv @ cov @ wv), 1e-18))
        return -((pr - rf) / pv) if pv > 1e-12 else 0.0

    cons = [{"type": "eq", "fun": lambda wv: np.sum(wv) - 1.0}]
    bounds = [(0.0, 1.0)] * n
    x0 = np.ones(n) / n
    min_var = minimize(
        portfolio_var,
        x0,
        method="SLSQP",
        bounds=bounds,
        constraints=cons,
        options={"maxiter": 200},
    )
    if not min_var.success:
        raise RuntimeError(min_var.message)
    w_min = min_var.x / np.sum(min_var.x)
    max_sh = minimize(
        neg_sharpe,
        x0,
        method="SLSQP",
        bounds=bounds,
        constraints=cons,
        options={"maxiter": 200},
    )
    if not max_sh.success:
        w_max_sh = w_min
    else:
        w_max_sh = max_sh.x / np.sum(max_sh.x)

    mu_min, mu_max = float(mu.min()), float(mu.max())
    targets = np.linspace(mu_min, mu_max, 100)

    frontier = []
    for target in targets:

        def neg_ret(wv: np.ndarray) -> float:
            return float(-(wv @ mu))

        cons_t = [
            {"type": "eq", "fun": lambda wv, t=target: float(wv @ mu) - t},
            {"type": "eq", "fun": lambda wv: np.sum(wv) - 1.0},
        ]
        res = minimize(
            portfolio_var,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=cons_t,
            options={"maxiter": 100},
        )
        if res.success:
            ww = res.x / np.sum(res.x)
            pr = float(ww @ mu)
            pv = float(np.sqrt(max(float(ww @ cov @ ww), 1e-18)))
            frontier.append({"return": pr, "volatility": pv, "weights": ww.tolist()})

    if len(frontier) < 10:
        for _ in range(100 - len(frontier)):
            ww = np.random.default_rng().dirichlet(np.ones(n))
            pr = float(ww @ mu)
            pv = float(np.sqrt(max(float(ww @ cov @ ww), 1e-18)))
            frontier.append({"return": pr, "volatility": pv, "weights": ww.tolist()})
        frontier = frontier[:100]

    return {
        "efficientFrontierData": frontier[:100],
        "minimumVariancePortfolio": {"weights": w_min.tolist(), "return": float(w_min @ mu), "volatility": float(np.sqrt(w_min @ cov @ w_min))},
        "maximumSharpePortfolio": {"weights": w_max_sh.tolist(), "return": float(w_max_sh @ mu), "volatility": float(np.sqrt(w_max_sh @ cov @ w_max_sh))},
        "currentPortfolioPosition": {
            "weights": w0.tolist(),
            "return": float(w0 @ mu),
            "volatility": float(np.sqrt(w0 @ cov @ w0)),
        },
    }


async def run_efficient_frontier(body: PortfolioInput) -> dict[str, Any]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, functools.partial(_efficient_frontier_sync, body))


def rebalance_compute(body: PortfolioInput) -> dict[str, Any]:
    ef = _efficient_frontier_sync(body)
    w_cur = np.array(ef["currentPortfolioPosition"]["weights"])
    w_opt = np.array(ef["maximumSharpePortfolio"]["weights"])
    current_value = float(sum(a.currentPrice * a.quantity for a in body.assets))
    rows = []
    for i, a in enumerate(body.assets):
        cw, ow = float(w_cur[i]), float(w_opt[i])
        delta = ow - cw
        amt = delta * current_value
        sev = abs(delta) * 100
        if abs(delta) < 0.005:
            act, sev_l = "hold", "low"
        elif delta > 0:
            act, sev_l = "buy", "high" if sev > 10 else "medium"
        else:
            act, sev_l = "sell", "high" if sev > 10 else "medium"
        rows.append(
            {
                "asset": a.name or a.symbol,
                "symbol": a.symbol,
                "currentWeight": cw,
                "optimalWeight": ow,
                "weightDelta": delta,
                "actionRequired": act,
                "amountToTransact": amt,
                "severity": sev_l,
            }
        )
    return {"rebalance": rows}


def hedge_compute(body: PortfolioInput) -> dict[str, Any]:
    n = len(body.assets)
    vols = np.array([a.volatility for a in body.assets])
    corr = (
        np.array(body.correlationMatrix, dtype=np.float64)
        if body.correlationMatrix
        else (np.eye(n) * 0.65 + np.ones((n, n)) * 0.35)
    )
    np.fill_diagonal(corr, 1.0)
    w = _current_weights(body.assets)
    cov = np.outer(vols, vols) * corr
    port_var = float(w @ cov @ w)
    ind_var = float(np.sum((w**2) * (vols**2)))
    div = 1.0 - (port_var / ind_var) if ind_var > 1e-12 else 0.5
    div = float(np.clip(div, 0.0, 1.0))
    cat = "strong" if div > 0.65 else "moderate" if div > 0.35 else "weak"
    conc = [{"asset": a.symbol, "weight": float(w[i]), "contributionToRisk": float(w[i] * (vols[i] / max(vols.max(), 1e-12)))} for i, a in enumerate(body.assets)]
    conc.sort(key=lambda x: x["contributionToRisk"], reverse=True)
    sug = [
        {"instrument": "Gold ETF", "rationale": "Low correlation to equities; inflation hedge"},
        {"instrument": "Bond ETF", "rationale": "Reduce portfolio variance and drawdowns"},
        {"instrument": "MSCI World ETF", "rationale": "Geographic diversification"},
    ]
    return {
        "correlationMatrix": corr.tolist(),
        "diversificationScore": div,
        "diversificationCategory": cat,
        "concentrationRisks": conc[:5],
        "hedgeSuggestions": sug,
    }


def prediction_compute(body: PortfolioInput) -> dict[str, Any]:
    w = _current_weights(body.assets)
    mu = np.array([a.expectedReturn for a in body.assets], dtype=np.float64)
    port_r = float(w @ mu)
    v0 = float(sum(a.currentPrice * a.quantity for a in body.assets))
    years = [1, 3, 5, 10]
    statistical: dict[str, Any] = {}
    for y in years:
        base = v0 * ((1.0 + port_r) ** y)
        optimistic = v0 * ((1.0 + port_r * 1.25) ** y)
        pessimistic = v0 * ((1.0 + max(port_r * 0.6, -0.3)) ** y)
        statistical[str(y)] = {"base": base, "optimistic": optimistic, "pessimistic": pessimistic}

    rng = np.random.default_rng(7)
    n_train = 500
    X = rng.uniform(0.02, 0.18, (n_train, len(body.assets)))
    noise = rng.normal(0, 0.02, n_train)
    y_train = X @ mu + noise
    ridge = Ridge(alpha=1.0)
    ridge.fit(X, y_train)
    scores = cross_val_score(ridge, X, y_train, cv=5, scoring="r2")
    model_r2 = float(np.mean(np.maximum(scores, -1.0)))
    feat = w.reshape(1, -1)
    ml_ann_return = float(ridge.predict(feat)[0])
    ml_predictions = {str(y): float(v0 * ((1.0 + ml_ann_return) ** y)) for y in years}

    raw_chart = [{"horizonYears": y, "statisticalBase": statistical[str(y)]["base"], "ml": ml_predictions[str(y)]} for y in years]
    chart_data = pd.DataFrame(raw_chart).to_dict(orient="records")

    return {
        "statisticalPredictions": statistical,
        "mlPredictions": ml_predictions,
        "modelAccuracy": {"r2": model_r2},
        "chartData": chart_data,
    }


def rule_based_recommendations(body: PortfolioInput, analysis: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    analysis = analysis or portfolio_analysis_compute(body)
    rc = analysis.get("riskCategory", "medium")
    hhi = analysis.get("HHI", 0.3)
    vol = analysis.get("volatility", 0.2)
    recs = [
        {
            "priority": 1,
            "category": "risk",
            "action": "Review position sizing vs risk tolerance",
            "rationale": f"Risk score cluster is {rc} with annualized vol {vol:.1%}.",
            "urgency": "medium",
            "estimatedImpact": "Lower tail losses in stress scenarios",
        },
        {
            "priority": 2,
            "category": "diversification",
            "action": "Reduce single-asset dominance" if hhi > 0.35 else "Maintain broad commodity exposure",
            "rationale": f"HHI concentration index is {hhi:.2f}.",
            "urgency": "medium" if hhi > 0.35 else "low",
            "estimatedImpact": "Smoother equity curve",
        },
        {
            "priority": 3,
            "category": "rebalancing",
            "action": "Quarterly rebalance toward policy weights",
            "rationale": "Drift increases tracking error vs strategic mix.",
            "urgency": "low",
            "estimatedImpact": "Improved risk-adjusted returns",
        },
        {
            "priority": 4,
            "category": "hedge",
            "action": "Add inflation-linked or gold sleeve",
            "rationale": "Commodity book benefits from inflation convexity.",
            "urgency": "low",
            "estimatedImpact": "Improved real-return resilience",
        },
        {
            "priority": 5,
            "category": "growth",
            "action": "Scale risk only after core hedges are sized",
            "rationale": f"Horizon {body.duration}y with tolerance {body.riskTolerance}.",
            "urgency": "immediate" if body.riskTolerance == "aggressive" and vol > 0.25 else "low",
            "estimatedImpact": "Better growth/defense balance",
        },
    ]
    return recs


async def ai_recommendation_service(body: PortfolioInput) -> list[dict[str, Any]]:
    analysis = portfolio_analysis_compute(body)
    brief = {
        "currency": body.currency,
        "riskTolerance": body.riskTolerance,
        "durationYears": body.duration,
        "metrics": {k: analysis[k] for k in ("portfolioReturn", "volatility", "sharpeRatio", "riskScore", "riskCategory", "HHI") if k in analysis},
        "assets": [a.model_dump() for a in body.assets],
    }
    if not settings.ANTHROPIC_API_KEY:
        return rule_based_recommendations(body, analysis)
    try:
        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        msg = await client.messages.create(
            model=settings.MODEL,
            max_tokens=2048,
            system=(
                "You are a professional commodity portfolio advisor.\n"
                "Return exactly 5 actionable recommendations as a JSON array only, no markdown.\n"
                'Each item: {"priority":int,"category":"risk|diversification|rebalancing|hedge|growth",'
                '"action":str,"rationale":str,"urgency":"immediate|medium|low","estimatedImpact":str}'
            ),
            messages=[{"role": "user", "content": json.dumps(brief)}],
        )
        text = "".join(b.text for b in msg.content if hasattr(b, "text"))
        s = text.strip()
        if "```json" in s:
            s = s.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in s:
            s = s.split("```", 1)[1].split("```", 1)[0].strip()
        i, j = s.find("["), s.rfind("]")
        if i >= 0 and j > i:
            data = json.loads(s[i : j + 1])
        else:
            data = []
        if isinstance(data, list) and len(data) >= 5:
            return data[:5]
    except Exception as e:
        logger.warning("Claude recommendation fallback: %s", e)
    return rule_based_recommendations(body, analysis)


async def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> None:
    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="CommodityIQ", version="1.0")
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"error": "RATE_LIMITED", "message": "Too many requests", "retryAfter": 30},
    )


origins = ["http://localhost:3000"]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": "1.0"}


@app.exception_handler(ValueError)
async def value_err_handler(request: Request, exc: ValueError) -> JSONResponse:
    return err_validation(str(exc))


@app.post("/ai/portfolio-analysis")
@limiter.limit("120/minute")
async def portfolio_analysis(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        ck = "ciq:pa:" + cache_key(body)
        hit = await cache_get(ck)
        if hit:
            return hit
        out = portfolio_analysis_compute(body)
        await cache_set(ck, out, 30)
        return out
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("portfolio-analysis")
        return err_computation(str(e))


@app.post("/ai/monte-carlo")
@limiter.limit("60/minute")
async def monte_carlo(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        ck = "ciq:mc:" + cache_key(body)
        hit = await cache_get(ck)
        if hit:
            return hit
        out = await run_monte_carlo(body)
        await cache_set(ck, out, 60)
        return out
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("monte-carlo")
        return err_computation(str(e))


@app.post("/ai/efficient-frontier")
@limiter.limit("60/minute")
async def efficient_frontier(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        ck = "ciq:ef:" + cache_key(body)
        hit = await cache_get(ck)
        if hit:
            return hit
        out = await run_efficient_frontier(body)
        await cache_set(ck, out, 60)
        return out
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("efficient-frontier")
        return err_computation(str(e))


@app.post("/ai/rebalance")
@limiter.limit("120/minute")
async def rebalance(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        return rebalance_compute(body)
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("rebalance")
        return err_computation(str(e))


@app.post("/ai/hedge-analysis")
@limiter.limit("120/minute")
async def hedge_analysis(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        return hedge_compute(body)
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("hedge-analysis")
        return err_computation(str(e))


@app.post("/ai/prediction")
@limiter.limit("60/minute")
async def prediction(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        ck = "ciq:pr:" + cache_key(body)
        hit = await cache_get(ck)
        if hit:
            return hit
        out = prediction_compute(body)
        await cache_set(ck, out, 30)
        return out
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("prediction")
        return err_computation(str(e))


@app.post("/ai/recommendation")
@limiter.limit("30/minute")
async def recommendation(request: Request, body: PortfolioInput, _: None = Depends(verify_api_key)) -> Any:
    try:
        ck = "ciq:ai:" + cache_key(body)
        hit = await cache_get(ck)
        if hit:
            return {"recommendations": hit}
        recs = await ai_recommendation_service(body)
        await cache_set(ck, recs, 120)
        return {"recommendations": recs}
    except ValueError as e:
        return err_validation(str(e))
    except Exception as e:
        logger.exception("recommendation")
        return err_computation(str(e))
