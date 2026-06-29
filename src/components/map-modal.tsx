import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '#/lib/utils'

const LEVELS = [
  { label: 'Level 1', src: '/level-1-map.png' },
  { label: 'Level 2', src: '/level-2-map.png' },
  { label: 'Level 3', src: '/level-3-map.png' },
]

export function MapModal({ onClose }: { onClose: () => void }) {
  const [activeLevel, setActiveLevel] = useState(0)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-foreground sm:text-lg">Venue Maps</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">Moscone West</p>
        </div>

        {/* Level tabs */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {LEVELS.map((level, i) => (
            <button
              key={level.label}
              type="button"
              onClick={() => setActiveLevel(i)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors sm:text-sm',
                activeLevel === i
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {level.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close map"
          className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Map image */}
      <div className="min-h-0 flex-1 overflow-auto">
        <img
          key={LEVELS[activeLevel].src}
          src={LEVELS[activeLevel].src}
          alt={`${LEVELS[activeLevel].label} floor plan`}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
