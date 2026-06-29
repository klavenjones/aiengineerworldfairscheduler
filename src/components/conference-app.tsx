import { CalendarRange, ChevronLeft, FileDown, LayoutGrid, List, Moon, Search, Share2, SlidersHorizontal, Star, Sun } from 'lucide-react'
import { useRef, useMemo, useState } from 'react'
import { DAYS, SESSIONS, type Session } from '#/lib/sessions'
import { useAgenda } from '#/lib/use-agenda'
import { cn } from '#/lib/utils'
import { useTheme } from '#/components/theme-provider'
import { Sidebar } from '#/components/sidebar'
import { ListView } from '#/components/list-view'
import { GridView } from '#/components/grid-view'
import { CanvasView } from '#/components/canvas-view'
import { SessionModal } from '#/components/session-modal'
import { MobileFilters } from '#/components/mobile-filters'

type View = 'list' | 'grid' | 'canvas'

export function ConferenceApp() {
  const { theme, toggleTheme } = useTheme()
  const { toggle, isStarred, count } = useAgenda()

  const [view, setView] = useState<View>('list')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [search, setSearch] = useState('')
  const [semantic, setSemantic] = useState(false)
  const [starredOnly, setStarredOnly] = useState(false)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const mainScrollRef = useRef<HTMLElement>(null)

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SESSIONS.filter((s) => {
      if (selectedDayId && s.dayId !== selectedDayId) return false
      if (starredOnly && !isStarred(s.id)) return false
      if (q) {
        const hay =
          `${s.title} ${s.speakers.map((sp) => `${sp.name} ${sp.company ?? ''}`).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (selectedTags.size > 0) {
        const matches = selectedTags.has(s.track) || s.tags.some((t) => selectedTags.has(t))
        if (!matches) return false
      }
      return true
    })
  }, [search, selectedDayId, starredOnly, selectedTags, isStarred])

  const gridDay =
    DAYS.find((d) => d.id === selectedDayId) ??
    DAYS.find((d) => filtered.some((s) => s.dayId === d.id)) ??
    DAYS[0]

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        search={search}
        setSearch={setSearch}
        semantic={semantic}
        setSemantic={setSemantic}
        starredCount={count}
        starredOnly={starredOnly}
        setStarredOnly={setStarredOnly}
        selectedDayId={selectedDayId}
        setSelectedDayId={setSelectedDayId}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex flex-col border-b border-border bg-background md:hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-3 py-3">
            <div className="flex flex-col items-center border-2 border-foreground px-2 py-1 leading-none">
              <span className="text-[9px] font-semibold tracking-[0.15em] text-foreground">AI Engineer</span>
              <span className="font-mono text-sm font-bold tracking-tight text-foreground">World&apos;s Fair</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Download PDF"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
              >
                <FileDown className="size-4" />
              </button>
              <span className="rounded-full border border-primary px-2.5 py-1 text-xs font-semibold text-primary">
                {filtered.length}/{SESSIONS.length}
              </span>
              <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
                <MobileViewTab active={view === 'list'} onClick={() => setView('list')} icon={<List className="size-4" />} label="List" />
                <MobileViewTab active={view === 'grid'} onClick={() => setView('grid')} icon={<LayoutGrid className="size-4" />} label="Grid" />
                <MobileViewTab active={view === 'canvas'} onClick={() => setView('canvas')} icon={<CalendarRange className="size-4" />} label="Canvas" />
              </div>
              <button
                type="button"
                aria-label="Share"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 pb-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracks"
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              aria-label="Open filters"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setStarredOnly(!starredOnly)}
              className={cn(
                'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                starredOnly
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-transparent text-foreground hover:bg-accent',
              )}
            >
              <Star className={cn('size-3', starredOnly && 'fill-primary')} />
              Starred ({count})
            </button>
            {DAYS.map((day) => {
              const active = selectedDayId === day.id
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDayId(active ? null : day.id)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-transparent text-foreground hover:bg-accent',
                  )}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop header */}
        <header className="hidden flex-wrap items-center gap-4 border-b border-border bg-background px-6 py-4 md:flex">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
              shortcut: <span className="text-primary">ai.engineer/schedule</span>
            </h1>
            <p className="text-sm text-muted-foreground">June 29 - July 2, 2026 · Moscone West</p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {SESSIONS.length} sessions
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent sm:flex"
            >
              <FileDown className="size-4" /> PDF
            </button>

            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              <ViewTab
                active={view === 'list'}
                onClick={() => setView('list')}
                icon={<List className="size-4" />}
                label="List View"
              />
              <ViewTab
                active={view === 'grid'}
                onClick={() => setView('grid')}
                icon={<LayoutGrid className="size-4" />}
                label="Grid View"
              />
              <ViewTab
                active={view === 'canvas'}
                onClick={() => setView('canvas')}
                icon={<CalendarRange className="size-4" />}
                label="Canvas View"
              />
            </div>
            {/* <span className="hidden size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground lg:flex">
              <Globe className="size-4" />
            </span> */}
          </div>
        </header>

        {/* Content */}
        <main ref={mainScrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {/* <div className="flex items-center gap-1.5 border-b border-border px-6 py-2 text-sm text-muted-foreground">
            <ChevronRight className="size-4 text-primary" />
            <span className="font-medium text-primary">For hackers:</span> our sessions and speakers
            data is open!
          </div> */}

          {view === 'list' && (
            <ListView sessions={filtered} isStarred={isStarred} toggle={toggle} onSessionClick={setSelectedSession} />
          )}
          {view === 'grid' && (
            <GridView day={gridDay} sessions={filtered} isStarred={isStarred} toggle={toggle} onSessionClick={setSelectedSession} />
          )}
          {view === 'canvas' && (
            <CanvasView sessions={filtered} isStarred={isStarred} onSessionClick={setSelectedSession} />
          )}
        </main>
      </div>

      <SessionModal
        session={selectedSession}
        starred={selectedSession ? isStarred(selectedSession.id) : false}
        onToggle={() => selectedSession && toggle(selectedSession.id)}
        onClose={() => setSelectedSession(null)}
      />

      {/* Mobile filters modal */}
      {mobileFiltersOpen && (
        <MobileFilters
          semantic={semantic}
          setSemantic={setSemantic}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          filteredCount={filtered.length}
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* Mobile FAB — scroll to top */}
      <button
        type="button"
        onClick={() => mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-4 flex size-12 items-center justify-center rounded-full border-2 border-border bg-background text-foreground shadow-lg transition-colors hover:bg-accent md:hidden"
      >
        <ChevronLeft className="size-5" />
      </button>
    </div>
  )
}

function MobileViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex size-7 items-center justify-center rounded transition-colors',
        active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
    </button>
  )
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3',
        active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
