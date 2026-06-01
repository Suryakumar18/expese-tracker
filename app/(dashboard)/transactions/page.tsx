'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuthStore } from '@/store/authStore';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionGroup } from '@/components/transactions/TransactionGroup';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categoryConfig';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plus, Search, SlidersHorizontal, X, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const ALL_CATEGORIES = ['All', ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES.filter(c => c !== 'Other'), 'Other'];
const TYPE_FILTERS = [
  { label: 'All',      value: '' },
  { label: 'Expenses', value: 'expense' },
  { label: 'Income',   value: 'income' },
];

function groupByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce((groups: Record<string, Transaction[]>, tx) => {
    const key = format(new Date(tx.transactionDate), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
    return groups;
  }, {});
}

function TransactionSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3">
          <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40 rounded" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const currency = CURRENCY_SYMBOLS[user?.currency || 'INR'] || '₹';

  const [formOpen, setFormOpen]     = useState(false);
  const [editTx, setEditTx]         = useState<Transaction | undefined>();
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]             = useState(1);

  const now = new Date();
  const params = {
    page, limit: 50,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
    ...(catFilter && catFilter !== 'All' && { category: catFilter }),
  };

  const { data, isLoading } = useTransactions(params);
  const transactions: Transaction[] = data?.transactions || [];

  const grouped = useMemo(() => groupByDate(transactions), [transactions]);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const activeFilters = [typeFilter, catFilter && catFilter !== 'All' ? catFilter : ''].filter(Boolean).length;

  const openAdd  = () => { setEditTx(undefined); setFormOpen(true); };
  const openEdit = (tx: Transaction) => { setEditTx(tx); setFormOpen(true); };

  return (
    <div className="space-y-0 animate-in -mx-4 lg:-mx-8 -mt-6 lg:-mt-8">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 lg:top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 lg:px-8 pt-4 lg:pt-6 pb-3 space-y-3">
          {/* Title + FAB */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Transactions</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{data?.total || 0} records</p>
            </div>
            <button onClick={openAdd}
              className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search transactions..."
                className="pl-10 h-10 bg-muted/60 border-0 rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-primary/50" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center border transition-all relative',
                showFilters || activeFilters > 0
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/60 border-0 text-muted-foreground hover:text-foreground'
              )}>
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Filter pills */}
          {showFilters && (
            <div className="space-y-2 pb-1">
              {/* Type */}
              <div className="flex gap-1.5">
                {TYPE_FILTERS.map(({ label, value }) => (
                  <button key={value} onClick={() => { setTypeFilter(value); setPage(1); }}
                    className={cn(
                      'h-7 px-3 rounded-full text-xs font-semibold border transition-all',
                      typeFilter === value
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-muted/60 border-border/40 text-muted-foreground hover:bg-muted'
                    )}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Category scrollable */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                {ALL_CATEGORIES.map((cat) => {
                  const cfg = cat !== 'All' ? getCategoryConfig(cat) : null;
                  const Icon = cfg?.icon;
                  const active = catFilter === cat || (cat === 'All' && !catFilter);
                  return (
                    <button key={cat} onClick={() => { setCatFilter(cat === 'All' ? '' : cat); setPage(1); }}
                      className={cn(
                        'flex items-center gap-1 h-7 px-3 rounded-full text-xs font-semibold border whitespace-nowrap transition-all shrink-0',
                        active
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-muted/60 border-border/40 text-muted-foreground hover:bg-muted'
                      )}>
                      {Icon && <Icon className="w-3 h-3" />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary strip */}
        {transactions.length > 0 && (
          <div className="flex border-t border-border/40">
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 border-r border-border/40">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Income</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight">
                  +{currency}{totalIncome.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 border-r border-border/40">
              <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Expenses</p>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 tabular-nums leading-tight">
                  -{currency}{totalExpense.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-3 h-3 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Net</p>
                <p className={cn(
                  'text-xs font-bold tabular-nums leading-tight',
                  totalIncome - totalExpense >= 0 ? 'text-foreground' : 'text-red-600 dark:text-red-400'
                )}>
                  {totalIncome - totalExpense >= 0 ? '+' : '-'}{currency}{Math.abs(totalIncome - totalExpense).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Transaction list ── */}
      <div className="bg-card">
        {isLoading ? (
          <TransactionSkeleton />
        ) : sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground px-6">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Activity className="w-7 h-7 opacity-30" />
            </div>
            <p className="text-base font-semibold text-foreground">No transactions found</p>
            <p className="text-sm text-center mt-1 max-w-xs">
              {search || typeFilter || catFilter
                ? 'Try adjusting your search or filters'
                : 'Tap the + button to add your first transaction'}
            </p>
            {!search && !typeFilter && !catFilter && (
              <button onClick={openAdd}
                className="mt-6 h-11 px-6 gradient-primary rounded-2xl text-white text-sm font-semibold shadow-lg shadow-primary/25">
                Add Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            {sortedDates.map((date) => (
              <TransactionGroup
                key={date}
                date={date}
                transactions={grouped[date]}
                currency={currency}
                onEdit={openEdit}
              />
            ))}

            {/* Load more */}
            {data?.totalPages > page && (
              <div className="flex justify-center p-4">
                <button onClick={() => setPage(p => p + 1)}
                  className="h-9 px-6 rounded-full bg-muted/60 text-muted-foreground text-xs font-semibold hover:bg-muted transition-colors border border-border/50">
                  Load more
                </button>
              </div>
            )}

            <div className="h-6" />
          </>
        )}
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTx(undefined); }}
        transaction={editTx}
      />
    </div>
  );
}
