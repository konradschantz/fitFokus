'use client';

import { useMemo } from 'react';

export type TinyChartPoint = {
  label: string;
  value: number;
};

type TinyChartProps = {
  points: TinyChartPoint[];
};

export function TinyChart({ points }: TinyChartProps) {
  const path = useMemo(() => {
    if (points.length === 0) return '';
    const width = 120;
    const height = 40;
    const max = Math.max(...points.map((p) => p.value));
    const min = Math.min(...points.map((p) => p.value));
    const range = max - min || 1;
    return points
      .map((point, index) => {
        const x = (index / (points.length - 1 || 1)) * width;
        const y = height - ((point.value - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }, [points]);

  return (
    <svg viewBox="0 0 120 40" className="h-10 w-28">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
    </svg>
  );
}
