import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WeatherReading } from '@/Interfaces';

type ChartVariant = 'marine' | 'amber' | 'deep';

interface WeatherChartCardProps {
  title: string;
  unit: string;
  dataKey: 'minTemp' | 'maxTemp' | 'rainChance';
  data: WeatherReading[];
  variant: ChartVariant;
  domain?: [number | 'auto', number | 'auto'];
}

const strokes: Record<ChartVariant, string> = {
  marine: '#2563eb',
  amber: '#d97706',
  deep: '#0f172a',
};

export default function WeatherChartCard({
  title,
  unit,
  dataKey,
  data,
  variant,
  domain,
}: WeatherChartCardProps) {
  const color = strokes[variant];
  const axis = {
    stroke: 'var(--color-border-weak, #cbd5e1)',
    tick: { fill: 'var(--color-text-secondary, #64748b)', fontSize: 10 },
    tickLine: false,
  } as const;

  const tooltipStyle = {
    background: 'var(--color-bg-card, #ffffff)',
    border: '1px solid var(--color-border-weak, #cbd5e1)',
    borderRadius: 8,
    fontSize: 11,
    color: 'var(--color-text-primary, #0f172a)',
  } as const;

  return (
    <section className="c3-card rounded-xl border border-weak bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        <span className="text-[10px] text-secondary">{unit} · 30d</span>
      </div>
      <div className="h-36 w-full overflow-hidden rounded-md">
        <ResponsiveContainer width="100%" height="100%">
          {dataKey === 'rainChance' ? (
            <BarChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="var(--color-border-weak, #e2e8f0)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="label" interval={9} {...axis} />
              <YAxis domain={[0, 100]} {...axis} />
              <Tooltip cursor={{ fill: '#94a3b8', fillOpacity: 0.15 }} contentStyle={tooltipStyle} />
              <Bar dataKey={dataKey} fill={color} fillOpacity={0.6} radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border-weak, #e2e8f0)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="label" interval={9} {...axis} />
              <YAxis domain={domain ?? ['auto', 'auto']} {...axis} />
              <Tooltip cursor={{ stroke: '#94a3b8' }} contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#fill-${dataKey})`}
                dot={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
