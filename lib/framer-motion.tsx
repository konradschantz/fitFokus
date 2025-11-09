import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

type MotionTransition = {
  readonly type?: 'spring';
  readonly duration?: number;
  readonly delay?: number;
};

type MotionProps = HTMLAttributes<HTMLDivElement> & {
  readonly initial?: CSSProperties;
  readonly animate?: CSSProperties;
  readonly transition?: MotionTransition;
};

function createTransition(transition?: MotionTransition): string | undefined {
  if (!transition) {
    return undefined;
  }
  const duration = typeof transition.duration === 'number' ? transition.duration : 0.6;
  const delay = typeof transition.delay === 'number' ? transition.delay : 0;
  const easing = transition.type === 'spring' ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'ease';
  return `transform ${duration}s ${easing} ${delay}s, opacity ${duration}s ${easing} ${delay}s`;
}

const MotionDiv = forwardRef<HTMLDivElement, MotionProps>(({ initial, animate, style, transition, ...props }, ref) => {
  const hasMountedRef = useRef(false);
  const [currentStyle, setCurrentStyle] = useState<CSSProperties>(() => ({
    ...(style ?? {}),
    ...(initial ?? {}),
  }));

  const transitionValue = useMemo(() => createTransition(transition), [transition]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const frame = requestAnimationFrame(() => {
        setCurrentStyle((prev) => ({
          ...prev,
          ...(style ?? {}),
          ...(animate ?? {}),
        }));
      });
      return () => cancelAnimationFrame(frame);
    }

    setCurrentStyle((prev) => ({
      ...prev,
      ...(style ?? {}),
      ...(animate ?? {}),
    }));
  }, [animate, style]);

  return (
    <div
      {...props}
      ref={ref}
      style={{
        ...(currentStyle ?? {}),
        ...(transitionValue ? { transition: transitionValue } : {}),
      }}
    />
  );
});

MotionDiv.displayName = 'MotionDiv';

export const motion = {
  div: MotionDiv,
};

export const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
