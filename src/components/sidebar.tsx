import { ChevronDown, ChevronLeft, Search, Star } from 'lucide-react'
import { useState } from 'react'
import { DAYS, TRACK_TAGS_BY_DAY } from '#/lib/sessions'
import { cn } from '#/lib/utils'

type SidebarProps = {
  search: string
  setSearch: (v: string) => void
  semantic: boolean
  setSemantic: (v: boolean) => void
  starredCount: number
  starredOnly: boolean
  setStarredOnly: (v: boolean) => void
  selectedDayId: string | null
  setSelectedDayId: (id: string | null) => void
  selectedTags: Set<string>
  toggleTag: (tag: string) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

export function Sidebar({
  search,
  setSearch,
  semantic,
  setSemantic,
  starredCount,
  starredOnly,
  setStarredOnly,
  selectedDayId,
  setSelectedDayId,
  selectedTags,
  toggleTag,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  if (collapsed) {
    return (
      <aside className="flex w-14 shrink-0 flex-col items-center gap-4 border-r border-sidebar-border bg-sidebar py-4">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="flex size-9 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <ChevronLeft className="size-5 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => setStarredOnly(!starredOnly)}
          aria-label="Starred sessions"
          className={cn(
            'flex size-9 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent',
            starredOnly ? 'text-primary' : 'text-sidebar-foreground',
          )}
        >
          <Star className={cn('size-5', starredOnly && 'fill-primary')} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <div className="flex flex-col items-center border-2 border-sidebar-foreground px-3 py-1.5 leading-none">
          <span className="text-[10px] font-semibold tracking-[0.15em] text-sidebar-foreground">
            AI Engineer
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-sidebar-foreground">
            World&apos;s Fair
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8 pt-5">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full rounded-md border border-sidebar-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-sidebar-foreground">
          <input
            type="checkbox"
            checked={semantic}
            onChange={(e) => setSemantic(e.target.checked)}
            className="size-4 rounded border-sidebar-border accent-primary"
          />
          Semantic search
        </label>

        {/* Starred */}
        <button
          type="button"
          onClick={() => setStarredOnly(!starredOnly)}
          className={cn(
            'mt-5 flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
            starredOnly
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-sidebar-border bg-background text-sidebar-foreground hover:bg-sidebar-accent',
          )}
        >
          <Star className={cn('size-4', starredOnly ? 'fill-primary text-primary' : 'text-primary')} />
          Starred ({starredCount})
        </button>

        {/* Date */}
        <h2 className="mt-7 text-base font-semibold text-sidebar-foreground">Date</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = selectedDayId === day.id
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDayId(active ? null : day.id)}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-sidebar-border bg-background text-sidebar-foreground hover:bg-sidebar-accent',
                )}
              >
                {day.label}
              </button>
            )
          })}
        </div>

        {/* Tracks */}
        <h2 className="mt-7 text-base font-semibold text-sidebar-foreground">Tracks</h2>
        <div className="mt-2 flex flex-col gap-4">
          {TRACK_TAGS_BY_DAY.map(({ day, tags }) => (
            <TrackGroup
              key={day.id}
              label={day.label}
              tags={tags}
              selectedTags={selectedTags}
              toggleTag={toggleTag}
            />
          ))}
        </div>
      </div>
    </aside>
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
        className="flex w-full items-center gap-1.5 text-sm font-medium text-sidebar-foreground"
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
                    : 'border-sidebar-border bg-background text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
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
