'use client'

import { useEffect } from 'react'

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    const controller = new AbortController()
    const { signal } = controller
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        // trigger check for updates
        void reg.update()
        let reloaded = false
        const reloadOnce = () => {
          if (reloaded) return; reloaded = true; window.location.reload()
        }
        navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { signal })
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && reg.waiting && navigator.serviceWorker.controller) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('SW registration failed', err)
      }
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { signal })
    return () => controller.abort()
  }, [])
  return null
}
