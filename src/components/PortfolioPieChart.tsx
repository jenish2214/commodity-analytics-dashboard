"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationSlice } from "@/types/models";

const COLORS = ["#0b1f33", "#1db954", "#334155", "#64748b"];

type Props = {
  data: AllocationSlice[];
};

export function PortfolioPieChart({ data }: Props) {
  const chartData = data.map((d) => ({ name: d.label, value: d.percent }));

  return (
    <div className="ca-chart-wrap" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={96}
            paddingAngle={2}
            isAnimationActive
            animationDuration={500}
          >
            {chartData.map((_, i) => (
              <Cell key={chartData[i].name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Allocation"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
