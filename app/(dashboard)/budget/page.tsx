'use client';

import { useState } from 'react';
import { useBudgets, useSetBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { useAuthStore } from '@/store/authStore';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, AlertTriangle, CheckCircle2, PiggyBank } from 'lucide-react';

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function BudgetPage() {
  const { user } = useAuthStore();
  const currency = CURRENCY_SYMBOLS[user?.currency || 'INR'] || '₹';
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [formOpen, setFormOpen]           = useState(false);
  const [form, setForm]                   = useState({ category: '', limitAmount: '' });

  const { data: budgets, isLoading } = useBudgets(selectedMonth, selectedYear);
  const setBudget   = useSetBudget();
  const deleteBudget = useDeleteBudget();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setBudget.mutateAsync({ category: form.category, limitAmount: parseFloat(form.limitAmount), month: selectedMonth, year: selectedYear });
    setFormOpen(false);
    setForm({ category: '', limitAmount: '' });
  };

  const totalBudget  = budgets?.reduce((s: number, b: any) => s + b.limitAmount, 0) || 0;
  const totalSpent   = budgets?.reduce((s: number, b: any) => s + (b.spent || 0), 0) || 0;
  const overBudget   = budgets?.filter((b: any) => b.exceeded).length || 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Budget Manager</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Set limits and track your spending</p>
        </div>
        <Button onClick={() => setFormOpen(true)}
          className="gradient-primary border-0 shadow-lg shadow-primary/25 hover:opacity-90 text-white gap-2">
          <Plus className="w-4 h-4" /> Set Budget
        </Button>
      </div>

      {/* Month/Year selector */}
      <div className="flex gap-2 flex-wrap">
        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v ?? selectedMonth))}>
          <SelectTrigger className="w-40 h-9 text-sm bg-card border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/60">
            {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v ?? selectedYear))}>
          <SelectTrigger className="w-24 h-9 text-sm bg-card border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/60">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary row */}
      {budgets?.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Budget',  value: `${currency}${totalBudget.toLocaleString()}`,  color: 'text-primary' },
            { label: 'Total Spent',   value: `${currency}${totalSpent.toLocaleString()}`,   color: 'text-red-600 dark:text-red-400' },
            { label: 'Over Budget',   value: `${overBudget} categor${overBudget === 1 ? 'y' : 'ies'}`, color: overBudget ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-card border-border/60 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : budgets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <PiggyBank className="w-7 h-7 opacity-40" />
          </div>
          <p className="text-base font-semibold">No budgets for {MONTHS[selectedMonth - 1]} {selectedYear}</p>
          <p className="text-sm mt-1">Click &quot;Set Budget&quot; to add spending limits</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets?.map((budget: any) => (
            <Card key={budget._id} className={`bg-card border-border/60 shadow-sm card-hover ${
              budget.exceeded ? 'border-red-500/40 dark:border-red-500/30' : ''
            }`}>
              <CardHeader className="pb-3 px-5 pt-5 flex flex-row items-start justify-between">
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground text-sm">{budget.category}</p>
                  {budget.exceeded ? (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-xs gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Over budget
                    </Badge>
                  ) : budget.percentage >= 80 ? (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-xs gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Near limit
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> On track
                    </Badge>
                  )}
                </div>
                <button onClick={() => deleteBudget.mutate(budget._id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">
                      {currency}{budget.spent?.toLocaleString() || 0} spent
                    </span>
                    <span className="font-semibold text-foreground">{(budget.percentage || 0).toFixed(0)}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          budget.exceeded ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Limit</p>
                    <p className="font-bold text-foreground">{currency}{budget.limitAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Remaining</p>
                    <p className={`font-bold ${budget.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {budget.remaining < 0 ? '-' : ''}{currency}{Math.abs(budget.remaining || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Set Budget Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border/60 shadow-2xl max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-lg font-semibold">
              Set Budget — {MONTHS[selectedMonth - 1]} {selectedYear}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v ?? '' }))}>
                <SelectTrigger className="h-10 bg-muted/50 border-border/60 focus:ring-primary">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Budget Limit ({currency})
              </Label>
              <Input type="number" min="1" step="1" value={form.limitAmount}
                onChange={(e) => setForm(f => ({ ...f, limitAmount: e.target.value }))} required
                className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" placeholder="e.g. 5000" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}
                className="flex-1 border-border/60 hover:bg-muted/80">Cancel</Button>
              <Button type="submit" disabled={setBudget.isPending}
                className="flex-1 gradient-primary border-0 shadow-lg shadow-primary/20 hover:opacity-90 text-white">
                {setBudget.isPending ? 'Saving...' : 'Set Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
