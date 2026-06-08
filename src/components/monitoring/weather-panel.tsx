"use client"
import { useCallback, useEffect, useState } from "react"
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler,
} from "chart.js"
import type { ScriptableLineSegmentContext, ChartType } from "chart.js"
import { Line } from "react-chartjs-2"
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow,
  CloudLightning, Thermometer, Droplets, RefreshCw, MapPin, AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { GREENHOUSE_LOCATION } from "@/lib/constants"
import {
  fetchGreenhouseWeather, loadCachedWeather, saveCachedWeather,
  weatherCodeLabel, weatherCodeKind,
  type WeatherData, type WeatherKind,
} from "@/lib/weather"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

// Custom option for the "Now" marker plugin (read from chart options so it updates on re-render)
declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    nowMarker?: { nowIndex: number }
  }
}

// Draws the "Now" divider and shades the forecast region. Reads `nowIndex` from
// options each draw, so changing the range (6h/12h/24h) redraws it correctly.
const nowMarkerPlugin = {
  id: "nowMarker",
  beforeDatasetsDraw(chart: ChartJS, _args: unknown, opts: { nowIndex?: number }) {
    const nowIndex = opts?.nowIndex
    const area = chart.chartArea
    const xScale = chart.scales.x
    if (nowIndex == null || !area || !xScale) return
    const x = xScale.getPixelForValue(nowIndex)
    const c = chart.ctx
    c.save()
    c.fillStyle = "rgba(15,23,42,0.05)"
    c.fillRect(x, area.top, area.right - x, area.bottom - area.top)
    c.beginPath()
    c.setLineDash([4, 4]); c.lineWidth = 1; c.strokeStyle = "rgba(15,23,42,0.35)"
    c.moveTo(x, area.top); c.lineTo(x, area.bottom); c.stroke()
    c.setLineDash([])
    c.fillStyle = "rgba(15,23,42,0.55)"; c.font = "600 10px -apple-system, sans-serif"
    c.fillText("Now", x + 4, area.top + 11)
    c.restore()
  },
}

const kindIcon: Record<WeatherKind, typeof Sun> = {
  clear: Sun, partly: CloudSun, cloudy: Cloud, fog: CloudFog,
  drizzle: CloudDrizzle, rain: CloudRain, snow: CloudSnow, storm: CloudLightning,
}

function hourLabel(iso: string) {
  return iso.slice(11, 16) // "HH:MM"
}

const FUTURE_HOURS = 3
const RANGE_OPTIONS = [6, 12, 24] as const
type RangeHours = (typeof RANGE_OPTIONS)[number]

