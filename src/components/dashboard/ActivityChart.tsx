'use client';

import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { MoreHorizontal } from 'lucide-react';

interface DataPoint {
  day: string;
  cyanVal: number;
  purpleVal: number;
  tasksCompleted: number;
}

const WEEKLY_DATA: DataPoint[] = [
  { day: 'Sun', cyanVal: 20, purpleVal: 15, tasksCompleted: 2 },
  { day: 'Mon', cyanVal: 35, purpleVal: 28, tasksCompleted: 5 },
  { day: 'Tue', cyanVal: 55, purpleVal: 40, tasksCompleted: 8 },
  { day: 'Wed', cyanVal: 48, purpleVal: 65, tasksCompleted: 11 },
  { day: 'Thu', cyanVal: 85, purpleVal: 50, tasksCompleted: 14 },
  { day: 'Fri', cyanVal: 70, purpleVal: 58, tasksCompleted: 9 },
  { day: 'Sat', cyanVal: 95, purpleVal: 72, tasksCompleted: 12 },
];

export const ActivityChart: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG coordinate bounds
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getCoordinates = (val: number, index: number) => {
    const x = paddingX + (index / (WEEKLY_DATA.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (val / 100) * chartHeight;
    return { x, y };
  };

  // Build smooth cubic bezier curve
  const buildSmoothPath = (values: number[]) => {
    const points = values.map((val, i) => getCoordinates(val, i));
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const cyanValues = WEEKLY_DATA.map((d) => d.cyanVal);
  const purpleValues = WEEKLY_DATA.map((d) => d.purpleVal);

  const cyanLinePath = buildSmoothPath(cyanValues);
  const purpleLinePath = buildSmoothPath(purpleValues);

  const firstCyanX = getCoordinates(cyanValues[0], 0).x;
  const lastCyanX = getCoordinates(cyanValues[cyanValues.length - 1], cyanValues.length - 1).x;
  const bottomY = paddingTop + chartHeight;

  const cyanAreaPath = `${cyanLinePath} L ${lastCyanX} ${bottomY} L ${firstCyanX} ${bottomY} Z`;
  const purpleAreaPath = `${purpleLinePath} L ${lastCyanX} ${bottomY} L ${firstCyanX} ${bottomY} Z`;

  const yTicks = [100, 75, 50, 25, 0];

  return (
    <GlassCard
      title="Team Activity & Sprint Velocity: Real-time output curve tracking weekly deliverables"
      className="p-5 flex flex-col justify-between border border-[var(--border)] relative overflow-hidden h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-[var(--text)]">
            Team Activity
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <button
          className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="More chart options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-[180px] sm:h-[200px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Cyan Gradient */}
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>

            {/* Purple Gradient */}
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7F77DD" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7F77DD" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines and Y axis text */}
          {yTicks.map((val) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-[var(--border)]"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-[var(--muted)] font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={cyanAreaPath} fill="url(#cyanGradient)" />
          <path d={purpleAreaPath} fill="url(#purpleGradient)" />

          {/* Glowing Stroke Lines */}
          <path
            d={purpleLinePath}
            fill="none"
            stroke="#7F77DD"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(127,119,221,0.6)]"
          />
          <path
            d={cyanLinePath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
          />

          {/* Interactive Hover Nodes and X axis labels */}
          {WEEKLY_DATA.map((item, idx) => {
            const cyanPt = getCoordinates(item.cyanVal, idx);
            const purplePt = getCoordinates(item.purpleVal, idx);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={item.day}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover area trigger */}
                <rect
                  x={cyanPt.x - 20}
                  y={paddingTop}
                  width="40"
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* X axis Day label */}
                <text
                  x={cyanPt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered
                      ? 'fill-[var(--text)] font-semibold'
                      : 'fill-[var(--muted)]'
                  }`}
                >
                  {item.day}
                </text>

                {/* Vertical hover guide bar */}
                {isHovered && (
                  <line
                    x1={cyanPt.x}
                    y1={paddingTop}
                    x2={cyanPt.x}
                    y2={paddingTop + chartHeight}
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Data point dots */}
                <circle
                  cx={cyanPt.x}
                  cy={cyanPt.y}
                  r={isHovered ? 5 : 3.5}
                  className="fill-[#38BDF8] stroke-[var(--surface)] transition-all"
                  strokeWidth="2"
                />
                <circle
                  cx={purplePt.x}
                  cy={purplePt.y}
                  r={isHovered ? 5 : 3.5}
                  className="fill-[#7F77DD] stroke-[var(--surface)] transition-all"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none rounded-xl p-2 glass-panel border border-[var(--border)] shadow-xl z-20 flex items-center gap-3 text-xs animate-in fade-in"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <span>{WEEKLY_DATA[hoveredIndex].day}:</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Velocity {WEEKLY_DATA[hoveredIndex].cyanVal}%</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Throughput {WEEKLY_DATA[hoveredIndex].purpleVal}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span>Velocity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7F77DD] shadow-sm shadow-indigo-500/50" />
            <span>Completion Rate</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-[var(--muted)]">Weekly Aggregate</span>
      </div>
    </GlassCard>
  );
};

