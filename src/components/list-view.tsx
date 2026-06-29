import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DAYS, type Session } from '#/lib/sessions'
import { cn } from '#/lib/utils'
import { SocialLinks, StarButton } from '#/components/session-bits'

export function ListView({
  sessions,
  isStarred,
  toggle,
  onSessionClick,
}: {
  sessions: Session[]
  isStarred: (id: string) => boolean
  toggle: (id: string) => void
  onSessionClick: (session: Session) => void
}) {
  const dayIdsWithSessions = DAYS.filter((d) => sessions.some((s) => s.dayId === d.id))
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCollapsed(
      (prev) => new Set(Array.from(prev).filter((id) => dayIdsWithSessions.some((d) => d.id === id))),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions.length])

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{sessions.length} sessions</span>
        <button
          type="button"
          onClick={() => setCollapsed(new Set())}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(new Set(dayIdsWithSessions.map((d) => d.id)))}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
        >
          Collapse all
        </button>
      </div>

      {dayIdsWithSessions.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No sessions match your filters.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {dayIdsWithSessions.map((day) => {
          const daySessions = sessions
            .filter((s) => s.dayId === day.id)
            .sort((a, b) => a.start - b.start)
          const isOpen = !collapsed.has(day.id)
          return (
            <section key={day.id}>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev)
                    if (next.has(day.id)) next.delete(day.id)
                    else next.add(day.id)
                    return next
                  })
                }
                className="flex w-full items-center gap-2 border-b border-primary/40 pb-3 text-left"
              >
                <ChevronDown
                  className={cn('size-4 transition-transform', !isOpen && '-rotate-90')}
                />
                <span className="text-lg font-semibold text-foreground">{day.label}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {daySessions.length} sessions
                </span>
              </button>

              {isOpen && (
                <div className="mt-4 flex flex-col gap-3">
                  {daySessions.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      starred={isStarred(s.id)}
                      onToggle={() => toggle(s.id)}
                      onClick={() => onSessionClick(s)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function SessionRow({
  session,
  starred,
  onToggle,
  onClick,
}: {
  session: Session
  starred: boolean
  onToggle: () => void
  onClick: () => void
}) {
  return (
    <article
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="rounded border border-primary/40 bg-track px-2 py-0.5 text-xs font-medium text-track-foreground">
          {session.track}
        </span>
        {session.roomNumber && (
          <span className="font-mono text-xs text-muted-foreground">Room {session.roomNumber}</span>
        )}
        <span className="font-mono text-sm text-muted-foreground">
          {session.startLabel}-{session.endLabel}
        </span>
        {session.tags.length > 0 && (
          <span className="text-sm text-muted-foreground">{session.tags[0]}</span>
        )}
        <div className="ml-auto">
          <StarButton starred={starred} onToggle={onToggle} />
        </div>
      </div>

      <h3 className="mt-2 text-pretty text-lg font-semibold text-foreground">{session.title}</h3>

      <div className="mt-3 flex flex-col gap-3">
        {session.speakers.map((sp, i) => (
          <div key={`${sp.name}-${i}`} className="flex items-center gap-3">
            {/* <Avatar name={sp.name} photoUrl={sp.photoUrl} /> */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">{sp.name}</p>
              {(sp.role ?? sp.company) && (
                <p className="truncate text-xs text-muted-foreground">
                  {[sp.role, sp.company].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="mt-1">
                <SocialLinks socials={sp.socials} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
