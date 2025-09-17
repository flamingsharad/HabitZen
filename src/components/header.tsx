
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeSwitcher } from './theme-switcher';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Flame, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { getHabits } from '@/lib/data';
import { Logo } from '@/components/icons/logo';

export function Header() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    async function fetchLongestStreak() {
      if (user) {
        try {
          const allHabits = await getHabits();
          const maxStreak = allHabits.length > 0 ? Math.max(0, ...allHabits.map(h => h.streak)) : 0;
          setLongestStreak(maxStreak);
        } catch (error) {
          console.error("Failed to fetch habits for streak", error);
        }
      }
    }
    fetchLongestStreak();
  }, [user, userData]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const avatarSrc = userData?.avatarUrl || user?.photoURL;
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="sm:hidden">
          <Menu />
        </SidebarTrigger>
        <Link href="/" className="hidden sm:flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">HabitZen</span>
        </Link>
      </div>

      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-muted-foreground">{format(new Date(), 'EEE, MMM d')}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500"/>
            <span className="font-semibold">{longestStreak}</span>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                {user && userData && (
                  <Avatar className="h-9 w-9">
                    {avatarSrc && <AvatarImage src={avatarSrc} alt={user.displayName ?? ''} data-ai-hint="person avatar" />}
                    <AvatarFallback>{(userData?.name || user.displayName)?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {userData && <DropdownMenuLabel>{userData.name}</DropdownMenuLabel>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/achievements">Achievements</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex w-full items-center justify-between">
                    <span>Theme</span>
                    <ThemeSwitcher />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
}
