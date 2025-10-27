'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export function RestTimer({ defaultSeconds = 90 }: { defaultSeconds?: number }) {
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
    }
  }, [remaining, running]);

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-muted bg-background/70 p-3 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Restetimer</p>
        <p className="text-2xl font-semibold tabular-nums">{minutes}:{seconds}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setRemaining(defaultSeconds);
            setRunning(true);
          }}
        >
          Start
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setRunning(false);
          }}
        >
          Stop
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setRemaining(defaultSeconds);
            setRunning(false);
          }}
        >
          Nulstil
        </Button>
      </div>
    </div>
  );
}
