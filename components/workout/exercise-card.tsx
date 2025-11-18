"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumberStepInput } from './number-step-input';
import { cn } from '@/lib/utils';
import type { EditableSet } from './types';
import { getExerciseImageSrc } from './exercise-images';

type YogaGuidance = {
  duration: string;
  focus: string;
  cue: string;
  intention: string;
};

const DEFAULT_YOGA_GUIDANCE: YogaGuidance = {
  duration: 'Hold 45-60 sekunder med rolig vejrtrækning',
  focus: 'Hold opmærksomheden på åndedrættet og den samlede kropsfornemmelse.',
  cue: 'Find en stabil grundstilling, forlæng rygsøjlen og slip spændinger gennem skuldrene.',
  intention: 'Skab ro og plads til næste stilling.',
};

const YOGA_GUIDANCE: Record<string, YogaGuidance> = {
  'Sun Salutation A': {
    duration: '2 langsomme runder (ca. 90 sekunder)',
    focus: 'Synkronisér bevægelse og åndedræt for at varme hele kroppen op.',
    cue: 'Start i bjergstilling, løft armene på en indånding og fold forover på udånding. Træd tilbage til planke, rul gennem cobra og vend tilbage til hundestrækket.',
    intention: 'Skab flow og energi inden resten af sekvensen.',
  },
  'Downward Dog': {
    duration: 'Hold 5-8 dybe åndedrag',
    focus: 'Længde i ryg og baglår samtidig med at skuldrene forbliver stabile.',
    cue: 'Pres håndfladerne ned i måtten, løft hofterne mod loftet og lad hælene søge mod gulvet.',
    intention: 'Find længde i kroppen og skab rum til vejrtrækningen.',
  },
  'Warrior II': {
    duration: 'Hold 5 åndedrag på hver side',
    focus: 'Stabilitet i benene og åben brystkasse.',
    cue: 'Hold forreste knæ over anklen, bagfoden aktiv og lad skuldrene hvile over hofterne.',
    intention: 'Indgyd styrke og beslutsomhed.',
  },
  'Tree Pose': {
    duration: 'Hold 4-6 åndedrag pr. side',
    focus: 'Balance og dyb core-aktivering.',
    cue: 'Placér foden mod læg eller lår (undgå knæet), saml hænderne ved hjertet og find et roligt fokuspunkt.',
    intention: 'Skab ro og stabilitet i både krop og sind.',
  },
  "Child's Pose": {
    duration: 'Hold 60 sekunder med blød vejrtrækning',
    focus: 'Afspænding af ryg og hofter.',
    cue: 'Knæl bredt, send hofterne tilbage mod hælene og læg panden i måtten. Lad armene række frem eller hvile langs siden.',
    intention: 'Giv slip og genoplad.',
  },
  'Cat-Cow Stretch': {
    duration: '8-10 rolige gentagelser',
    focus: 'Mobilitet i rygsøjlen og synkroniseret åndedræt.',
    cue: 'På indånding svajer du i ryggen (ko), på udånding runder du (kat). Bevæg dig i hele rygsøjlens længde.',
    intention: 'Væk ryggen blidt og skab bevægelighed.',
  },
  'Cobra Pose': {
    duration: 'Hold 3-4 åndedrag, gentag 2 gange',
    focus: 'Åbning af bryst og styrke i ryggen.',
    cue: 'Placér hænderne under skuldrene, pres toppen af fødderne ned og løft brystet uden at klemme lænden.',
    intention: 'Åbn hjertet og træk vejret ind i brystkassen.',
  },
  'Pigeon Pose': {
    duration: 'Hold 45-60 sekunder pr. side',
    focus: 'Dyb hofteåbning og bevidst vejrtrækning.',
    cue: 'Før det forreste knæ frem bag håndleddet, stræk det bagerste ben langt og fold over benet efter behov.',
    intention: 'Slip spændinger i hofterne og skab plads i underkroppen.',
  },
};

function getYogaGuidance(exerciseName: string): YogaGuidance {
  return YOGA_GUIDANCE[exerciseName] ?? DEFAULT_YOGA_GUIDANCE;
}

export type ExerciseCardProps = {
  value: EditableSet;
  onChange: (value: EditableSet) => void;
  onToggleComplete: () => void;
  onFocus?: () => void;
  onReplace?: () => void;
  onRemove?: () => void;
  disableRemove?: boolean;
  isActive: boolean;
  displayIndex: number;
  planType?: string | null;
};

