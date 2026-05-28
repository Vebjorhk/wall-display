import type { MinecraftStatus } from '../../api/monitoring.ts'

const STEVE_URL = 'https://mc-heads.net/avatar/steve/32'

function stripFormattingCodes(text: string): string {
  return text.replace(/§[0-9a-fk-or]/gi, '')
}

function StatusOrb({ online }: { online: boolean }) {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        flexShrink: 0,
        background: online ? '#55AA00' : '#AA0000',
        boxShadow: online
          ? 'inset -2px -2px 0 rgba(0,0,0,0.35), inset 2px 2px 0 rgba(255,255,255,0.2), 0 0 6px rgba(85,170,0,0.5)'
          : 'inset -2px -2px 0 rgba(0,0,0,0.35), inset 2px 2px 0 rgba(255,255,255,0.1)',
        imageRendering: 'pixelated',
      }}
    />
  )
}

function PlayerRow({ name }: { name: string }) {
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(name)}/32`

  return (
    <div
      className="flex items-center gap-3 px-4 py-1.5"
      style={{ borderTop: '1px solid var(--card-border)' }}
    >
      <img
        src={avatarUrl}
        alt={name}
        width={24}
        height={24}
        style={{ imageRendering: 'pixelated', flexShrink: 0 }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = STEVE_URL }}
      />
      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, transition: 'color 5s ease' }}>
        {name}
      </span>
    </div>
  )
}

export function MinecraftWidget({ status }: { status: MinecraftStatus | null }) {
  const online = status?.online ?? false
  const motd = status?.motd ? stripFormattingCodes(status.motd) : online ? 'Minecraft' : 'Offline'
  const players = status?.players ?? []
  const playersOnline = status?.players_online ?? 0
  const playersMax = status?.players_max ?? 0

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', transition: 'background-color 5s ease' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: 'var(--card-header-bg)', transition: 'background-color 5s ease' }}
      >
        <StatusOrb online={online} />
        <span
          className="flex-1 truncate"
          style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.01em', transition: 'color 5s ease' }}
        >
          {motd}
        </span>
        {online && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', flexShrink: 0, transition: 'color 5s ease' }}>
            {playersOnline}/{playersMax}
          </span>
        )}
      </div>

      {/* Player list */}
      {online && players.length > 0 && players.map((name) => (
        <PlayerRow key={name} name={name} />
      ))}

      {online && players.length === 0 && (
        <div
          className="px-4 py-2"
          style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', transition: 'color 5s ease' }}
        >
          No players online
        </div>
      )}
    </div>
  )
}
