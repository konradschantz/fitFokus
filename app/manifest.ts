import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fit Fokus',
    short_name: 'Fit Fokus',
    description: 'Minimalistisk workout-app med fokus på progression',
    start_url: '/',
    scope: '/',
    id: '/',
    display: 'standalone',
    background_color: '#0b1220',
    theme_color: '#0b1220',
    lang: 'da',
    dir: 'ltr',
    categories: ['fitness', 'health', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: 'Dagens træning',
        short_name: 'Træn i dag',
        url: '/workout/today',
      },
      {
        name: 'Historik',
        short_name: 'Historik',
        url: '/history',
      },
    ],
  }
}
