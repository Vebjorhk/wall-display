import type { MinecraftStatus } from '../../api/monitoring.ts'

const STEVE_URL = 'https://mc-heads.net/avatar/steve/32'

function stripFormattingCodes(text: string): string {
  return text.replace(/§[0-9a-fk-or]/gi, '')
}

// 7×7 pixel-art circle: shade 1=border, 2=fill, 3=highlight
const ORB_PIXELS: [number, number, 1 | 2 | 3][] = [
  [2,0,1],[3,0,1],[4,0,1],
  [1,1,1],[2,1,3],[3,1,3],[4,1,2],[5,1,1],
  [0,2,1],[1,2,3],[2,2,3],[3,2,2],[4,2,2],[5,2,2],[6,2,1],
  [0,3,1],[1,3,2],[2,3,2],[3,3,2],[4,3,2],[5,3,2],[6,3,1],
  [0,4,1],[1,4,2],[2,4,2],[3,4,2],[4,4,2],[5,4,2],[6,4,1],
  [1,5,1],[2,5,2],[3,5,2],[4,5,2],[5,5,1],
  [2,6,1],[3,6,1],[4,6,1],
]

function StatusOrb({ online }: { online: boolean }) {
  const border    = online ? '#1a5200' : '#5a0000'
  const fill      = online ? '#55aa00' : '#bb2222'
  const highlight = online ? '#88dd22' : '#dd5555'

  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 7 7"
      style={{ imageRendering: 'pixelated', flexShrink: 0 }}
    >
      {ORB_PIXELS.map(([c, r, shade]) => (
        <rect
          key={`${c}-${r}`}
          x={c} y={r}
          width={1} height={1}
          fill={shade === 1 ? border : shade === 3 ? highlight : fill}
        />
      ))}
    </svg>
  )
}


function PlayerRow({ name }: { name: string }) {
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(name)}/32`

  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{ borderTop: '1px solid var(--card-border)' }}
    >
      <img
        src={avatarUrl}
        alt={name}
        width={28}
        height={28}
        style={{ imageRendering: 'pixelated', flexShrink: 0 }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = STEVE_URL }}
      />
      <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500, transition: 'color 5s ease' }}>
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
          style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', transition: 'color 5s ease' }}
        >
          No players online
        </div>
      )}
    </div>
  )
}
