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
    const { searchParams } = req.nextUrl;
    const period = searchParams.get('period') || 'monthly';
    const now = new Date();
    const m = Number(searchParams.get('month') || now.getMonth() + 1);
    const y = Number(searchParams.get('year') || now.getFullYear());

    let startDate: Date, endDate: Date;
    if (period === 'monthly') {
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0, 23, 59, 59);
    } else if (period === 'yearly') {
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 11, 31, 23, 59, 59);
    } else if (period === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now); startDate.setDate(now.getDate() - day);
      endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6);
    } else {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    const [transactions, summary] = await Promise.all([
      Transaction.find({ userId: uid, transactionDate: { $gte: startDate, $lte: endDate } }).sort({ transactionDate: -1 }),
      Transaction.aggregate([
        { $match: { userId: uid, transactionDate: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({ success: true, transactions, summary, period, startDate, endDate });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
