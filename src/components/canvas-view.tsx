import { Minus, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { BREAKOUT_TRACKS, DAYS, EXPO_TRACKS, type Day, type Session } from '#/lib/sessions'
import { cn } from '#/lib/utils'

const AXIS_START = 540 // 9:00am
const AXIS_END = 1230 // 8:30pm
const BASE_PX_PER_MIN = 1.6
const ROW_HEIGHT = 56
const LABEL_WIDTH = 150

function fmtHour(min: number) {
  const h = Math.floor(min / 60)
  const period = h >= 12 ? 'p' : 'a'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}${period}`
}

export function CanvasView({
  sessions,
  isStarred,
  toggle,
}: {
  sessions: Session[]
  isStarred: (id: string) => boolean
  toggle: (id: string) => void
}) {
  const [zoom, setZoom] = useState(76)
  const [canvasDay, setCanvasDay] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; left: number; active: boolean }>({ x: 0, left: 0, active: false })

  const pxPerMin = (BASE_PX_PER_MIN * zoom) / 100
  const timelineWidth = (AXIS_END - AXIS_START) * pxPerMin

  const days = canvasDay === 'all' ? DAYS : DAYS.filter((d) => d.id === canvasDay)
  const ticks: number[] = []
  for (let m = AXIS_START; m <= AXIS_END; m += 60) ticks.push(m)

  function onMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return
    drag.current = { x: e.clientX, left: scrollRef.current.scrollLeft, active: true }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current.active || !scrollRef.current) return
    scrollRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  function endDrag() {
    drag.current.active = false
  }

  return (
    <div className="px-6 py-6">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setZoom(76)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
        >
          Fit width
        </button>
        <button
          type="button"
          onClick={() => setCanvasDay('all')}
          className={cn(
            'rounded-md border px-3 py-1.5 text-sm transition-colors',
            canvasDay === 'all'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-foreground hover:bg-accent',
          )}
        >
          All days
        </button>
        {DAYS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setCanvasDay(d.id)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm transition-colors',
              canvasDay === d.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:bg-accent',
            )}
          >
            {d.short}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-card px-1 py-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(40, z - 12))}
            aria-label="Zoom out"
            className="flex size-7 items-center justify-center rounded text-foreground transition-colors hover:bg-accent"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-sm tabular-nums text-foreground">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 12))}
            aria-label="Zoom in"
            className="flex size-7 items-center justify-center rounded text-foreground transition-colors hover:bg-accent"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="cursor-grab overflow-x-auto rounded-lg border border-border bg-card active:cursor-grabbing"
      >
        <div className="min-w-max p-4" style={{ width: LABEL_WIDTH + timelineWidth + 32 }}>
          {days.map((day) => (
            <DaySection
              key={day.id}
              day={day}
              sessions={sessions.filter((s) => s.dayId === day.id)}
              ticks={ticks}
              pxPerMin={pxPerMin}
              timelineWidth={timelineWidth}
              isStarred={isStarred}
              toggle={toggle}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        Drag or scroll to pan · use the +/- buttons to zoom · click a session to add it to your agenda
      </p>
    </div>
  )
}

function DaySection({
  day,
  sessions,
  ticks,
  pxPerMin,
  timelineWidth,
  isStarred,
  toggle,
}: {
  day: Day
  sessions: Session[]
  ticks: number[]
  pxPerMin: number
  timelineWidth: number
  isStarred: (id: string) => boolean
  toggle: (id: string) => void
}) {
  const breakout = BREAKOUT_TRACKS.filter((t) => sessions.some((s) => s.track === t.name))
  const expo = EXPO_TRACKS.filter((t) => sessions.some((s) => s.track === t.name))

  return (
    <div className="mb-8 last:mb-0">
      <h2 className="mb-1 font-mono text-xl font-bold text-foreground">
        {day.label.split(' · ')[0]}
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        {breakout.length + expo.length} rooms · {sessions.length} sessions
      </p>

      {/* Axis */}
      <div className="relative mb-2 h-5" style={{ marginLeft: LABEL_WIDTH }}>
        {ticks.map((m) => (
          <span
            key={m}
            className="absolute top-0 font-mono text-xs text-muted-foreground"
            style={{ left: (m - AXIS_START) * pxPerMin }}
          >
            {fmtHour(m)}
          </span>
        ))}
      </div>

      {breakout.length > 0 && (
        <>
          <p className="mb-2 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
            LEVEL 2 · BREAKOUT TRACKS
          </p>
          {breakout.map((t) => (
            <TrackRow
              key={t.name}
              label={t.name}
              sessions={sessions.filter((s) => s.track === t.name)}
              pxPerMin={pxPerMin}
              timelineWidth={timelineWidth}
              accent="violet"
              isStarred={isStarred}
              toggle={toggle}
            />
          ))}
        </>
      )}

      {expo.length > 0 && (
        <>
          <p className="mb-2 mt-4 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
            LEVEL 1 · EXPO STAGES
          </p>
          {expo.map((t) => (
            <TrackRow
              key={t.name}
              label={t.name}
              sessions={sessions.filter((s) => s.track === t.name)}
              pxPerMin={pxPerMin}
              timelineWidth={timelineWidth}
              accent="green"
              isStarred={isStarred}
              toggle={toggle}
            />
          ))}
        </>
      )}
    </div>
  )
}

function TrackRow({
  label,
  sessions,
  pxPerMin,
  timelineWidth,
  accent,
  isStarred,
  toggle,
}: {
  label: string
  sessions: Session[]
  pxPerMin: number
  timelineWidth: number
  accent: 'violet' | 'green'
  isStarred: (id: string) => boolean
  toggle: (id: string) => void
}) {
  return (
    <div className="flex items-stretch border-t border-border/60" style={{ height: ROW_HEIGHT }}>
      <div
        className="flex shrink-0 flex-col justify-center font-mono text-sm text-foreground"
        style={{ width: LABEL_WIDTH }}
      >
        <span>{label}</span>
        {sessions[0]?.roomNumber && (
          <span className="text-[10px] text-muted-foreground">Room {sessions[0].roomNumber}</span>
        )}
      </div>
      <div className="relative flex-1" style={{ width: timelineWidth }}>
        {sessions.map((s) => {
          const left = (s.start - AXIS_START) * pxPerMin
          const width = Math.max(56, (s.end - s.start) * pxPerMin - 4)
          const starred = isStarred(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              title={s.title}
              style={{ left, width, top: 6, height: ROW_HEIGHT - 12 }}
              className={cn(
                'absolute flex flex-col justify-center overflow-hidden rounded-md border px-2 text-left transition-all',
                accent === 'violet'
                  ? 'border-session-blue-foreground/30 bg-session-blue hover:brightness-110'
                  : 'border-session-green-foreground/30 bg-session-green hover:brightness-110',
                starred && 'ring-2 ring-primary',
              )}
            >
              <span
                className={cn(
                  'truncate text-xs font-semibold',
                  accent === 'violet' ? 'text-session-blue-foreground' : 'text-session-green-foreground',
                )}
              >
                {s.title}
              </span>
              <span
                className={cn(
                  'truncate text-[10px] opacity-80',
                  accent === 'violet' ? 'text-session-blue-foreground' : 'text-session-green-foreground',
                )}
              >
                {s.speakers[0]?.name}
                {s.speakers.length > 1 ? ` +${s.speakers.length - 1}` : ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
