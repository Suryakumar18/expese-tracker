'use client';

import { useState } from 'react';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categoryConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, ChevronDown, X } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; transaction?: Transaction; }

export function TransactionForm({ open, onClose, transaction }: Props) {
  const isEdit = !!transaction;
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [form, setForm] = useState({
    amount: transaction?.amount?.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    paymentMethod: transaction?.paymentMethod || 'UPI',
    transactionDate: transaction?.transactionDate
      ? format(new Date(transaction.transactionDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    notes: transaction?.notes || '',
  });

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, type, amount: parseFloat(form.amount), transactionDate: new Date(form.transactionDate) };
    if (isEdit) await update.mutateAsync({ id: transaction!._id, ...(payload as any) });
    else        await create.mutateAsync(payload as any);
    onClose();
  };

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/60 shadow-2xl p-0 overflow-hidden gap-0 sm:max-w-md w-full bottom-0 sm:bottom-auto translate-y-0 rounded-t-3xl sm:rounded-2xl max-h-[92dvh] overflow-y-auto">

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50">
          <div>
            <h2 className="text-base font-bold text-foreground">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? 'Update the details below' : 'Fill in the details'}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-muted/60 rounded-2xl">
            {(['expense', 'income'] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setType(t); setForm(f => ({ ...f, category: '' })); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-sm font-semibold transition-all duration-200',
                  type === t
                    ? t === 'expense'
                      ? 'bg-card shadow-sm text-red-600 dark:text-red-400'
                      : 'bg-card shadow-sm text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                )}>
                {t === 'expense' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {t === 'expense' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>

          {/* Big amount input */}
          <div className={cn(
            'rounded-2xl p-4 transition-colors',
            type === 'expense' ? 'bg-red-500/5 dark:bg-red-500/10' : 'bg-emerald-500/5 dark:bg-emerald-500/10'
          )}>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Amount</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-2xl font-bold',
                type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {type === 'expense' ? '-' : '+'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                placeholder="0.00"
                className="flex-1 text-2xl font-bold bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/40 w-full"
              />
            </div>
          </div>

          {/* Category pills */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const cfg = getCategoryConfig(cat);
                const Icon = cfg.icon;
                const active = form.category === cat;
                return (
                  <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={cn(
                      'flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-all duration-150',
                      active
                        ? `${cfg.bg} ${cfg.iconColor} border-current/30`
                        : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
                    )}>
                    <Icon className="w-3 h-3" strokeWidth={2} />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Description</p>
            <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required
              className="h-10 bg-muted/50 border-border/50 focus-visible:ring-primary text-sm" placeholder="What was this for?" />
          </div>

          {/* Date + Payment row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Date</p>
              <Input type="date" value={form.transactionDate} onChange={(e) => setForm(f => ({ ...f, transactionDate: e.target.value }))} required
                className="h-10 bg-muted/50 border-border/50 focus-visible:ring-primary text-sm" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Payment</p>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm(f => ({ ...f, paymentMethod: v ?? 'Cash' }))}>
                <SelectTrigger className="h-10 bg-muted/50 border-border/50 focus:ring-primary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Notes (optional)</p>
            <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="bg-muted/50 border-border/50 resize-none focus-visible:ring-primary text-sm" rows={2}
              placeholder="Add a note..." />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1 pb-2">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 h-11 border-border/60 hover:bg-muted/80 rounded-xl font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !form.category || !form.amount}
              className={cn(
                'flex-1 h-11 rounded-xl font-bold border-0 shadow-lg hover:opacity-90 text-white transition-all',
                type === 'expense'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/25'
              )}>
              {isPending ? 'Saving...' : isEdit ? 'Update' : type === 'expense' ? 'Add Expense' : 'Add Income'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
