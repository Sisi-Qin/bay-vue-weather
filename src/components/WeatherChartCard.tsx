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
} from "recharts";
import type { WeatherDay } from "@/lib/weather-data";

type Props = {
  title: string;
  unit: string;
  dataKey: "minTemp" | "maxTemp" | "rainChance";
  data: WeatherDay[];
  variant: "marine" | "amber" | "deep";
  domain?: [number | "auto", number | "auto"];
};

const strokes: Record<Props["variant"], string> = {
  marine: "var(--marine)",
  amber: "var(--amber)",
  deep: "var(--deep)",
};

export function WeatherChartCard({ title, unit, dataKey, data, variant, domain }: Props) {
  const color = strokes[variant];
  const axis = {
    stroke: "var(--haze)",
    tick: { fill: "var(--slateblue)", fontSize: 10, fontFamily: "var(--font-mono)" },
    tickLine: false,
  } as const;

  return (
    <section className="rounded-xl bg-panel p-4 ring-1 ring-deep/5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-deep">{title}</h2>
        <span className="font-mono text-[10px] text-slateblue">{unit} · 30d</span>
      </div>
      <div className="grid-ticks h-36 w-full overflow-hidden rounded-md bg-mist/40">
        <ResponsiveContainer width="100%" height="100%">
          {dataKey === "rainChance" ? (
            <BarChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="var(--haze)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="label" interval={9} {...axis} />
              <YAxis domain={[0, 100]} {...axis} />
              <Tooltip
                cursor={{ fill: "var(--haze)", fillOpacity: 0.25 }}
                contentStyle={{
                  background: "var(--mist)",
                  border: "1px solid var(--haze)",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--deep)",
                }}
              />
              <Bar dataKey={dataKey} fill={color} fillOpacity={0.55} radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--haze)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="label" interval={9} {...axis} />
              <YAxis domain={domain ?? ["auto", "auto"]} {...axis} />
              <Tooltip
                cursor={{ stroke: "var(--haze)" }}
                contentStyle={{
                  background: "var(--mist)",
                  border: "1px solid var(--haze)",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--deep)",
                }}
              />
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
