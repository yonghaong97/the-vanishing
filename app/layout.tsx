import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoryProvider } from '@/lib/storyContext';

export const metadata: Metadata = {
  title: 'The Vanishing',
  description: 'A found-phone narrative mystery.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="min-h-screen bg-black antialiased">
        <StoryProvider>
          {children}
        </StoryProvider>
      </body>
    </html>
  );
}
