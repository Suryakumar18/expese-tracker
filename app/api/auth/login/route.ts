import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    const token = generateToken(user._id.toString());
    return NextResponse.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency, profileImage: user.profileImage },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
