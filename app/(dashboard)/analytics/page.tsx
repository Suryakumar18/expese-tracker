'use client';

import { useState } from 'react';
import { useCategoryStats, useMonthlyTrend } from '@/hooks/useTransactions';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { ExpensePieChart } from '@/components/analytics/ExpensePieChart';
import { MonthlyTrendChart } from '@/components/analytics/MonthlyTrendChart';
import { IncomeExpenseBar } from '@/components/analytics/IncomeExpenseBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/types';
import api from '@/lib/api';

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const currency = CURRENCY_SYMBOLS[user?.currency || 'INR'] || '₹';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const { data: expenseStats, isLoading: loadingE } = useCategoryStats({ month, year, type: 'expense' });
  const { data: incomeStats,  isLoading: loadingI } = useCategoryStats({ month, year, type: 'income' });
  const { data: trend } = useMonthlyTrend(6);
  const { data: insights, isLoading: loadingInsights } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => { const { data } = await api.get('/analytics/insights'); return data.insights as string[]; },
  });

  const totalExpense = expenseStats?.reduce((s: number, i: any) => s + i.total, 0) || 0;
  const totalIncome  = incomeStats?.reduce((s: number, i: any) => s + i.total, 0) || 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Deep insights into your financial patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v ?? month))}>
            <SelectTrigger className="w-36 h-9 text-sm bg-card border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/60">
              {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v ?? year))}>
            <SelectTrigger className="w-24 h-9 text-sm bg-card border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/60">
              {[now.getFullYear() - 1, now.getFullYear()].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Insights */}
      <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
        <div className="h-1 gradient-primary" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            </div>
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInsights ? (
            <div className="space-y-2.5">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 rounded" />)}</div>
          ) : (
            <ul className="space-y-2.5">
              {insights?.map((insight, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </div>
                  {insight}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Monthly summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{MONTHS[month-1]} Income</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{currency}{totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{MONTHS[month-1]} Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{currency}{totalExpense.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {loadingE ? <Skeleton className="h-80 rounded-2xl" /> : <ExpensePieChart data={expenseStats || []} currency={currency} />}

        {/* Income breakdown */}
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Income Breakdown — {MONTHS[month-1]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {loadingI ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)
            ) : !incomeStats?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No income recorded this month</p>
            ) : incomeStats.map((item: any) => {
              const pct = totalIncome > 0 ? (item.total / totalIncome) * 100 : 0;
              return (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item._id] || '#8b5cf6' }} />
                      <span className="font-medium text-foreground">{item._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{pct.toFixed(0)}%</Badge>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{currency}{item.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[item._id] || '#8b5cf6' }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {trend && trend.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <MonthlyTrendChart data={trend} currency={currency} />
          <IncomeExpenseBar data={trend} currency={currency} />
        </div>
      )}
    </div>
  );
}
