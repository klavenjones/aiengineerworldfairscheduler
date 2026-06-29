import { useEffect, useState } from 'react'
import { X, Bell, Loader2 } from 'lucide-react'
import { scheduleReminders } from '#/lib/schedule-reminders'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function RemindModal({
  starredSessionIds,
  onClose,
}: {
  starredSessionIds: string[]
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [leadMinutes, setLeadMinutes] = useState(15)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<{ scheduled: number; total: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await scheduleReminders({ data: { email, sessionIds: starredSessionIds, leadMinutes } })
      setResult(res)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong, please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h2 className="font-semibold text-foreground">Session Reminders</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          {status === 'success' && result ? (
            <div className="text-center">
              <div className="mb-3 text-3xl">📬</div>
              <p className="font-semibold text-foreground">You're all set!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your itinerary has been sent to <span className="font-medium text-foreground">{email}</span>.
              </p>
              {result.scheduled > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.scheduled} reminder{result.scheduled !== 1 ? 's' : ''} scheduled
                  {result.scheduled < result.total && ` (${result.total - result.scheduled} session${result.total - result.scheduled !== 1 ? 's' : ''} already passed)`}.
                </p>
              )}
              {result.scheduled === 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  All sessions are in the past — only the itinerary email was sent.
                </p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                You have{' '}
                <span className="font-semibold text-foreground">
                  {starredSessionIds.length} session{starredSessionIds.length !== 1 ? 's' : ''}
                </span>{' '}
                starred. We'll email you an itinerary now and a reminder before each session starts.
              </p>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="remind-email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <input
                  id="remind-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Lead time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Remind me</label>
                <div className="flex gap-2">
                  {[15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLeadMinutes(mins)}
                      className={[
                        'flex-1 rounded-md border py-2 text-sm font-medium transition-colors',
                        leadMinutes === mins
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-foreground hover:bg-accent',
                      ].join(' ')}
                    >
                      {mins} min before
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={status === 'loading' || starredSessionIds.length === 0}
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === 'loading' && <Loader2 className="size-4 animate-spin" />}
                {status === 'loading' ? 'Sending…' : 'Send reminders'}
              </button>

              {starredSessionIds.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Star some sessions first to get reminders.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