export function WeatherPanel() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rangeHours, setRangeHours] = useState<RangeHours>(24)

  // Hit the network only on demand (refresh / load button), then cache the result.
  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchGreenhouseWeather()
      .then(d => {
        setData(d)
        setFetchedAt(saveCachedWeather(d))
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load weather")
        setLoading(false)
      })
  }, [])

  // On mount, restore from browser storage. Only hit the API if there's nothing saved.
  // Runs once; `refresh` is a stable useCallback so it's safe to omit from deps.
  useEffect(() => {
    const cached = loadCachedWeather()
    if (cached) {
      setData(cached.data)
      setFetchedAt(cached.fetchedAt)
    } else {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // No cached data and nothing in flight → prompt the user to load (still no auto-request).
  if (!data && !loading) {
    return (
      <Card>
        <CardContent className="py-8 flex flex-col items-center text-center gap-3">
          <Cloud size={26} className="text-slate-300" />
          <div>
            <p className="text-[13px] font-semibold text-slate-700">Outside weather not loaded</p>
            <p className="text-[12px] text-slate-400 mt-0.5 max-w-[280px]">
              Weather isn&apos;t fetched automatically. Load the latest conditions when you need them.
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-[12px] font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <RefreshCw size={13} /> Load weather
          </button>
          {error && (
            <p className="flex items-center gap-1.5 text-[12px] text-red-500">
              <AlertTriangle size={13} /> {error}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="py-10 flex items-center justify-center gap-2 text-slate-400 text-[13px]">
          <RefreshCw size={15} className="animate-spin" /> Loading outside weather…
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { now, hourly, units } = data
  const Icon = kindIcon[weatherCodeKind(now.weatherCode)]

  // Locate the current hour, then take `rangeHours` of history + FUTURE_HOURS of forecast
  const after = hourly.time.findIndex(t => t > now.time)
  const nowAbs = after === -1 ? hourly.time.length - 1 : Math.max(0, after - 1)
  const start = Math.max(0, nowAbs - (rangeHours - 1))
  const end = Math.min(hourly.time.length, nowAbs + FUTURE_HOURS + 1)
  const nowRel = nowAbs - start // index of "now" within the sliced window

  const labels = hourly.time.slice(start, end).map(hourLabel)
  const temps = hourly.temperature.slice(start, end)
  const hums = hourly.humidity.slice(start, end)

  // Dash the segments that lie in the future; dot the forecast points
  const dashFuture = (ctx: ScriptableLineSegmentContext) => (ctx.p0DataIndex >= nowRel ? [6, 4] : [])
  const futureDots = (arr: number[]) => arr.map((_, i) => (i > nowRel ? 3 : 0))

  const chartData = {
    labels,
    datasets: [
      {
        label: `Temp (${units.temperature})`, data: temps, yAxisID: "y",
        borderColor: "rgb(234,88,12)", backgroundColor: "rgba(234,88,12,0.08)",
        tension: 0.35, fill: true, borderWidth: 2,
        pointRadius: futureDots(temps), pointBackgroundColor: "rgb(234,88,12)",
        segment: { borderDash: dashFuture },
      },
      {
        label: `Humidity (${units.humidity})`, data: hums, yAxisID: "y1",
        borderColor: "rgb(37,99,235)", backgroundColor: "rgba(37,99,235,0.06)",
        tension: 0.35, fill: true, borderWidth: 2,
        pointRadius: futureDots(hums), pointBackgroundColor: "rgb(37,99,235)",
        segment: { borderDash: dashFuture },
      },
    ],
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-2 rounded-[12px] bg-black/[0.04]">
            <Icon size={22} className="text-slate-700" />
          </div>
          <div>
            <CardTitle>Outside Weather — {weatherCodeLabel(now.weatherCode)}</CardTitle>
            <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <MapPin size={11} /> {GREENHOUSE_LOCATION.label}
              {fetchedAt && <> · saved {new Date(fetchedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</>}
            </p>
            {error && (
              <p className="flex items-center gap-1 text-[11px] text-red-500 mt-0.5">
                <AlertTriangle size={10} /> Couldn&apos;t refresh — showing saved data
              </p>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="shrink-0 text-slate-400 hover:text-slate-700 p-1.5 rounded-[8px] hover:bg-black/[0.05] transition-colors disabled:opacity-50"
          aria-label="Refresh weather"
          title="Refresh from Open-Meteo"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Thermometer size={16} className="text-orange-600" />} iconBg="rgba(234,88,12,0.12)" label="Air Temperature" value={`${now.temperature}${units.temperature}`} sub={weatherCodeLabel(now.weatherCode)} />
          <StatCard icon={<Droplets size={16} className="text-blue-600" />} iconBg="rgba(37,99,235,0.12)" label="Humidity" value={`${now.humidity}${units.humidity}`} />
          <StatCard icon={<CloudRain size={16} className="text-sky-600" />} iconBg="rgba(2,132,199,0.12)" label="Rain" value={`${now.rain} ${units.rain}`} sub="last hour" />
          <StatCard icon={<Cloud size={16} className="text-slate-500" />} iconBg="rgba(100,116,139,0.12)" label="Cloud Cover" value={`${now.cloudCover}${units.cloudCover}`} />
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em]">
              Past {rangeHours}h · next {FUTURE_HOURS}h forecast
            </p>
            <div className="flex gap-0.5 bg-black/[0.05] p-0.5 rounded-[9px] border border-black/[0.04]">
              {RANGE_OPTIONS.map(h => (
                <button
                  key={h}
                  onClick={() => setRangeHours(h)}
                  className={`px-2.5 py-1 rounded-[7px] text-[11px] font-medium transition-colors ${
                    rangeHours === h
                      ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-slate-800"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* What the lines mean */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 align-middle border-t-2 border-slate-400" /> Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 align-middle border-t-2 border-dashed border-slate-400" /> Forecast (next {FUTURE_HOURS}h)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-[3px] bg-slate-200" /> Predicted window
            </span>
          </div>

          <div style={{ height: 210 }}>
            <Line
              data={chartData}
              plugins={[nowMarkerPlugin]}
              options={{
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                  nowMarker: { nowIndex: nowRel },
                  legend: { display: true, labels: { boxWidth: 10, font: { size: 11 }, usePointStyle: true } },
                  tooltip: {
                    callbacks: {
                      title: items => {
                        const i = items[0]?.dataIndex ?? 0
                        return `${labels[i]}${i > nowRel ? "  · forecast" : ""}`
                      },
                    },
                  },
                },
                scales: {
                  x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
                  y: { position: "left", title: { display: true, text: `Temp (${units.temperature})` }, grid: { color: "rgba(0,0,0,0.04)" } },
                  y1: { position: "right", title: { display: true, text: `Humidity (${units.humidity})` }, min: 0, max: 100, grid: { drawOnChartArea: false } },
                },
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
