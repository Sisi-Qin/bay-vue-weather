/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { c3Action } from '@/c3Action';
import { WeatherReading } from '@/Interfaces';
import WeatherChartCard from '@/components/WeatherChartCard/WeatherChartCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-weak bg-card px-4 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-secondary">{label}</div>
      <div className={`text-lg font-semibold ${accent ? 'text-accent' : 'text-primary'}`}>{value}</div>
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { reportError } = useErrorBoundary();
  const [days, setDays] = useState<WeatherReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await c3Action('WeatherReading', 'fetch', {
          include: 'this',
          order: 'ascending(id)',
          limit: 100,
        });
        if (!cancelled) setDays((res?.objs ?? []) as WeatherReading[]);
      } catch (err) {
        if (!cancelled) reportError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportError]);

  const summary = useMemo(() => {
    if (days.length === 0) return { meanHi: '—', meanLo: '—', rainDays: 0 };
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    return {
      meanHi: mean(days.map((d) => d.maxTemp)).toFixed(1),
      meanLo: mean(days.map((d) => d.minTemp)).toFixed(1),
      rainDays: days.filter((d) => d.rainChance >= 50).length,
    };
  }, [days]);

  return (
    <div className="min-h-full bg-primary text-primary">
      <div className="relative mx-auto max-w-[1200px] px-5 py-8">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-weak pb-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-accent" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-secondary">
                Station 74200 · Marin Coast
              </span>
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Bay Area Weather</h1>
            <p className="mt-1 text-xs text-secondary">Last 30 days · San Francisco · 37.77°N 122.42°W</p>
          </div>
          <div className="flex gap-3">
            <Stat label="Mean Hi" value={loading ? '—' : `${summary.meanHi}°`} />
            <Stat label="Mean Lo" value={loading ? '—' : `${summary.meanLo}°`} />
            <Stat label="Rain Days" value={loading ? '—' : String(summary.rainDays)} accent />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-52 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <WeatherChartCard
              title="Min Temp"
              unit="°F"
              dataKey="minTemp"
              data={days}
              variant="marine"
              domain={[45, 'auto']}
            />
            <WeatherChartCard
              title="Max Temp"
              unit="°F"
              dataKey="maxTemp"
              data={days}
              variant="amber"
              domain={[50, 'auto']}
            />
            <WeatherChartCard title="Chance of Rain" unit="%" dataKey="rainChance" data={days} variant="deep" />
          </div>
        )}

        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">Daily Readings</h2>
            <span className="text-[10px] text-secondary">{days.length} records · scroll</span>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-weak bg-card">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card text-secondary">
                <tr className="text-left text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Weather</th>
                  <th className="px-4 py-2 text-right font-medium">Min</th>
                  <th className="px-4 py-2 text-right font-medium">Max</th>
                  <th className="px-4 py-2 text-right font-medium">Rain</th>
                </tr>
              </thead>
              <tbody className="text-primary">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-secondary">
                      Loading readings…
                    </td>
                  </tr>
                ) : (
                  days.map((day) => (
                    <tr key={day.id} className="border-t border-weak">
                      <td className="px-4 py-1.5">{day.date}</td>
                      <td className="px-4 py-1.5">{day.weather}</td>
                      <td className="px-4 py-1.5 text-right">{day.minTemp}</td>
                      <td className="px-4 py-1.5 text-right">{day.maxTemp}</td>
                      <td className={`px-4 py-1.5 text-right ${day.rainChance >= 50 ? 'text-danger' : 'text-accent'}`}>
                        {day.rainChance}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 flex items-center justify-between border-t border-weak pt-4 text-[10px] text-secondary">
          <span>Marine Observatory · Bay Area Weather Watch</span>
          <span>Data from C3 WeatherReading entity</span>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
