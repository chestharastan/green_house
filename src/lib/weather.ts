import { GREENHOUSE_LOCATION } from "@/lib/constants"

export interface WeatherNow {
  time: string
  temperature: number   // °C
  humidity: number      // %
  rain: number          // mm
  cloudCover: number    // %
  weatherCode: number   // WMO code
}

export interface WeatherHourly {
  time: string[]
  temperature: number[]
  humidity: number[]
  rain: number[]
}

export interface WeatherData {
  now: WeatherNow
  hourly: WeatherHourly
  units: { temperature: string; humidity: string; rain: string; cloudCover: string }
}

const HOURLY_VARS = "temperature_2m,relative_humidity_2m,rain,weather_code,cloud_cover"

/**
 * Live conditions for the greenhouse from Open-Meteo.
 * Pulls `current` plus a 48h window (yesterday + today) of hourly data for trends.
 * Docs: https://open-meteo.com/en/docs
 */
export async function fetchGreenhouseWeather(signal?: AbortSignal): Promise<WeatherData> {
  const { latitude, longitude } = GREENHOUSE_LOCATION
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: HOURLY_VARS,
    hourly: HOURLY_VARS,
    timezone: "auto",
    past_days: "1",
    forecast_days: "2",
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal })
  if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`)
  const json = await res.json()

  const c = json.current
  const h = json.hourly
  const cu = json.current_units ?? {}

  return {
    now: {
      time: c.time,
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      rain: c.rain,
      cloudCover: c.cloud_cover,
      weatherCode: c.weather_code,
    },
    hourly: {
      time: h.time,
      temperature: h.temperature_2m,
      humidity: h.relative_humidity_2m,
      rain: h.rain,
    },
    units: {
      temperature: cu.temperature_2m ?? "°C",
      humidity: cu.relative_humidity_2m ?? "%",
      rain: cu.rain ?? "mm",
      cloudCover: cu.cloud_cover ?? "%",
    },
  }
}

const STORAGE_KEY = "greenhouse.weather.v1"

export interface CachedWeather {
  data: WeatherData
  fetchedAt: number // epoch ms
}

/** Read the last saved weather snapshot from the browser. Returns null if none/invalid. */
export function loadCachedWeather(): CachedWeather | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedWeather
    if (!parsed?.data?.now || !parsed.fetchedAt) return null
    return parsed
  } catch {
    return null
  }
}

/** Persist a weather snapshot to the browser, stamped with the current time. */
export function saveCachedWeather(data: WeatherData): number {
  const fetchedAt = Date.now()
  if (typeof window === "undefined") return fetchedAt
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, fetchedAt }))
  } catch {
    /* storage full or unavailable — ignore */
  }
  return fetchedAt
}

/** WMO weather interpretation codes → short label. */
export function weatherCodeLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Violent showers",
    85: "Snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm, hail",
    99: "Thunderstorm, hail",
  }
  return map[code] ?? "—"
}

/** Coarse bucket for picking an icon. */
export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm"

export function weatherCodeKind(code: number): WeatherKind {
  if (code === 0) return "clear"
  if (code === 1 || code === 2) return "partly"
  if (code === 3) return "cloudy"
  if (code === 45 || code === 48) return "fog"
  if (code >= 51 && code <= 57) return "drizzle"
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain"
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow"
  if (code >= 95) return "storm"
  return "cloudy"
}
