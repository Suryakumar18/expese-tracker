import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SavingsGoal from '@/lib/models/SavingsGoal';
import { getUserId, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get('status');
    const query: any = { userId };
    if (status) query.status = status;
    const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, goals });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  try {
    await connectDB();
    const body = await req.json();
    const goal = await SavingsGoal.create({ ...body, userId });
    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
