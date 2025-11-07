'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getExerciseImageSrc } from '@/components/workout/exercise-images'

type SetLite = {
  orderIndex: number
  weightKg: number | null
  reps: number | null
  completed: boolean
  Exercise?: { name: string }
}

type WorkoutLite = {
  id: string
  date: string | Date
  planType: string
  sets: SetLite[]
}

function formatDate(d: string | Date) {
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString()
}

function formatSet(s: SetLite) {
  const w = s.weightKg ?? '–'
  const r = s.reps ?? '–'
  return `${w} kg × ${r}`
}

export function WorkoutAccordion({ workouts }: { workouts: WorkoutLite[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const normalized = useMemo(() => {
    return workouts.map((w) => ({
      ...w,
      date: w.date instanceof Date ? w.date : new Date(w.date),
    }))
  }, [workouts])

  if (normalized.length === 0) {
    return <p className="text-sm text-muted-foreground">Ingen registrerede workouts endnu.</p>
  }

  return (
    <div className="space-y-2">
      {normalized.map((w) => {
        const id = w.id
        const isOpen = openId === id
        const completedSets = w.sets.filter((s) => s.completed).length
        const totalSets = w.sets.length
        // Group sets by exercise name
        const groups = new Map<string, SetLite[]>()
        w.sets
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .forEach((s) => {
            const name = s.Exercise?.name ?? 'Ukendt øvelse'
            const arr = groups.get(name) ?? []
            arr.push(s)
            groups.set(name, arr)
          })

        return (
          <div key={id} className="rounded-md border overflow-hidden">
            <button
              type="button"
              className={cn(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-left',
                isOpen ? 'bg-muted/50' : 'bg-background'
              )}
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : id)}
            >
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">{formatDate(w.date)}</span>
                <span className="text-xs text-muted-foreground truncate">{w.planType.replaceAll('_', ' ')}</span>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {completedSets}/{totalSets} sæt
              </span>
            </button>
            {isOpen && (
              <div className="px-3 py-2">
                <ul className="space-y-2">
                  {Array.from(groups.entries()).map(([name, sets]) => {
                    const lastSet = sets[sets.length - 1]
                    const lastKg = lastSet?.weightKg ?? '–'
                    const lastReps = lastSet?.reps ?? '–'
                    return (
                      <li key={name} className="rounded border p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{name}</span>
                          <span className="text-xs text-muted-foreground">{sets.length} sæt</span>
                        </div>
                        <div className="mt-2 overflow-hidden rounded bg-black">
                          <div className="aspect-video w-full">
                            <img
                              src={getExerciseImageSrc(name) ?? '/exercise-placeholder.svg'}
                              alt={`${name} billede`}
                              className="h-full w-full object-contain object-center"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Vægt (kg)</span>
                            <span className="text-2xl sm:text-3xl font-semibold">{lastKg}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Reps</span>
                            <span className="text-2xl sm:text-3xl font-semibold">{lastReps}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Sæt</span>
                            <span className="text-2xl sm:text-3xl font-semibold">{sets.length}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {sets.map((s, i) => (
                            <span key={i}>
                              {i ? ', ' : ''}
                              {formatSet(s)}
                            </span>
                          ))}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
