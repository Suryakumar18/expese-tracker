import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import Transaction from '@/lib/models/Transaction';
import { getUserId, unauthorized } from '@/lib/server-auth';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  try {
    await connectDB();
    const now = new Date();
    const { searchParams } = req.nextUrl;
    const month = Number(searchParams.get('month') || now.getMonth() + 1);
    const year = Number(searchParams.get('year') || now.getFullYear());
    const uid = new Types.ObjectId(userId);

    const [budgets, spending] = await Promise.all([
      Budget.find({ userId, month, year }),
      Transaction.aggregate([
        {
          $match: {
            userId: uid, type: 'expense',
            transactionDate: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0, 23, 59, 59) },
          },
        },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]),
    ]);

    const spendingMap = spending.reduce((acc: Record<string, number>, s) => { acc[s._id] = s.spent; return acc; }, {});

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      remaining: b.limitAmount - (spendingMap[b.category] || 0),
      exceeded: (spendingMap[b.category] || 0) > b.limitAmount,
      percentage: Math.min(((spendingMap[b.category] || 0) / b.limitAmount) * 100, 100),
    }));

    return NextResponse.json({ success: true, budgets: budgetsWithSpending });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  try {
    await connectDB();
    const { category, limitAmount, month, year } = await req.json();
    const budget = await Budget.findOneAndUpdate(
      { userId, category, month, year },
      { limitAmount },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, budget }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
