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
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [totals, monthly, recent, categoryBreakdown] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: uid, transactionDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.find({ userId: uid }).sort({ transactionDate: -1 }).limit(5),
      Transaction.aggregate([
        { $match: { userId: uid, type: 'expense', transactionDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpense = totals.find(t => t._id === 'expense')?.total || 0;
    const monthlyIncome = monthly.find(t => t._id === 'income')?.total || 0;
    const monthlyExpense = monthly.find(t => t._id === 'expense')?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalIncome, totalExpense,
        balance: totalIncome - totalExpense,
        monthlyIncome, monthlyExpense,
        monthlySavings: monthlyIncome - monthlyExpense,
        recentTransactions: recent,
        categoryBreakdown,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
