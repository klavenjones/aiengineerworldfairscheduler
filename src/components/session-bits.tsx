import { Globe, Star } from 'lucide-react'
import type { Speaker } from '#/lib/sessions'
import { cn } from '#/lib/utils'

export function StarButton({
  starred,
  onToggle,
  size = 'md',
}: {
  starred: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      aria-label={starred ? 'Remove from agenda' : 'Add to agenda'}
      aria-pressed={starred}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md transition-colors',
        size === 'sm' ? 'size-6' : 'size-8',
        starred ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Star className={cn(size === 'sm' ? 'size-3.5' : 'size-5', starred && 'fill-primary')} />
    </button>
  )
}

export function SocialLinks({ socials }: { socials?: Speaker['socials'] }) {
  if (!socials?.length) return null
  return (
    <div className="flex items-center gap-1.5">
      {socials.map((s) => (
        <span
          key={s}
          className="flex size-6 items-center justify-center rounded bg-secondary text-[10px] font-semibold text-muted-foreground"
          aria-hidden="true"
        >
          {s === 'x' ? '𝕏' : s === 'linkedin' ? 'in' : <Globe className="size-3.5" />}
        </span>
      ))}
    </div>
  )
}

export function Avatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="size-9 shrink-0 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
      {initials}
    </span>
  )
}
