import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, valueColor, trend, trendUp }: StatCardProps) {
  return (
    <Card className="card-hover bg-card border-border/60 shadow-sm hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={cn('text-2xl font-bold tracking-tight truncate', valueColor || 'text-foreground')}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full',
                trendUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
              )}>
                {trendUp ? '↑' : '↓'} {trend}
              </div>
            )}
          </div>
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
