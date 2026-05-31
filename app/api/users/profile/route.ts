import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getUsersCollection } from '../../../../lib/mongodb';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  let userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    const email = (session?.user as any)?.email as string | undefined;
    if (email?.includes('@')) {
      userId = email.split('@')[0];
    }
  }

  if (!session?.user || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');

  let mobile: string | undefined;
  let currentPassword = '';
  let newPassword = '';
  let profilePhoto: File | null = null;

  if (isMultipart) {
    const formData = await request.formData();
    mobile = formData.get('mobile')?.toString().trim();
    currentPassword = formData.get('currentPassword')?.toString() ?? '';
    newPassword = formData.get('newPassword')?.toString() ?? '';
    const fileEntry = formData.get('profilePhoto');
    if (fileEntry instanceof File && fileEntry.size > 0) {
      profilePhoto = fileEntry;
    }
  } else {
    const body = await request.json();
    mobile = body.mobile?.toString().trim();
    currentPassword = body.currentPassword?.toString() ?? '';
    newPassword = body.newPassword?.toString() ?? '';
  }

  const users = await getUsersCollection();
  const currentUser = await users.findOne({ userId });

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updateFields: any = {};

  if (mobile !== undefined) {
    updateFields.mobile = mobile;
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
    }

    if (currentUser.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    updateFields.password = newPassword;
  }

  if (profilePhoto && profilePhoto.size > 0) {
    const photosPath = path.join(process.cwd(), 'public', 'photos');
    await fs.mkdir(photosPath, { recursive: true });

    const fileName = `${userId}_profile.jpg`;
    const filePath = path.join(photosPath, fileName);
    const buffer = Buffer.from(await profilePhoto.arrayBuffer());

    await fs.writeFile(filePath, buffer);
    updateFields.image = `/photos/${fileName}`;
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const result = await users.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { returnDocument: 'after', projection: { _id: 0, userId: 1, mobile: 1, image: 1 } }
  );

  if (!result?.value) {
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 });
  }

  return NextResponse.json({ updated: result.value });
}
