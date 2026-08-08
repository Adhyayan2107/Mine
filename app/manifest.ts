import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adhyayan OS',
    short_name: 'Adhyayan OS',
    description: 'Personal dashboard, to-dos, habits, and journal.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#e9ede8',
    theme_color: '#d94b10',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
