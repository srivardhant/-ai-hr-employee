'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

/* ────────────── Color Palette ────────────── */

const COLORS = [
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#ec4899', // pink
  '#14b8a6', // teal
];

/* ────────────── Custom Tooltip ────────────── */

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700/50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ────────────── Shared Props ────────────── */

interface ChartDataItem {
  name: string;
  [key: string]: string | number;
}

interface ChartWidgetProps {
  title: string;
  data: ChartDataItem[];
  className?: string;
}

/* ────────────── Bar Chart ────────────── */

export function BarChartWidget({ title, data, className = '' }: ChartWidgetProps) {
  const keys = Object.keys(data[0] || {}).filter((k) => k !== 'name');

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
            />
            {keys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ────────────── Line Chart ────────────── */

export function LineChartWidget({ title, data, className = '' }: ChartWidgetProps) {
  const keys = Object.keys(data[0] || {}).filter((k) => k !== 'name');

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ────────────── Pie Chart ────────────── */

interface PieDataItem {
  name: string;
  value: number;
}

interface PieChartWidgetProps {
  title: string;
  data: PieDataItem[];
  className?: string;
}

export function PieChartWidget({ title, data, className = '' }: PieChartWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ────────────── Area Chart ────────────── */

export function AreaChartWidget({ title, data, className = '' }: ChartWidgetProps) {
  const keys = Object.keys(data[0] || {}).filter((k) => k !== 'name');

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              {keys.map((key, i) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                fill={`url(#gradient-${key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
