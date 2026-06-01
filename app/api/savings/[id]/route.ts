import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SavingsGoal from '@/lib/models/SavingsGoal';
import { getUserId, unauthorized } from '@/lib/server-auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const goal = await SavingsGoal.findOneAndUpdate({ _id: id, userId }, body, { new: true });
    if (!goal) return NextResponse.json({ success: false, message: 'Goal not found' }, { status: 404 });
    return NextResponse.json({ success: true, goal });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  try {
    await connectDB();
    await SavingsGoal.findOneAndDelete({ _id: id, userId });
    return NextResponse.json({ success: true, message: 'Goal deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
