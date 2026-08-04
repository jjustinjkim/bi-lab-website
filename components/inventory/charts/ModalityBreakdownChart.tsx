"use client";

import { modalityLabel, modalityColorVar } from "@/lib/inventory/modality";
import HorizontalBarChart from "./HorizontalBarChart";

export default function ModalityBreakdownChart({
  data,
}: {
  data: { modality: string; count: number }[];
}) {
  const chartData = data.map((d) => ({ label: modalityLabel(d.modality), count: d.count }));
  const colors = data.map((d) => modalityColorVar(d.modality));
  return <HorizontalBarChart data={chartData} tooltipLabel="Datasets" colors={colors} />;
}
