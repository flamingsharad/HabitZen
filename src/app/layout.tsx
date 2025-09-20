
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import ProtectedRoute from '@/components/layout/protected-route';

export const metadata: Metadata = {
  title: 'HabitZen',
  description: 'Track your habits, achieve your goals.',
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#6B46C1" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={['light', 'dark', 'system', 'minimal', 'neon', 'nature']}
        >
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
