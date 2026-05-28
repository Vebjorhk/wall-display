import type { ReactNode } from 'react'
import type { SystemMetrics } from '../../api/monitoring.ts'

function MiniBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ width: 80, height: 8, background: 'var(--card-border)', flexShrink: 0 }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(percent, 100)}%`, background: color, transition: 'width 0.6s ease' }}
      />
    </div>
  )
}

function Divider() {
  return (
    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--card-border)', flexShrink: 0 }} />
  )
}

function StatLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 5s ease' }}>
      {children}
    </span>
  )
}

function StatValue({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        color: color ?? 'var(--text-primary)',
        fontSize: '1rem',
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        transition: 'color 5s ease',
      }}
    >
      {children}
    </span>
  )
}

function tempColor(temp: number | null): string {
  if (temp === null) return 'var(--text-secondary)'
  if (temp <= 60) return '#22c55e'
  if (temp <= 80) return '#eab308'
  return '#ef4444'
}

export function SystemMonitorWidget({ metrics }: { metrics: SystemMetrics | null }) {
  const cpu  = metrics?.cpu
  const ram  = metrics?.ram
  const net  = metrics?.network
  const disk = metrics?.disk

  const fmt = (n: number | null | undefined, dec = 1): string =>
    n == null ? '--' : n.toFixed(dec)

  return (
    <div
      className="rounded-xl flex items-stretch overflow-hidden w-full"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', transition: 'background-color 5s ease' }}
    >
      {/* OS — leftmost */}
      <div className="flex items-center gap-2 px-5 py-4">
        <StatLabel>OS</StatLabel>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 400, whiteSpace: 'nowrap', transition: 'color 5s ease' }}>
          {metrics?.os_name ?? '—'}
        </span>
      </div>
      <Divider />

      {/* Stats group — expands to fill */}
      <div className="flex items-center flex-1">

        {/* CPU */}
        <div className="flex items-center gap-3 px-5 py-4">
          <StatLabel>CPU</StatLabel>
          <StatValue color={cpu ? tempColor(cpu.temp_celsius) : undefined}>
            {cpu?.temp_celsius != null ? `${fmt(cpu.temp_celsius, 0)}°C` : '--°C'}
          </StatValue>
          <StatValue>{fmt(cpu?.percent, 0)}%</StatValue>
        </div>

        <Divider />

        {/* RAM */}
        <div className="flex items-center gap-3 px-5 py-4">
          <StatLabel>RAM</StatLabel>
          <StatValue>{fmt(ram?.used_gb)}/{fmt(ram?.total_gb, 0)} GB</StatValue>
          <MiniBar percent={ram?.percent ?? 0} color="#818cf8" />
        </div>

        <Divider />

        {/* Network */}
        <div className="flex items-center gap-3 px-5 py-4">
          <StatLabel>Net</StatLabel>
          <div className="flex items-center gap-1.5">
            <span style={{ color: '#34d399', fontSize: '1rem' }}>↑</span>
            <StatValue>{fmt(net?.upload_mbs, 2)}</StatValue>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: '#60a5fa', fontSize: '1rem' }}>↓</span>
            <StatValue>{fmt(net?.download_mbs, 2)}</StatValue>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', transition: 'color 5s ease' }}>MB/s</span>
        </div>

        <Divider />

        {/* Disk — rightmost of stats */}
        <div className="flex items-center gap-3 px-5 py-4">
          <StatLabel>Disk</StatLabel>
          <StatValue>{fmt(disk?.used_gb, 0)}/{fmt(disk?.total_gb, 0)} GB</StatValue>
          <div
            className="rounded-full overflow-hidden"
            style={{ width: 100, height: 8, background: 'var(--card-border)', flexShrink: 0 }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(disk?.percent ?? 0, 100)}%`, background: '#f97316', transition: 'width 0.6s ease' }}
            />
          </div>
        </div>

      </div>


    </div>
  )
}
