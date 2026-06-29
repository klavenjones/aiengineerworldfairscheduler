import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'aie-agenda'

export function useAgenda() {
  const [agenda, setAgenda] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setAgenda(new Set(JSON.parse(raw) as string[]))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(agenda)))
  }, [agenda, loaded])

  const toggle = useCallback((id: string) => {
    setAgenda((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isStarred = useCallback((id: string) => agenda.has(id), [agenda])

  return { agenda, toggle, isStarred, count: agenda.size, loaded }
}
