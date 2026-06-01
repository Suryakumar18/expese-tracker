'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface TrendItem { _id: { year: number; month: number; type: string }; total: number; }
interface Props { data: TrendItem[]; currency: string; }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MonthlyTrendChart({ data, currency }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const monthMap: Record<string, { income: number; expense: number }> = {};
  data.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
    if (item._id.type === 'income') monthMap[key].income = item.total;
    else monthMap[key].expense = item.total;
  });

  const chartData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => {
      const [, month] = key.split('-');
      return { name: MONTHS[Number(month) - 1], ...vals };
    });

  const gridColor  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axisColor  = isDark ? '#475569' : '#94a3b8';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: '10px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    fontSize: '12px',
  };

  return (
    <Card className="bg-card border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis stroke={axisColor} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: any, name: any) => [`${currency}${Number(value).toLocaleString()}`, name]}
                contentStyle={tooltipStyle}
              />
              <Legend iconType="circle" iconSize={8}
                formatter={(value) => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px', fontWeight: 500 }}>{value}</span>} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expenseGrad)" dot={{ fill: '#f43f5e', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
