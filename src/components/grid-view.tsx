import { ALL_TRACKS, type Day, type Session, TIME_SLOTS } from '#/lib/sessions'
import { cn } from '#/lib/utils'
import { StarButton } from '#/components/session-bits'

export function GridView({
  day,
  sessions,
  isStarred,
  toggle,
}: {
  day: Day
  sessions: Session[]
  isStarred: (id: string) => boolean
  toggle: (id: string) => void
}) {
  const daySessions = sessions.filter((s) => s.dayId === day.id)
  // tracks that actually have sessions this day (keep order from ALL_TRACKS)
  const tracks = ALL_TRACKS.filter((t) => daySessions.some((s) => s.track === t.name))
  const displayTracks = tracks.length ? tracks : ALL_TRACKS.slice(0, 6)

  // time slots that have sessions this day
  const daySlots = TIME_SLOTS.filter((slot) => daySessions.some((s) => s.start === slot.start))

  const lookup = new Map<string, Session>()
  daySessions.forEach((s) => lookup.set(`${s.track}__${s.start}`, s))

  const gridTemplate = `88px repeat(${displayTracks.length}, minmax(150px, 1fr))`

  return (
    <div className="px-6 py-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{day.label}</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="min-w-max">
          {/* Header */}
          <div className="grid border-b border-border bg-card" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="sticky left-0 z-10 bg-card px-3 py-3 text-sm font-semibold text-foreground">
              Time
            </div>
            {displayTracks.map((t) => (
              <div key={t.name} className="border-l border-border px-3 py-3">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {t.roomNumber ? `Room ${t.roomNumber}` : t.room}
                </p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {daySlots.map((slot) => (
            <div
              key={slot.start}
              className="grid border-b border-border last:border-b-0"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="sticky left-0 z-10 flex items-start bg-background px-3 py-3 font-mono text-xs text-muted-foreground">
                {slot.startLabel}
              </div>
              {displayTracks.map((t, i) => {
                const session = lookup.get(`${t.name}__${slot.start}`)
                return (
                  <div key={t.name} className="min-h-24 border-l border-border p-1.5">
                    {session && (
                      <GridCell
                        session={session}
                        accent={i % 2 === 0 ? 'green' : 'blue'}
                        starred={isStarred(session.id)}
                        onToggle={() => toggle(session.id)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GridCell({
  session,
  accent,
  starred,
  onToggle,
}: {
  session: Session
  accent: 'green' | 'blue'
  starred: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-1 rounded-md border p-2',
        accent === 'green'
          ? 'border-session-green-foreground/20 bg-session-green'
          : 'border-session-blue-foreground/20 bg-session-blue',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p
          className={cn(
            'text-xs font-semibold leading-snug',
            accent === 'green' ? 'text-session-green-foreground' : 'text-session-blue-foreground',
          )}
        >
          {session.title}
        </p>
        <StarButton starred={starred} onToggle={onToggle} size="sm" />
      </div>
      <p
        className={cn(
          'text-[11px] leading-tight opacity-80',
          accent === 'green' ? 'text-session-green-foreground' : 'text-session-blue-foreground',
        )}
      >
        {session.speakers.map((s) => s.name).join('; ')}
      </p>
    </div>
  )
}
