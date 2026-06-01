import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());
    return NextResponse.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
