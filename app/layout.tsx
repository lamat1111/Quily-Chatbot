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
  title: 'Quilibrium Chat',
  description: 'Get instant, accurate answers about Quilibrium from official sources',
  metadataBase: new URL('https://quily.quilibrium.one'),
  openGraph: {
    title: 'Quilibrium Chat',
    description: 'Get instant, accurate answers about Quilibrium from official sources',
    url: 'https://quily.quilibrium.one',
    siteName: 'Quilibrium Chat',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quilibrium Chat',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quilibrium Chat',
    description: 'Get instant, accurate answers about Quilibrium from official sources',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
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
