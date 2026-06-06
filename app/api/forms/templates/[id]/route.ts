import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { getFormTemplatesCollection } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const action = body.action;

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
  }

  const templatesCollection = await getFormTemplatesCollection();
  const templateId = new ObjectId(id);

  const template = await templatesCollection.findOne({ _id: templateId });
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  if (template.status === 'Approved') {
    return NextResponse.json({ error: 'Template is already approved.' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'Approved' : 'Rejected';

  const result = await templatesCollection.findOneAndUpdate(
    { _id: templateId },
    {
      $set: {
        status: newStatus,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  let updatedTemplate = result?.value;
  if (!updatedTemplate) {
    console.warn('findOneAndUpdate returned null for template approval; retrying fetch', { templateId: id, newStatus });
    await templatesCollection.updateOne(
      { _id: templateId },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );
    updatedTemplate = await templatesCollection.findOne({ _id: templateId });
  }

  if (!updatedTemplate) {
    return NextResponse.json({ error: 'Failed to update template status' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Template ${newStatus.toLowerCase()} successfully.`,
    template: {
      ...updatedTemplate,
      _id: updatedTemplate._id.toString(),
    },
  });
}
