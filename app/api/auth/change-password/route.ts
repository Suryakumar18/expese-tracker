import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserId, unauthorized } from '@/lib/server-auth';

export async function PUT(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  try {
    await connectDB();
    const { currentPassword, newPassword } = await req.json();
    const user = await User.findById(userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });
    }
    user.password = newPassword;
    await user.save();
    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
