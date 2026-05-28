// Change to 'http://localhost:8000' before committing
const MONITORING_BASE = 'http://192.168.0.116:8000'

export interface SystemMetrics {
  cpu: {
    percent: number
    temp_celsius: number | null
    freq_mhz: number | null
  }
  ram: {
    percent: number
    used_gb: number
    total_gb: number
  }
  disk: {
    percent: number
    used_gb: number
    total_gb: number
  }
  network: {
    upload_mbs: number
    download_mbs: number
  }
  uptime_seconds: number
  os_name?: string
}

export interface MinecraftStatus {
  online: boolean
  players_online?: number
  players_max?: number
  players?: string[]
  latency_ms?: number
  motd?: string
}

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${MONITORING_BASE}/system`)
  if (!res.ok) throw new Error(`System metrics fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchMinecraftStatus(): Promise<MinecraftStatus> {
  const res = await fetch(`${MONITORING_BASE}/minecraft`)
  if (!res.ok) throw new Error(`Minecraft status fetch failed: ${res.status}`)
  return res.json()
}
