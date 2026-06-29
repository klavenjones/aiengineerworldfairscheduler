import { useEffect, useRef, useState } from 'react'
import { Building2, Calendar, Star, X } from 'lucide-react'
import { DAYS, type Session, type Speaker } from '#/lib/sessions'
import { Avatar, SocialLinks } from '#/components/session-bits'

export function SessionModal({
  session,
  starred,
  onToggle,
  onClose,
}: {
  session: Session | null
  starred: boolean
  onToggle: () => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (session) {
      el.showModal()
    } else {
      el.close()
    }
  }, [session])

  function onDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  function onCancel(e: React.SyntheticEvent) {
    e.preventDefault()
    onClose()
  }

  const day = session ? DAYS.find((d) => d.id === session.dayId) : null

  return (
    <dialog
      ref={dialogRef}
      onClick={onDialogClick}
      onCancel={onCancel}
      className="m-auto max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/50"
    >
      {session && (
        <div className="flex max-h-[90vh] flex-col">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <span className="text-sm font-semibold text-muted-foreground">Session Details</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-6 py-5">
            <h2 className="text-pretty text-2xl font-semibold text-foreground">{session.title}</h2>

            {/* Track / Room */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-primary">{session.track}</span>
              {session.roomNumber && (
                <span className="text-muted-foreground">/ Room {session.roomNumber}</span>
              )}
            </div>

            {/* Date / Time */}
            {day && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>
                  {day.short} - {day.date} · {session.startLabel}–{session.endLabel}
                </span>
              </div>
            )}

            <hr className="my-4 border-border" />

            {/* Tags */}
            {session.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {session.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Speakers */}
            {session.speakers.map((sp, i) => (
              <SpeakerCard key={`${sp.name}-${i}`} speaker={sp} />
            ))}

            {/* Description */}
            {session.description && (
              <p className="mt-4 text-sm leading-relaxed text-foreground">{session.description}</p>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onToggle}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Star className={starred ? 'size-4 fill-primary text-primary' : 'size-4'} />
              {starred ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [expanded, setExpanded] = useState(false)
  const bio = speaker.bio ?? ''
  const isLong = bio.length > 220

  return (
    <div className="mb-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar name={speaker.name} photoUrl={speaker.photoUrl} />
        <div className="min-w-0">
          <p className="font-semibold text-primary">{speaker.name}</p>
          {(speaker.role ?? speaker.company) && (
            <p className="text-sm text-muted-foreground">
              {[speaker.role, speaker.company].filter(Boolean).join(' · ')}
            </p>
          )}
          {speaker.socials && (
            <div className="mt-2">
              <SocialLinks socials={speaker.socials} />
            </div>
          )}
        </div>
      </div>
      {bio && (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isLong && !expanded ? `${bio.slice(0, 220)}…` : bio}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? 'Show less' : 'Read more…'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
