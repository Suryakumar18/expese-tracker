'use client';

import { useState } from 'react';
import { useSavingsGoals, useCreateGoal, useDeleteGoal, useContributeToGoal } from '@/hooks/useSavings';
import { useAuthStore } from '@/store/authStore';
import { SavingsGoal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Target, Trash2, CheckCircle2, Flame, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export default function SavingsPage() {
  const { user } = useAuthStore();
  const currency = CURRENCY_SYMBOLS[user?.currency || 'INR'] || '₹';

  const [formOpen, setFormOpen]             = useState(false);
  const [contributeOpen, setContributeOpen] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState({ goalName: '', targetAmount: '', targetDate: '', description: '' });

  const { data: goals, isLoading } = useSavingsGoals();
  const createGoal  = useCreateGoal();
  const deleteGoal  = useDeleteGoal();
  const contribute  = useContributeToGoal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal.mutateAsync({ ...form, targetAmount: parseFloat(form.targetAmount) } as any);
    setFormOpen(false);
    setForm({ goalName: '', targetAmount: '', targetDate: '', description: '' });
  };

  const totalSaved  = goals?.filter((g: SavingsGoal) => g.status === 'active').reduce((s: number, g: SavingsGoal) => s + g.currentAmount, 0) || 0;
  const totalTarget = goals?.filter((g: SavingsGoal) => g.status === 'active').reduce((s: number, g: SavingsGoal) => s + g.targetAmount, 0) || 0;
  const completed   = goals?.filter((g: SavingsGoal) => g.status === 'completed').length || 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Work towards your financial milestones</p>
        </div>
        <Button onClick={() => setFormOpen(true)}
          className="gradient-primary border-0 shadow-lg shadow-primary/25 hover:opacity-90 text-white gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      {/* Summary */}
      {goals?.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Saved',    value: `${currency}${totalSaved.toLocaleString()}`,   color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Total Target',   value: `${currency}${totalTarget.toLocaleString()}`,  color: 'text-primary' },
            { label: 'Goals Completed',value: `${completed}`,                               color: 'text-foreground' },
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

      {/* Goals */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}
        </div>
      ) : goals?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Target className="w-7 h-7 opacity-40" />
          </div>
          <p className="text-base font-semibold">No savings goals yet</p>
          <p className="text-sm mt-1">Set a goal and start working towards it today</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals?.map((goal: SavingsGoal) => {
            const pct       = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const daysLeft  = differenceInDays(new Date(goal.targetDate), new Date());
            const remaining = goal.targetAmount - goal.currentAmount;
            return (
              <Card key={goal._id} className={`bg-card border-border/60 shadow-sm card-hover ${
                goal.status === 'completed' ? 'border-emerald-500/30' : ''
              }`}>
                <CardHeader className="pb-3 px-5 pt-5 flex flex-row items-start justify-between">
                  <div className="space-y-1.5 min-w-0 flex-1 mr-2">
                    <p className="font-semibold text-foreground text-sm truncate">{goal.goalName}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className={`border-0 text-xs gap-1 ${
                        goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        goal.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {goal.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {goal.status === 'active' && <Flame className="w-2.5 h-2.5" />}
                        {goal.status}
                      </Badge>
                      {goal.status === 'active' && daysLeft > 0 && (
                        <Badge variant="outline" className="text-[10px] border-border/60 gap-1">
                          <Clock className="w-2.5 h-2.5" /> {daysLeft}d left
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteGoal.mutate(goal._id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {goal.description && <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>}

                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-foreground">{currency}{goal.currentAmount.toLocaleString()}</span>
                      <span className="text-muted-foreground">of {currency}{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct >= 100 ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}% funded</span>
                      <span className="text-[10px] text-muted-foreground">
                        Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {goal.status === 'active' && remaining > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Still needed</p>
                        <p className="text-sm font-bold text-primary">{currency}{remaining.toLocaleString()}</p>
                      </div>
                      <Button size="sm" onClick={() => setContributeOpen(goal._id)}
                        className="h-8 px-3 gradient-primary border-0 shadow shadow-primary/20 hover:opacity-90 text-white text-xs">
                        + Add Funds
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border/60 shadow-2xl max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-lg font-semibold">Create Savings Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="px-6 pb-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Goal Name *</Label>
              <Input value={form.goalName} onChange={e => setForm(f => ({ ...f, goalName: e.target.value }))} required
                className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" placeholder="e.g. Emergency Fund" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Amount ({currency}) *</Label>
              <Input type="number" min="1" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} required
                className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" placeholder="50000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Date *</Label>
              <Input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} required
                className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="bg-muted/50 border-border/60 resize-none" rows={2} placeholder="Why is this goal important?" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}
                className="flex-1 border-border/60 hover:bg-muted/80">Cancel</Button>
              <Button type="submit" disabled={createGoal.isPending}
                className="flex-1 gradient-primary border-0 shadow-lg shadow-primary/20 hover:opacity-90 text-white">
                {createGoal.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={!!contributeOpen} onOpenChange={() => { setContributeOpen(null); setContributeAmount(''); }}>
        <DialogContent className="bg-card border-border/60 shadow-2xl max-w-xs p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-base font-semibold">Add Contribution</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount ({currency})</Label>
              <Input type="number" min="1" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)}
                className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" placeholder="1000" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setContributeOpen(null)} className="flex-1 border-border/60 hover:bg-muted/80">Cancel</Button>
              <Button
                onClick={async () => {
                  if (!contributeOpen || !contributeAmount) return;
                  await contribute.mutateAsync({ id: contributeOpen, amount: parseFloat(contributeAmount) });
                  setContributeOpen(null); setContributeAmount('');
                }}
                disabled={contribute.isPending || !contributeAmount}
                className="flex-1 gradient-primary border-0 shadow-lg shadow-primary/20 hover:opacity-90 text-white">
                {contribute.isPending ? 'Adding...' : 'Add Funds'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
