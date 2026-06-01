import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getUserId, unauthorized } from '@/lib/server-auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  try {
    await connectDB();
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const transaction = await Transaction.findOneAndUpdate({ _id: id, userId }, body, { new: true, runValidators: true });
    if (!transaction) return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    return NextResponse.json({ success: true, transaction });
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
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!transaction) return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
