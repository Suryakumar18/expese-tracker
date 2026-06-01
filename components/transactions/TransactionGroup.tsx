'use client';

import { Transaction } from '@/lib/types';
import { TransactionRow } from './TransactionRow';
import { isToday, isYesterday, format } from 'date-fns';

interface Props {
  date: string;
  transactions: Transaction[];
  currency: string;
  onEdit: (tx: Transaction) => void;
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMM d');
}

export function TransactionGroup({ date, transactions, currency, onEdit }: Props) {
  const dayTotal = transactions.reduce((sum, tx) => {
    return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
  }, 0);

  return (
    <div>
      {/* Sticky date header */}
      <div className="flex items-center justify-between px-4 py-2 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {formatGroupDate(date)}
        </span>
        <span className={`text-[11px] font-bold tabular-nums ${
          dayTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
        }`}>
          {dayTotal >= 0 ? '+' : ''}{currency}{Math.abs(dayTotal).toLocaleString()}
        </span>
      </div>

      {/* Transaction rows */}
      <div className="divide-y divide-border/30">
        {transactions.map((tx) => (
          <TransactionRow key={tx._id} transaction={tx} currency={currency} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
