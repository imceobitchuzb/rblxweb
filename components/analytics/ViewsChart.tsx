"use client";

import * as React from "react";
import { Eye, Info } from "lucide-react";
import { TimeSeriesDataPoint } from "@/lib/types";
import { formatCompactNumber, formatNumber } from "@/lib/analytics-utils";

interface ViewsChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
  timeRangeLabel?: string;
}

export function ViewsChart({
  data,
  title = "Views Over Time",
  timeRangeLabel,
}: ViewsChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <Eye className="w-8 h-8 text-slate-600" />
        <h4 className="text-sm font-bold text-slate-300">{title}</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          No published video views found for the selected time range and platform.
        </p>
      </div>
    );
  }

  // Calculate scales for SVG
  const maxViews = Math.max(...data.map((d) => d.views), 1000);
  const chartHeight = 200;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Generate points
  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? chartWidth / 2
        : paddingX + (i / (data.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (d.views / maxViews) * innerHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  // Area path for subtle gradient fill
  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : "";

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </h3>
        </div>
        {timeRangeLabel && (
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
            {timeRangeLabel}
          </span>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full aspect-[2.4/1] min-h-[220px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.33, 0.66, 1].map((ratio) => {
            const y = chartHeight - paddingY - ratio * innerHeight;
            const valueLabel = formatCompactNumber(Math.round(ratio * maxViews));
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[9px] font-mono select-none"
                >
                  {valueLabel}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#viewsGradient)" />}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx}>
                {/* Invisible hover hitbox */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Visible node point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "5" : "3.5"}
                  className="transition-all duration-150"
                  fill={isHovered ? "#ffffff" : "#06b6d4"}
                  stroke="#083344"
                  strokeWidth="2"
                />

                {/* X-axis date labels */}
                <text
                  x={pt.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono select-none"
                >
                  {pt.data.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 p-2.5 rounded-xl glass-panel bg-surface-canvas/95 border border-cyan-500/30 shadow-xl z-20 text-xs space-y-1 backdrop-blur-md"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
              <span className="font-bold text-white">{hoveredPoint.data.label}</span>
              <span>{hoveredPoint.data.videoCount} video(s)</span>
            </div>
            <div className="text-sm font-black text-cyan-400 font-mono">
              {formatNumber(hoveredPoint.data.views)} views
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>{formatNumber(hoveredPoint.data.likes)} likes</span>
              <span>•</span>
              <span>{hoveredPoint.data.engagementRate}% eng</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
