import React from "react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  tone: "danger" | "warning" | "success" | "neutral";
};

const toneStyles: Record<StatCardProps["tone"], string> = {
  danger: "from-red-500/18 to-red-500/3 border-red-500/20",
  warning: "from-amber-500/18 to-amber-500/3 border-amber-500/20",
  success: "from-emerald-500/18 to-emerald-500/3 border-emerald-500/20",
  neutral: "from-sky-500/18 to-sky-500/3 border-sky-500/20",
};

export default function StatCard({
  title,
  value,
  change,
  tone,
}: StatCardProps) {
  return (
    <article
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-lg shadow-slate-950/5 ${toneStyles[tone]}`}
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-4xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
          {change}
        </p>
      </div>
    </article>
  );
}
