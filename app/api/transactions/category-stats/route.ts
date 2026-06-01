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
    const now = new Date();
    const m = Number(searchParams.get('month') || now.getMonth() + 1);
    const y = Number(searchParams.get('year') || now.getFullYear());
    const type = searchParams.get('type') || 'expense';

    const stats = await Transaction.aggregate([
      { $match: { userId: uid, type, transactionDate: { $gte: new Date(y, m - 1, 1), $lte: new Date(y, m, 0, 23, 59, 59) } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
