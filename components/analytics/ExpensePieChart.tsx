'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORY_COLORS } from '@/lib/types';
import { useTheme } from 'next-themes';

interface Props { data: { _id: string; total: number }[]; currency: string; }

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.07) return null;
  const R = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + R * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + R * Math.sin(-midAngle * (Math.PI / 180));
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ExpensePieChart({ data, currency }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const chartData = data.map(d => ({ name: d._id, value: d.total }));
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: '10px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    fontSize: '12px',
    fontWeight: 500,
  };

  return (
    <Card className="bg-card border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Expense by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel}
                outerRadius={100} innerRadius={40} dataKey="value" paddingAngle={2}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#8b5cf6'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${currency}${Number(value).toLocaleString()}`, 'Amount']}
                contentStyle={tooltipStyle}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px', fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
