import sessionsData from '#/data/sessions.json'
import speakersData from '#/data/speakers.json'

export type Speaker = {
  name: string
  role?: string
  company?: string
  bio?: string
  linkedin?: string
  photoUrl?: string
  socials?: ('x' | 'linkedin' | 'web')[]
}

export type Session = {
  id: string
  title: string
  description?: string
  dayId: string
  /** physical room — used as column key in grid/canvas views */
  track: string
  room: string
  /** minutes from midnight */
  start: number
  end: number
  startLabel: string
  endLabel: string
  speakers: Speaker[]
  /** topic / category tags for sidebar filtering */
  tags: string[]
  level: 'breakout' | 'expo'
}

export type Day = {
  id: string
  label: string
  short: string
  date: string
}

export const DAYS: Day[] = [
  { id: 'day1', label: 'Day 1 · Mon, 6/29 (Workshop)', short: 'Day 1', date: 'Mon, 6/29' },
  { id: 'day2', label: 'Day 2 · Tue, 6/30', short: 'Day 2', date: 'Tue, 6/30' },
  { id: 'day3', label: 'Day 3 · Wed, 7/1', short: 'Day 3', date: 'Wed, 7/1' },
  { id: 'day4', label: 'Day 4 · Thu, 7/2', short: 'Day 4', date: 'Thu, 7/2' },
]

const DAY_MAP: Record<string, string> = {
  'Day 1 — Workshop Day': 'day1',
  'Day 2 — Session Day 1': 'day2',
  'Day 3 — Session Day 2': 'day3',
  'Day 4 — Session Day 3': 'day4',
}

function parseTimeLabel(label: string): number {
  const m = label.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!m) return 0
  let h = parseInt(m[1])
  const mins = parseInt(m[2])
  const period = m[3].toLowerCase()
  if (period === 'pm' && h !== 12) h += 12
  if (period === 'am' && h === 12) h = 0
  return h * 60 + mins
}

function parseTime(timeStr: string) {
  const dash = timeStr.indexOf('-')
  if (dash === -1) return { start: 0, end: 0, startLabel: timeStr, endLabel: timeStr }
  const startLabel = timeStr.slice(0, dash)
  const endLabel = timeStr.slice(dash + 1)
  return {
    start: parseTimeLabel(startLabel),
    end: parseTimeLabel(endLabel),
    startLabel,
    endLabel,
  }
}

// Build speaker lookup from speakers.json
type RawSpeaker = {
  name: string
  role?: string
  company?: string
  bio?: string
  linkedin?: string
  photoUrl?: string
}

const speakerLookup = new Map<string, Speaker>()
for (const sp of (speakersData as { speakers: RawSpeaker[] }).speakers) {
  const socials: ('x' | 'linkedin' | 'web')[] = []
  if (sp.linkedin) socials.push('linkedin')
  speakerLookup.set(sp.name, {
    name: sp.name,
    role: sp.role,
    company: sp.company,
    bio: sp.bio,
    linkedin: sp.linkedin,
    photoUrl: sp.photoUrl,
    socials: socials.length ? socials : undefined,
  })
}

const EXPO_ROOM_PREFIX = 'Expo Stage'

export type TrackInfo = { name: string; room: string }

// Ordered room lists matching the conference venue layout
export const BREAKOUT_TRACKS: TrackInfo[] = [
  { name: 'Main Stage', room: 'Main Stage' },
  { name: 'Leadership Lounge', room: 'Leadership Lounge' },
  { name: 'Leadership 1', room: 'Leadership 1' },
  { name: 'Leadership 2', room: 'Leadership 2' },
  { name: 'Track M', room: 'Track M' },
  { name: 'Track 1', room: 'Track 1' },
  { name: 'Track 2', room: 'Track 2' },
  { name: 'Track 3', room: 'Track 3' },
  { name: 'Track 4', room: 'Track 4' },
  { name: 'Track 5', room: 'Track 5' },
  { name: 'Track 6', room: 'Track 6' },
  { name: 'Track 7', room: 'Track 7' },
  { name: 'Track 8', room: 'Track 8' },
  { name: 'Track 9', room: 'Track 9' },
]

export const EXPO_TRACKS: TrackInfo[] = [
  { name: 'Expo Stage 1 NE', room: 'Expo Stage 1 NE' },
  { name: 'Expo Stage 2 NW', room: 'Expo Stage 2 NW' },
  { name: 'Expo Stage 3 SW', room: 'Expo Stage 3 SW' },
  { name: 'Expo Stage 4 SE', room: 'Expo Stage 4 SE' },
]

export const ALL_TRACKS: TrackInfo[] = [...BREAKOUT_TRACKS, ...EXPO_TRACKS]

// Build sessions from sessions.json
type RawSession = {
  title: string
  description?: string
  day: string
  time: string
  room: string
  type: string
  track: string | null
  status: string
  speakers: string[]
}

function buildSessions(): Session[] {
  const raw = (sessionsData as { sessions: RawSession[] }).sessions
  return raw.map((s, index) => {
    const dayId = DAY_MAP[s.day] ?? 'day1'
    const { start, end, startLabel, endLabel } = parseTime(s.time ?? '')
    const room = s.room ?? ''
    const topicTrack = s.track ?? null
    const level: 'breakout' | 'expo' = room.startsWith(EXPO_ROOM_PREFIX) ? 'expo' : 'breakout'

    // track = physical room (for grid/canvas column grouping)
    // tags = topic category when it differs from the room name
    const tags: string[] = topicTrack && topicTrack !== room ? [topicTrack] : []

    const speakers: Speaker[] = (s.speakers ?? []).map((name) =>
      speakerLookup.get(name) ?? { name },
    )

    return {
      id: `session-${index}`,
      title: s.title,
      description: s.description,
      dayId,
      track: room,
      room,
      start,
      end,
      startLabel,
      endLabel,
      speakers,
      tags,
      level,
    }
  })
}

export const SESSIONS: Session[] = buildSessions()

// Unique time slots sorted by start time, derived from real session data
export type TimeSlot = { start: number; end: number; startLabel: string; endLabel: string }

export const TIME_SLOTS: TimeSlot[] = Array.from(
  new Map(
    SESSIONS.map((s) => [
      s.start,
      { start: s.start, end: s.end, startLabel: s.startLabel, endLabel: s.endLabel },
    ]),
  ).values(),
).sort((a, b) => a.start - b.start)

export const TRACK_TAGS_BY_DAY: { day: Day; tags: string[] }[] = DAYS.map((day) => {
  const tagSet = new Set<string>()
  SESSIONS.filter((s) => s.dayId === day.id).forEach((s) => {
    tagSet.add(s.track)
    s.tags.forEach((t) => tagSet.add(t))
  })
  return { day, tags: Array.from(tagSet).sort() }
})

export function totalSessions() {
  return SESSIONS.length
}
