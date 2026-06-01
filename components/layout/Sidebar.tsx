'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, Target,
  BarChart2, User, LogOut, Wallet, Sun, Moon, Menu, X, ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Budget',       href: '/budget',       icon: PiggyBank },
  { label: 'Savings Goals',href: '/savings',      icon: Target },
  { label: 'Analytics',    href: '/analytics',    icon: BarChart2 },
  { label: 'Profile',      href: '/profile',      icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground tracking-tight">ExpenseIQ</span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Menu</p>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
              isActive(href)
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive(href) ? 'text-primary-foreground' : '')} />
            <span className="flex-1">{label}</span>
            {isActive(href) && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-1 border-t border-border/60 pt-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {theme === 'dark'
            ? <Sun className="w-[18px] h-[18px] text-amber-400" />
            : <Moon className="w-[18px] h-[18px] text-indigo-400" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/60 mt-2">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="gradient-primary text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-card/80 glass border-b border-border/60 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-foreground text-sm">ExpenseIQ</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 glass"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen bg-sidebar border-r border-border/60 fixed left-0 top-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <aside className={cn(
        'lg:hidden flex flex-col w-72 h-screen bg-sidebar fixed left-0 top-0 z-50 transition-transform duration-300 ease-out shadow-2xl',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <NavContent />
      </aside>
    </>
  );
}
