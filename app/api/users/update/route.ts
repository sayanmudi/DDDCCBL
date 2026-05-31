import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getUsersCollection } from '../../../../lib/mongodb';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, role, resetPassword } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (!role && !resetPassword) {
    return NextResponse.json({ error: 'No update action provided' }, { status: 400 });
  }

  const users = await getUsersCollection();
  const updateFields: any = {};

  if (role) {
    updateFields.role = role;
  }

  if (resetPassword) {
    updateFields.password = 'Admin@123';
  }

  const result = await users.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { returnDocument: 'after', projection: { _id: 0, userId: 1, role: 1 } }
  );

  if (!result?.value) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ updatedUser: result.value });
}
