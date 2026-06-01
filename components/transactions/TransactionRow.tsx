'use client';

import { Transaction } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categoryConfig';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  transaction: Transaction;
  currency: string;
  onEdit: (tx: Transaction) => void;
}

export function TransactionRow({ transaction: tx, currency, onEdit }: Props) {
  const { icon: Icon, bg, iconColor } = getCategoryConfig(tx.category);
  const deleteMutation = useDeleteTransaction();
  const [pressed, setPressed] = useState(false);

  const isIncome = tx.type === 'income';

  return (
    <div
      className={cn(
        'group flex items-center gap-3.5 px-4 py-3 transition-all duration-150 relative',
        pressed ? 'bg-muted/80 scale-[0.98]' : 'hover:bg-muted/40 active:bg-muted/60',
      )}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {/* Category icon */}
      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.8} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-foreground leading-tight truncate">
          {tx.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0 rounded-full',
            isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
          )}>
            {tx.category}
          </span>
          <span className="text-[10px] text-muted-foreground/60">·</span>
          <span className="text-[10px] text-muted-foreground">{tx.paymentMethod}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className={cn(
          'text-[14px] font-bold tabular-nums',
          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
        )}>
          {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-xl border border-border/60 shadow-md px-1.5 py-1">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-border/60" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${tx.description}"?`)) deleteMutation.mutate(tx._id);
          }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
