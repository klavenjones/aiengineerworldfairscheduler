import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'
import { SESSIONS, DAYS, type Session } from '#/lib/sessions'

// PDT offset (UTC-7) — Moscone West, San Francisco
const PDT_OFFSET_MS = -7 * 60 * 60 * 1000

const DAY_DATES: Record<string, string> = {
  day1: '2026-06-29',
  day2: '2026-06-30',
  day3: '2026-07-01',
  day4: '2026-07-02',
}

/** Convert a session's dayId + start minutes → UTC Date */
function sessionStartUtc(session: Session): Date {
  const dateStr = DAY_DATES[session.dayId]
  if (!dateStr) return new Date(0)
  // midnight PDT as UTC
  const midnightPdt = new Date(`${dateStr}T00:00:00.000Z`).getTime() - PDT_OFFSET_MS
  return new Date(midnightPdt + session.start * 60 * 1000)
}

function buildItineraryHtml(sessions: Session[]): string {
  const byDay = DAYS.map((day) => ({
    day,
    sessions: sessions.filter((s) => s.dayId === day.id).sort((a, b) => a.start - b.start),
  })).filter((g) => g.sessions.length > 0)

  const rows = byDay
    .map(({ day, sessions }) => {
      const sessionRows = sessions
        .map(
          (s) => `
          <tr>
            <td style="padding:8px 12px;color:#6b7280;white-space:nowrap">${s.startLabel}</td>
            <td style="padding:8px 12px;font-weight:500">${s.title}</td>
            <td style="padding:8px 12px;color:#6b7280">${s.track}${s.roomNumber ? ` (Room ${s.roomNumber})` : ''}</td>
          </tr>`,
        )
        .join('')
      return `
        <tr>
          <td colspan="3" style="padding:16px 12px 4px;font-weight:700;font-size:15px;color:#111">${day.label}</td>
        </tr>
        ${sessionRows}`
    })
    .join('')

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:4px">AI Engineer World's Fair</h1>
      <p style="color:#6b7280;margin-top:0">Your starred sessions · June 29 – July 2, 2026 · Moscone West</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb">
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Time</th>
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Session</th>
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Room</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#9ca3af">
        You'll also receive individual reminder emails before each session starts.
      </p>
    </div>`
}

function buildReminderHtml(session: Session, leadMinutes: number): string {
  const speakerNames = session.speakers.map((s) => s.name).join(', ')
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <p style="font-size:13px;color:#6b7280;margin-bottom:8px">
        Starting in ${leadMinutes} minutes · AI Engineer World's Fair
      </p>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">${session.title}</h1>
      <p style="color:#6b7280;margin:0 0 4px">${session.startLabel} – ${session.endLabel}</p>
      <p style="color:#6b7280;margin:0">
        ${session.track}${session.roomNumber ? ` · Room ${session.roomNumber}` : ''}
      </p>
      ${speakerNames ? `<p style="margin-top:12px;color:#374151">Speakers: ${speakerNames}</p>` : ''}
    </div>`
}

export const scheduleReminders = createServerFn({ method: 'POST' })
  .validator(
    (data: unknown): { email: string; sessionIds: string[]; leadMinutes: number } => {
      if (
        !data ||
        typeof data !== 'object' ||
        !('email' in data) ||
        !('sessionIds' in data) ||
        !('leadMinutes' in data)
      ) {
        throw new Error('Invalid payload')
      }
      const d = data as { email: unknown; sessionIds: unknown; leadMinutes: unknown }
      if (typeof d.email !== 'string' || !d.email.includes('@')) throw new Error('Invalid email')
      if (!Array.isArray(d.sessionIds)) throw new Error('Invalid sessionIds')
      if (typeof d.leadMinutes !== 'number') throw new Error('Invalid leadMinutes')
      return {
        email: d.email,
        sessionIds: d.sessionIds as string[],
        leadMinutes: d.leadMinutes,
      }
    },
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev'
    if (!apiKey || apiKey === 're_your_api_key_here') {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const resend = new Resend(apiKey)
    const { email, sessionIds, leadMinutes } = data

    const starred = SESSIONS.filter((s) => sessionIds.includes(s.id))
    if (starred.length === 0) throw new Error('No matching sessions found')

    // 1. Send immediate itinerary email
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Your AI Engineer World's Fair Schedule",
      html: buildItineraryHtml(starred),
    })

    // 2. Schedule per-session reminder emails
    const now = Date.now()
    const leadMs = leadMinutes * 60 * 1000
    let scheduled = 0

    for (const session of starred) {
      const reminderTime = sessionStartUtc(session).getTime() - leadMs
      if (reminderTime <= now) continue // session already passed or too soon

      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Starting in ${leadMinutes} min: ${session.title} — ${session.track}`,
        html: buildReminderHtml(session, leadMinutes),
        scheduledAt: new Date(reminderTime).toISOString(),
      })
      scheduled++
    }

    return { scheduled, total: starred.length }
  })
