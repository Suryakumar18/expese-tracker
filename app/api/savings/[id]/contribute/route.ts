import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SavingsGoal from '@/lib/models/SavingsGoal';
import { getUserId, unauthorized } from '@/lib/server-auth';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  try {
    await connectDB();
    const { amount } = await req.json();
    const goal = await SavingsGoal.findOne({ _id: id, userId });
    if (!goal) return NextResponse.json({ success: false, message: 'Goal not found' }, { status: 404 });
    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    if (goal.currentAmount >= goal.targetAmount) goal.status = 'completed';
    await goal.save();
    return NextResponse.json({ success: true, goal });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
