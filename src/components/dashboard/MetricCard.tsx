import React from "react";

interface AreaStatCardProps {
  title: string;
  subtitle: string;
  total: number | string;
  badgeLabel?: string;
  dotColor?: string;
}

const MetricCard: React.FC<AreaStatCardProps> = ({
  title,
  subtitle,
  total,
  badgeLabel,
  dotColor = "bg-sky-600",
}) => {
  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-col gap-2 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-3 h-3 rounded-full ${dotColor}`} />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
        {subtitle}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Total: {total}
        </span>
        {badgeLabel && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
            {badgeLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
