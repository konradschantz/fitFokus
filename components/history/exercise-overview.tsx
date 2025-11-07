'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type ExerciseEntry = {
  date: string
  weightKg: number | null
  reps: number | null
  completed: boolean
}

export type ExerciseGroup = {
  name: string
  entries: ExerciseEntry[]
}

export function ExerciseOverview({ items }: { items: ExerciseGroup[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Vælg hvordan øvelserne vises:</p>
        <Tabs defaultValue="accordion">
          <TabsList>
            <TabsTrigger value="accordion">Accordion</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>
          <TabsContent value="accordion">
            <div className="space-y-2">
              {sorted.map((g) => {
                const id = g.name
                const isOpen = open === id
                const total = g.entries.length
                const last = g.entries[0]
                return (
                  <div key={id} className="rounded-md border">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : id)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 px-3 py-2 text-left',
                        isOpen ? 'bg-muted/50' : 'bg-background'
                      )}
                    >
                      <span className="font-medium truncate pr-2">{g.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{total} sæt</span>
                    </button>
                    {isOpen && (
                      <div className="px-3 py-2 text-sm">
                        {last ? (
                          <p className="text-muted-foreground">
                            Sidst: {new Date(last.date).toLocaleDateString()} — {last.weightKg ?? '–'} kg × {last.reps ?? '–'} reps
                          </p>
                        ) : (
                          <p className="text-muted-foreground">Ingen data</p>
                        )}
                        <ul className="mt-2 space-y-1">
                          {g.entries.slice(0, 5).map((e, i) => (
                            <li key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{new Date(e.date).toLocaleDateString()}</span>
                              <span>
                                {e.weightKg ?? '–'} kg × {e.reps ?? '–'} reps {e.completed ? '• logget' : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>
          <TabsContent value="list">
            <div className="divide-y rounded-md border">
              {sorted.map((g) => {
                const last = g.entries[0]
                return (
                  <div key={g.name} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="truncate pr-2">{g.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {g.entries.length} sæt{last ? ` • ${new Date(last.date).toLocaleDateString()} • ${last.weightKg ?? '–'} kg × ${last.reps ?? '–'} reps` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

