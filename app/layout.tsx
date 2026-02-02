import type { Metadata } from 'next';
import { Inter, Jost } from 'next/font/google';
import { ThemeProvider } from '@/src/components/providers/ThemeProvider';
import { AppLayout } from '@/src/components/layout/AppLayout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
});

export const metadata: Metadata = {
  title: 'Quily Chat',
  description: 'Get instant, accurate answers about Quilibrium from official sources',
  metadataBase: new URL('https://quily.quilibrium.one'),
  openGraph: {
    title: 'Quily Chat',
    description: 'Get instant, accurate answers about Quilibrium from official sources',
    url: 'https://quily.quilibrium.one',
    siteName: 'Quily Chat',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quily Chat',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quily Chat',
    description: 'Get instant, accurate answers about Quilibrium from official sources',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jost.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
