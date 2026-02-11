'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Settings, LogOut, User, Menu } from 'lucide-react';
import Image from 'next/image';
import { XPDisplay } from '@/components/gamification/xp-display';
import { StreakDisplay } from '@/components/gamification/streak-display';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  xp: number;
  streak: number;
  onMenuClick?: () => void;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group" aria-label="Dronacharya home">
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300 overflow-hidden">
        <Image
          src="/brand/logo.svg"
          alt=""
          width={40}
          height={40}
          className="w-full h-full"
          aria-hidden="true"
        />
        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {/* Logo Text */}
      <div className="hidden sm:flex flex-col" aria-hidden="true">
        <span className="font-bold text-lg sm:text-xl tracking-tight gradient-text">
          Dronacharya
        </span>
        <span className="text-[10px] font-medium gradient-text-gold -mt-0.5 tracking-widest uppercase">
          AI Guru
        </span>
      </div>
    </Link>
  );
}

export function Header({ user, xp, streak, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden hover:bg-primary/10 transition-colors h-9 w-9"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="mr-2 sm:mr-4 flex">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-between space-x-1.5 sm:space-x-2 md:justify-end">
          {/* Search Bar */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground md:w-72 h-9 sm:h-10 text-xs sm:text-sm bg-muted/50 border-border/50 hover:bg-muted hover:border-primary/30 hover:text-foreground transition-all duration-300"
              aria-label="Search courses, press Command K to open"
            >
              <Search className="mr-1 sm:mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Search courses...</span>
              <span className="sm:hidden">Search...</span>
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex" aria-hidden="true">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Gamification Stats */}
            <div className="hidden lg:flex items-center gap-2">
              <XPDisplay xp={xp} />
              <StreakDisplay streak={streak} />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 transition-colors h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Notifications, you have new notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-rose rounded-full animate-pulse" aria-label="New notifications available" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200"
                  aria-label={`User menu for ${user.name}`}
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="gradient-brand text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Mobile-only gamification stats in menu */}
                <div className="lg:hidden px-2 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <XPDisplay xp={xp} />
                    <StreakDisplay streak={streak} />
                  </div>
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem className="cursor-pointer min-h-[44px] sm:min-h-0">
                  <User className="mr-2 h-4 w-4" aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer min-h-[44px] sm:min-h-0">
                  <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive min-h-[44px] sm:min-h-0">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
