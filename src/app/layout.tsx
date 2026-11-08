import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Breath Garden • Tactile ASMR Botanical Sanctuary',
  description:
    'A single-mechanic, tactile ASMR plant game designed for calm, low-energy play. No timers, no scoring, no guilt.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#07090D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full w-full">
      <body className="h-full w-full bg-zen-950 text-zen-mist antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
