'use client';

import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

interface Props { transactions: Transaction[]; currency: string; }

export function RecentTransactions({ transactions, currency }: Props) {
  return (
    <Card className="bg-card border-border/60 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">Recent Transactions</CardTitle>
        <Link href="/transactions" className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
          View all →
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-4">
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs mt-1">Add your first transaction to get started</p>
          </div>
        )}
        {transactions.map((tx) => (
          <div key={tx._id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              {tx.type === 'income'
                ? <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                : <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">{tx.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{format(new Date(tx.transactionDate), 'MMM d')}</span>
              </div>
            </div>
            <span className={`text-sm font-bold whitespace-nowrap ${
              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
