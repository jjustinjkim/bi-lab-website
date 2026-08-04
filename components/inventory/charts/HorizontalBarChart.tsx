"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const CATEGORICAL = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
  "var(--cat-7)",
  "var(--cat-8)",
];

export default function HorizontalBarChart({
  data,
  labelWidth = 170,
  tooltipLabel = "Count",
  colors,
}: {
  data: { label: string; count: number }[];
  labelWidth?: number;
  tooltipLabel?: string;
  colors?: string[];
}) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const effectiveLabelWidth = narrow ? Math.min(labelWidth, 96) : labelWidth;

  return (
    <div className="w-full" style={{ height: Math.max(220, data.length * 32) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: narrow ? 24 : 40, bottom: 4, left: 4 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            stroke="var(--hairline-strong)"
          />
          <YAxis
            type="category"
            dataKey="label"
            width={effectiveLabelWidth}
            tick={{ fontSize: narrow ? 10 : 12, fill: "var(--foreground)" }}
            tickFormatter={(label: string) =>
              narrow && label.length > 16 ? `${label.slice(0, 15)}…` : label
            }
            stroke="var(--hairline-strong)"
          />
          <Tooltip
            formatter={(value) => [`${value}`, tooltipLabel]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 3,
              border: "1px solid var(--hairline-strong)",
              background: "var(--paper-raised)",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 2 }}
            itemStyle={{ color: "var(--foreground)" }}
            cursor={{ fill: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={16}>
            {data.map((entry, i) => (
              <Cell key={entry.label} fill={colors?.[i] ?? CATEGORICAL[i % CATEGORICAL.length]} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 11, fill: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
