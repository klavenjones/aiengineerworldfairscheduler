import { CalendarRange, FileDown, LayoutGrid, List, Moon, Sun } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DAYS, SESSIONS } from '#/lib/sessions'
import { useAgenda } from '#/lib/use-agenda'
import { cn } from '#/lib/utils'
import { useTheme } from '#/components/theme-provider'
import { Sidebar } from '#/components/sidebar'
import { ListView } from '#/components/list-view'
import { GridView } from '#/components/grid-view'
import { CanvasView } from '#/components/canvas-view'

type View = 'list' | 'grid' | 'canvas'

export function ConferenceApp() {
  const { theme, toggleTheme } = useTheme()
  const { toggle, isStarred, count } = useAgenda()

  const [view, setView] = useState<View>('list')
  const [search, setSearch] = useState('')
  const [semantic, setSemantic] = useState(false)
  const [starredOnly, setStarredOnly] = useState(false)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)

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
        {/* Header */}
        <header className="flex flex-wrap items-center gap-4 border-b border-border bg-background px-6 py-4">
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
        <main className="min-h-0 flex-1 overflow-y-auto">
          {/* <div className="flex items-center gap-1.5 border-b border-border px-6 py-2 text-sm text-muted-foreground">
            <ChevronRight className="size-4 text-primary" />
            <span className="font-medium text-primary">For hackers:</span> our sessions and speakers
            data is open!
          </div> */}

          {view === 'list' && (
            <ListView sessions={filtered} isStarred={isStarred} toggle={toggle} />
          )}
          {view === 'grid' && (
            <GridView day={gridDay} sessions={filtered} isStarred={isStarred} toggle={toggle} />
          )}
          {view === 'canvas' && (
            <CanvasView sessions={filtered} isStarred={isStarred} toggle={toggle} />
          )}
        </main>
      </div>
    </div>
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
