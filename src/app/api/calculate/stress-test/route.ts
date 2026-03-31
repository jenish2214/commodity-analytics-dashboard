/**
 * API Route: /api/calculate/stress-test
 * 
 * Stress testing endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePortfolioMetrics, PortfolioInput } from '@/lib/pythonRunner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { allocation, totalInvestment, monthlyContribution, investmentHorizon } = body;
    
    if (!allocation || !totalInvestment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const input: PortfolioInput = {
      allocation,
      totalInvestment,
      monthlyContribution: monthlyContribution || 0,
      investmentHorizon: investmentHorizon || 10,
    };
    
    const result = await calculatePortfolioMetrics(input);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    const stress = result.data.stress_test;
    
    return NextResponse.json({
      success: true,
      stressTest: {
        marketCrash: stress.scenarios.market_crash,
        inflationSpike: stress.scenarios.inflation_spike,
        interestRateRise: stress.scenarios.interest_rate_rise,
        geopoliticalCrisis: stress.scenarios.geopolitical_crisis,
        pandemicScenario: stress.scenarios.pandemic_scenario,
        worstCase: stress.scenarios.worst_case,
      },
      summary: stress.summary,
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
