
'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarRail } from '../ui/sidebar';
import Link from 'next/link';
import { Logo } from '../icons/logo';
import { SidebarNav } from './sidebar-nav';
import { Header } from '../header';
import { LoadingScreen } from './loading-screen';

const publicPaths = ['/login', '/signup', '/forgot-password'];

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b">
            <Link href="/" className="flex h-14 items-center gap-2 px-4">
              <Logo className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">HabitZen</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const pathIsPublic = publicPaths.includes(pathname);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !pathIsPublic) {
      router.push('/login');
    }

    if (user && pathIsPublic) {
      router.push('/');
    }
  }, [user, loading, router, pathname, pathIsPublic]);
  
  if (loading) {
    return <LoadingScreen />;
  }

  if (pathIsPublic && !user) {
    return <>{children}</>;
  }

  if (!pathIsPublic && user) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Fallback loader while redirecting
  return <LoadingScreen />;
}
