import React from "react";

interface AreaLevelDonutChartProps {
  title: string;
  labels: string[];
  series: number[];
  colors?: string[];
  autoColorSeed?: number;
}

const DonutChartCard: React.FC<AreaLevelDonutChartProps> = ({
  title,
  labels,
  series,
  colors,
  autoColorSeed = 0,
}) => {
  const rawTotal = series.reduce((acc, n) => acc + n, 0);

  // Detectar modo oscuro leyendo la clase "dark" en <html>
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const generatePalette = (count: number, seed: number): string[] => {
    if (count <= 0) return [];

    const baseOffset = (seed * 47) % 360;

    return Array.from({ length: count }, (_, i) => {
      const hue = (baseOffset + (360 / count) * i) % 360;
      const saturation = 70;
      // Un poco más claro en dark mode para que resalte sin quemar
      const lightness = isDark ? 65 : 55;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  };

  const palette =
    colors && colors.length > 0
      ? colors
      : generatePalette(labels.length, autoColorSeed);

  let background = "#E5E7EB";

  if (rawTotal > 0) {
    let currentAngle = 0;
    const segments: string[] = series.map((value, i) => {
      const angle = (value / rawTotal) * 360;
      const start = currentAngle;
      const end = currentAngle + angle;
      currentAngle = end;
      const color = palette[i % palette.length];
      return `${color} ${start}deg ${end}deg`;
    });

    background = `conic-gradient(${segments.join(", ")})`;
  }

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 px-6 py-5 flex flex-col transition-colors mx-auto">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">
        {title}
      </h3>

      <div className="flex items-center gap-8">
        {/* Donut */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{ background }}
          />
          <div className="absolute inset-6 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400">Total</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {rawTotal}
            </span>
          </div>
        </div>

        {/* Leyenda */}
        <ul className="space-y-1 text-xs">
          {labels.map((label, i) => {
            const value = series[i] ?? 0;
            const percent =
              rawTotal > 0 ? Math.round((value / rawTotal) * 100) : 0;
            const color = palette[i % palette.length];

            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-800 dark:text-slate-100">
                  {label}
                </span>
                <span className="ml-2 text-slate-500 dark:text-slate-400">
                  {value} ({percent}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default DonutChartCard;
