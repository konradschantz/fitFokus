'use client';

import { useEffect } from 'react';

export function ScreenWakeLock() {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    let isRequesting = false;

    const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

    const handleRelease = () => {
      wakeLock?.removeEventListener('release', handleRelease);
      wakeLock = null;
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    const requestWakeLock = async () => {
      if (!isSupported || isRequesting || wakeLock) return;
      isRequesting = true;

      try {
        const sentinel = await navigator.wakeLock!.request('screen');
        wakeLock = sentinel;
        wakeLock.addEventListener('release', handleRelease);
      } catch (error) {
        console.warn('Unable to acquire screen wake lock', error);
      } finally {
        isRequesting = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.removeEventListener('release', handleRelease);
        wakeLock
          .release()
          .catch((error) => {
            console.warn('Unable to release screen wake lock', error);
          });
        wakeLock = null;
      }
    };
  }, []);

  return null;
}
