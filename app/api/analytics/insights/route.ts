import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getUserId, unauthorized } from '@/lib/server-auth';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  try {
    await connectDB();
    const uid = new Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonth, lastMonth, topCategory] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: uid, type: 'expense', transactionDate: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { userId: uid, type: 'expense', transactionDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: uid, type: 'expense', transactionDate: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const insights: string[] = [];
    const lastMonthMap = lastMonth.reduce((acc: Record<string, number>, t) => { acc[t._id] = t.total; return acc; }, {});

    thisMonth.forEach(cat => {
      const lastAmt = lastMonthMap[cat._id] || 0;
      if (lastAmt > 0) {
        const diff = ((cat.total - lastAmt) / lastAmt) * 100;
        if (diff > 20) insights.push(`You spent ${diff.toFixed(0)}% more on ${cat._id} this month compared to last month.`);
        else if (diff < -20) insights.push(`Great job! You reduced ${cat._id} spending by ${Math.abs(diff).toFixed(0)}% this month.`);
      }
    });

    if (topCategory.length > 0) {
      insights.push(`Your highest spending category this month is ${topCategory[0]._id} (₹${topCategory[0].total.toFixed(0)}).`);
    }

    const totalThisMonth = thisMonth.reduce((sum, t) => sum + t.total, 0);
    const totalLastMonth = lastMonth.reduce((sum, t) => sum + t.total, 0);
    if (totalLastMonth > 0) {
      const overall = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
      if (overall > 0) insights.push(`Overall spending is up ${overall.toFixed(0)}% this month.`);
      else insights.push(`Overall spending is down ${Math.abs(overall).toFixed(0)}% this month — great discipline!`);
    }

    if (insights.length === 0) insights.push('Keep tracking your expenses to get personalized insights!');

    return NextResponse.json({ success: true, insights });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