export function ExerciseCard({
  value,
  onChange,
  onToggleComplete,
  onFocus,
  onReplace,
  onRemove,
  disableRemove,
  isActive,
  displayIndex,
  planType,
}: ExerciseCardProps) {
  const isYoga = planType === 'yoga';
  const yogaGuidance = isYoga ? getYogaGuidance(value.exerciseName) : null;

  return (
    <Card
      className={cn(
        'flex h-full min-h-[360px] flex-col justify-between gap-6 p-6 transition-all duration-200 sm:min-h-[380px] transform-gpu will-change-transform',
        isActive ? 'border-primary/70 shadow-lg shadow-primary/10 scale-100' : 'border-muted/80 bg-background scale-[0.98]'
      )}
    >
      <div className="overflow-hidden rounded-t-xl bg-black -mx-6 -mt-6">
        <div className="relative aspect-video w-full">
          <Image
            src={getExerciseImageSrc(value.exerciseName) ?? '/exercise-placeholder.svg'}
            alt={`${value.exerciseName} billede`}
            fill
            className="object-contain object-center"
            sizes="(max-width: 640px) 100vw, 640px"
            priority={false}
          />
        </div>
      </div>

      <CardHeader className="gap-4 p-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">Øvelse #{displayIndex}</p>
            <p className="text-lg font-semibold text-foreground">{value.exerciseName}</p>
            {value.primaryMuscle ? (
              <p className="text-xs text-muted-foreground">{value.primaryMuscle}</p>
            ) : null}

            {!isYoga && (value.previousWeight != null || value.previousReps) && (
              <p className="mt-1 text-s text-muted-foreground">
                Sidst logget: {value.previousWeight != null ? `${value.previousWeight} kg` : '-'} · {value.previousReps ?? '-'}
              </p>
            )}
          </div>
        
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 p-0">
        {isYoga ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Holdetid & fokus</p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {yogaGuidance?.duration ?? DEFAULT_YOGA_GUIDANCE.duration}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {yogaGuidance?.focus ?? DEFAULT_YOGA_GUIDANCE.focus}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guidet cue</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {yogaGuidance?.cue ?? DEFAULT_YOGA_GUIDANCE.cue}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intention</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {yogaGuidance?.intention ?? DEFAULT_YOGA_GUIDANCE.intention}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <span className="text-base font-semibold text-muted-foreground">Vægt (kg)</span>
              <NumberStepInput
                value={value.weight}
                onChange={(weight) => onChange({ ...value, weight })}
                step={2.5}
                min={0}
                placeholder="Vægt"
                inputProps={{
                  'data-set-input': 'true',
                  name: `weight-${value.orderIndex}`,
                  onFocus,
                  className: 'h-11 text-base',
                }}
              />
            </div>
            <div className="space-y-2">
              <span className="text-base font-semibold text-muted-foreground">Sæt</span>
              <NumberStepInput
                value={value.sets}
                onChange={(sets) => onChange({ ...value, sets })}
                step={1}
                min={1}
                placeholder="Sæt"
                inputProps={{
                  'data-set-input': 'true',
                  name: `sets-${value.orderIndex}`,
                  onFocus,
                  className: 'h-11 text-base',
                }}
              />
            </div>
            <div className="space-y-2">
              <span className="text-base font-semibold text-muted-foreground">Reps</span>
              <NumberStepInput
                value={value.reps}
                onChange={(reps) => onChange({ ...value, reps })}
                min={0}
                placeholder="Reps"
                inputProps={{
                  'data-set-input': 'true',
                  name: `reps-${value.orderIndex}`,
                  onFocus,
                  className: 'h-11 text-base',
                }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={onToggleComplete}
          className={cn(
            'h-12 text-base opacity-100',
            value.completed
              ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-600/10'
              : 'bg-emerald-600 text-white hover:bg-emerald-600/90'
          )}
          variant={value.completed ? 'outline' : 'default'}
        >
          {value.completed ? 'Marker som ikke udført' : 'Marker som udført'}
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={onReplace}>
            Replace workout
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={onRemove}
            disabled={disableRemove}
          >
            Fjern øvelse
          </Button>
        </div>
      </div>
    </Card>
  );
}
