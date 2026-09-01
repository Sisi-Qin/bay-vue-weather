import { createFileRoute } from "@tanstack/react-router";
import { WeatherChartCard } from "@/components/WeatherChartCard";
import { summary, weatherDays } from "@/lib/weather-data";

const title = "Bay Area Weather Dashboard — 30-Day Readings";
const description =
  "A frontend dashboard of Bay Area weather: 30 days of min temperature, max temperature, chance of rain, and a daily readings table.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-panel px-4 py-2.5 ring-1 ring-deep/5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-slateblue">{label}</div>
      <div
        className={`font-mono text-lg font-semibold ${accent ? "text-marine" : "text-deep"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-mist text-deep">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-fog/60 to-transparent" />
      <div className="relative mx-auto max-w-[1200px] px-5 py-8">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-haze/50 pb-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-marine" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slateblue">
                Station 74200 · Marin Coast
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Bay Area Weather</h1>
            <p className="mt-1 font-mono text-xs text-slateblue">
              Last 30 days · San Francisco · 37.77°N 122.42°W
            </p>
          </div>
          <div className="flex gap-3">
            <Stat label="Mean Hi" value={`${summary.meanHi}°`} />
            <Stat label="Mean Lo" value={`${summary.meanLo}°`} />
            <Stat label="Rain Days" value={String(summary.rainDays)} accent />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <WeatherChartCard
            title="Min Temp"
            unit="°F"
            dataKey="minTemp"
            data={weatherDays}
            variant="marine"
            domain={[45, "auto"]}
          />
          <WeatherChartCard
            title="Max Temp"
            unit="°F"
            dataKey="maxTemp"
            data={weatherDays}
            variant="amber"
            domain={[50, "auto"]}
          />
          <WeatherChartCard
            title="Chance of Rain"
            unit="%"
            dataKey="rainChance"
            data={weatherDays}
            variant="deep"
          />
        </div>

        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-deep">Daily Readings</h2>
            <span className="font-mono text-[10px] text-slateblue">
              {weatherDays.length} records · scroll
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-xl bg-panel ring-1 ring-deep/5">
            <table className="w-full font-mono text-xs">
              <thead className="sticky top-0 bg-fog/80 text-slateblue">
                <tr className="text-left text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Weather</th>
                  <th className="px-4 py-2 text-right font-medium">Min</th>
                  <th className="px-4 py-2 text-right font-medium">Max</th>
                  <th className="px-4 py-2 text-right font-medium">Rain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-haze/30 text-deep">
                {weatherDays.map((day, i) => (
                  <tr key={day.date} className={i % 2 === 0 ? "bg-mist/20" : undefined}>
                    <td className="px-4 py-1.5">{day.date}</td>
                    <td className="px-4 py-1.5">{day.weather}</td>
                    <td className="px-4 py-1.5 text-right">{day.minTemp}</td>
                    <td className="px-4 py-1.5 text-right">{day.maxTemp}</td>
                    <td
                      className={`px-4 py-1.5 text-right ${
                        day.rainChance >= 50 ? "text-deep" : "text-marine"
                      }`}
                    >
                      {day.rainChance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 flex items-center justify-between border-t border-haze/50 pt-4 font-mono text-[10px] text-slateblue">
          <span>Marine Observatory · readout 04:12 local</span>
          <span>Frontend prototype · dummy data</span>
        </footer>
      </div>
    </div>
  );
}
