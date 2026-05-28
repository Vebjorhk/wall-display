import type { CSSProperties } from 'react'
import type { MinecraftStatus } from '../../api/monitoring.ts'

const MC_FONT = "'Press Start 2P', monospace"
const STEVE_URL = 'https://mc-heads.net/avatar/steve/32'

function stripFormattingCodes(text: string): string {
  return text.replace(/§[0-9a-fk-or]/gi, '')
}

function makeTileBg(pixels: string[][], size: number): CSSProperties {
  const n = pixels.length
  const rects = pixels
    .flatMap((row, r) => row.map((fill, c) => `<rect x="${c}" y="${r}" width="1" height="1" fill="${fill}"/>`))
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">${rects}</svg>`
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: `${size}px ${size}px`,
    imageRendering: 'pixelated',
  }
}

const G1 = '#7fb238', G2 = '#5c9929', G3 = '#8bc34a'
const GRASS_BG = makeTileBg([
  [G2,G1,G3,G1,G2,G1,G3,G1],
  [G1,G3,G1,G2,G1,G3,G1,G2],
  [G3,G1,G2,G1,G3,G1,G2,G1],
  [G1,G2,G1,G3,G1,G2,G1,G3],
  [G2,G1,G3,G1,G2,G1,G3,G1],
  [G1,G3,G1,G2,G1,G3,G1,G2],
  [G3,G1,G2,G1,G3,G1,G2,G1],
  [G1,G2,G1,G3,G1,G2,G1,G3],
], 32)

const D1 = '#866043', D2 = '#7a5435', D3 = '#966c4f'
const DIRT_BG = makeTileBg([
  [D1,D3,D1,D1,D3,D1,D1,D1],
  [D1,D1,D1,D2,D1,D1,D3,D1],
  [D3,D1,D2,D1,D1,D3,D1,D1],
  [D1,D1,D1,D3,D1,D1,D1,D2],
  [D1,D2,D1,D1,D1,D2,D1,D1],
  [D1,D1,D3,D1,D1,D1,D3,D1],
  [D3,D1,D1,D1,D2,D1,D1,D1],
  [D1,D1,D1,D3,D1,D1,D1,D3],
], 32)

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
    <svg width={16} height={16} viewBox="0 0 7 7" style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
      {ORB_PIXELS.map(([c, r, shade]) => (
        <rect
          key={`${c}-${r}`}
          x={c} y={r} width={1} height={1}
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
      className="flex items-center gap-3 px-4 py-2.5"
      style={{ ...DIRT_BG, borderTop: '2px solid rgba(0,0,0,0.25)' }}
    >
      <img
        src={avatarUrl}
        alt={name}
        width={28}
        height={28}
        style={{ imageRendering: 'pixelated', flexShrink: 0 }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = STEVE_URL }}
      />
      <span style={{ fontFamily: MC_FONT, color: 'white', fontSize: '0.65rem', lineHeight: 1.4, textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
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
  const version = status?.version

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '2px solid rgba(0,0,0,0.4)' }}>
      {/* Header — grass block top */}
      <div className="flex items-start gap-2.5 px-4 py-3" style={GRASS_BG}>
        <StatusOrb online={online} />
        <div className="flex flex-col flex-1 min-w-0" style={{ gap: '0.25rem' }}>
          <span
            className="truncate"
            style={{ fontFamily: MC_FONT, color: 'white', fontSize: '0.6rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            {motd}
          </span>
          {online && version && (
            <span style={{ fontFamily: MC_FONT, color: 'rgba(255,255,255,0.75)', fontSize: '0.45rem', textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>
              Running {version}
            </span>
          )}
        </div>
        {online && (
          <span style={{ fontFamily: MC_FONT, color: 'white', fontSize: '0.65rem', flexShrink: 0, textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
            {playersOnline}/{playersMax}
          </span>
        )}
      </div>

      {/* Player list — dirt block */}
      {online && players.length > 0 && players.map((name) => (
        <PlayerRow key={name} name={name} />
      ))}

      {online && players.length === 0 && (
        <div
          className="px-4 py-3"
          style={{ ...DIRT_BG, borderTop: '2px solid rgba(0,0,0,0.25)' }}
        >
          <span style={{ fontFamily: MC_FONT, color: 'rgba(255,255,255,0.6)', fontSize: '0.55rem', textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>
            No players online
          </span>
        </div>
      )}


    </div>
  )
}
