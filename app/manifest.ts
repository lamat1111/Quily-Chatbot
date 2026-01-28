import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quilibrium Chat',
    short_name: 'Quily Chat',
    description: 'Get instant, accurate answers about Quilibrium from official sources',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#F97316',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 16x16',
        type: 'image/x-icon',
      },
    ],
  };
}
