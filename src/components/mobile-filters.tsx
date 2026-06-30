import { ChevronDown, Search, X } from 'lucide-react'
import { useState } from 'react'
import { TIME_SLOTS, TRACK_TAGS_BY_DAY } from '#/lib/sessions'
import { cn } from '#/lib/utils'

type MobileFiltersProps = {
  semantic: boolean
  setSemantic: (v: boolean) => void
  selectedTags: Set<string>
  toggleTag: (tag: string) => void
  selectedTimes: Set<number>
  toggleTime: (start: number) => void
  filteredCount: number
  onClose: () => void
}

export function MobileFilters({
  semantic,
  setSemantic,
  selectedTags,
  toggleTag,
  selectedTimes,
  toggleTime,
  filteredCount,
  onClose,
}: MobileFiltersProps) {
  const [trackSearch, setTrackSearch] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="text-xl font-bold text-foreground">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="text-base font-semibold text-foreground">Time</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => {
            const active = selectedTimes.has(slot.start)
            return (
              <button
                key={slot.start}
                type="button"
                onClick={() => toggleTime(slot.start)}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground hover:bg-accent',
                )}
              >
                {slot.startLabel}
              </button>
            )
          })}
        </div>

        <h3 className="mt-6 text-base font-semibold text-foreground">Tracks</h3>

        {/* Track search */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={trackSearch}
            onChange={(e) => setTrackSearch(e.target.value)}
            placeholder="Search tracks..."
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Day track groups */}
        <div className="mt-4 flex flex-col gap-4">
          {TRACK_TAGS_BY_DAY.map(({ day, tags }) => {
            const q = trackSearch.trim().toLowerCase()
            const filteredTags = q ? tags.filter((t) => t.toLowerCase().includes(q)) : tags
            if (filteredTags.length === 0) return null
            return (
              <TrackGroup
                key={day.id}
                label={day.label}
                tags={filteredTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
              />
            )
          })}
        </div>

        {/* Semantic search */}
        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={semantic}
            onChange={(e) => setSemantic(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          Semantic search
        </label>
      </div>

      {/* Sticky footer CTA */}
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-primary py-4 text-base font-bold text-primary-foreground transition-colors active:bg-primary/90"
        >
          Show {filteredCount} sessions
        </button>
      </div>
    </div>
  )
}

function TrackGroup({
  label,
  tags,
  selectedTags,
  toggleTag,
}: {
  label: string
  tags: string[]
  selectedTags: Set<string>
  toggleTag: (tag: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 text-sm font-medium text-foreground"
      >
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', !open && '-rotate-90')} />
        {label}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const active = selectedTags.has(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded border px-2 py-1 text-xs transition-colors',
                  active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
