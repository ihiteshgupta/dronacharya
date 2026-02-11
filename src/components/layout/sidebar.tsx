'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  BookOpen,
  Route,
  Trophy,
  BarChart3,
  Award,
  Settings,
  HelpCircle,
  Sparkles,
  X,
} from 'lucide-react';

const sidebarItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/paths', label: 'Learning Paths', icon: Route },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/certifications', label: 'Certifications', icon: Award },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 py-6">
        <div className="px-3 py-2">
          {/* Main Navigation */}
          <nav aria-label="Primary navigation">
            <div className="space-y-1" role="list">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start h-11 px-3 relative overflow-hidden transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium sidebar-active'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                    asChild
                    onClick={onItemClick}
                  >
                    <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 transition-colors',
                          isActive ? 'text-primary' : ''
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                      {isActive && (
                        <Sparkles className="ml-auto h-4 w-4 text-primary/60 animate-pulse" aria-hidden="true" />
                      )}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Separator */}
          <div className="my-6 mx-3 h-px bg-border" role="separator" />

          {/* Pro Upgrade Card */}
          <aside className="mx-1 p-4 rounded-xl gradient-brand text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden" aria-label="Upgrade promotion">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" aria-hidden="true" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 animate-pulse" aria-hidden="true" />
                <span className="font-semibold">Go Pro</span>
              </div>
              <p className="text-xs text-white/90 mb-3 leading-relaxed">
                Unlock AI tutoring, advanced analytics, and certificates.
              </p>
              <Button
                size="sm"
                className="w-full bg-white text-primary hover:bg-white/90 hover:scale-105 font-semibold transition-all duration-300 shadow-md"
                aria-label="Upgrade to Pro plan"
              >
                Upgrade Now
              </Button>
            </div>
          </aside>
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="px-3 pb-6 pt-4 border-t">
        <nav aria-label="Secondary navigation">
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-10 px-3 transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  asChild
                  onClick={onItemClick}
                >
                  <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                    <item.icon className="mr-3 h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen = false, onClose, variant = 'desktop' }: SidebarProps) {
  // Mobile Sheet
  if (variant === 'mobile') {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onItemClick={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="hidden border-r bg-sidebar/50 backdrop-blur-sm md:block md:w-64" aria-label="Main navigation">
      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <SidebarContent />
      </div>
    </aside>
  );
}
