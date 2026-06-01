'use client';

import { useDashboardStats, useMonthlyTrend } from '@/hooks/useTransactions';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ExpensePieChart } from '@/components/analytics/ExpensePieChart';
import { MonthlyTrendChart } from '@/components/analytics/MonthlyTrendChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import Link from 'next/link';

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const currency = CURRENCY_SYMBOLS[user?.currency || 'INR'] || '₹';
  const [formOpen, setFormOpen] = useState(false);

  const { data: stats, isLoading } = useDashboardStats();
  const { data: trend } = useMonthlyTrend(6);

  if (isLoading) return <DashboardSkeleton />;

  const balance        = stats?.balance || 0;
  const totalIncome    = stats?.totalIncome || 0;
  const totalExpense   = stats?.totalExpense || 0;
  const monthlyIncome  = stats?.monthlyIncome || 0;
  const monthlyExpense = stats?.monthlyExpense || 0;
  const monthlySavings = stats?.monthlySavings || 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here's your financial overview for today</p>
        </div>
        <Button onClick={() => setFormOpen(true)}
          className="gradient-primary border-0 shadow-lg shadow-primary/25 hover:opacity-90 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Transaction
        </Button>
      </div>

      {/* Net Balance hero card */}
      <Card className="border-0 overflow-hidden shadow-xl shadow-primary/10">
        <CardContent className="p-0">
          <div className="gradient-primary p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Net Balance</p>
              <p className="text-4xl font-bold text-white mb-4">
                {balance < 0 ? '-' : ''}{currency}{Math.abs(balance).toLocaleString()}
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Total Income</p>
                  <p className="text-white font-bold text-lg">{currency}{totalIncome.toLocaleString()}</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Total Expenses</p>
                  <p className="text-white font-bold text-lg">{currency}{totalExpense.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This month stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Income" value={`${currency}${monthlyIncome.toLocaleString()}`}
          subtitle="This month" icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-500/10"
          valueColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Monthly Expenses" value={`${currency}${monthlyExpense.toLocaleString()}`}
          subtitle="This month" icon={TrendingDown}
          iconColor="text-red-500" iconBg="bg-red-500/10"
          valueColor="text-red-600 dark:text-red-400" />
        <StatCard title="Monthly Savings" value={`${currency}${monthlySavings.toLocaleString()}`}
          subtitle="This month" icon={PiggyBank}
          iconColor="text-primary" iconBg="bg-primary/10"
          valueColor={monthlySavings >= 0 ? 'text-primary' : 'text-red-500'} />
        <StatCard title="Total Balance" value={`${currency}${balance.toLocaleString()}`}
          subtitle="All time" icon={Wallet}
          iconColor="text-violet-600 dark:text-violet-400" iconBg="bg-violet-500/10"
          valueColor={balance >= 0 ? 'text-foreground' : 'text-red-500'} />
      </div>

      {/* Charts & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={stats?.recentTransactions || []} currency={currency} />
        <ExpensePieChart data={stats?.categoryBreakdown || []} currency={currency} />
      </div>

      {trend && trend.length > 0 && (
        <MonthlyTrendChart data={trend} currency={currency} />
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Budget',   href: '/budget',       emoji: '🎯' },
          { label: 'Savings Goals',   href: '/savings',      emoji: '💰' },
          { label: 'View Analytics',  href: '/analytics',    emoji: '📊' },
          { label: 'All Transactions',href: '/transactions', emoji: '📋' },
        ].map(({ label, href, emoji }) => (
          <Link key={href} href={href}>
            <Card className="card-hover bg-card border-border/60 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all">
              <CardContent className="p-4 text-center">
                <span className="text-2xl">{emoji}</span>
                <p className="text-xs font-semibold text-muted-foreground mt-2">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
