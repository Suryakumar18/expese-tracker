import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import { getUserId, unauthorized } from '@/lib/server-auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  try {
    await connectDB();
    await Budget.findOneAndDelete({ _id: id, userId });
    return NextResponse.json({ success: true, message: 'Budget deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
