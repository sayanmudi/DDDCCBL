import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { getFormSubmissionsCollection, getFormTemplatesCollection } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const userRole = (session.user as any).role as string;
  if (userRole !== 'Manager' && userRole !== 'Admin') {
    return NextResponse.json({ error: 'Only Manager or Admin users can review submissions.' }, { status: 403 });
  }

  const body = await request.json();
  const action = body.action;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  const submissionsCollection = await getFormSubmissionsCollection();
  
  let submissionId: ObjectId;
  try {
    submissionId = new ObjectId(params.id);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid submission ID.' }, { status: 400 });
  }

  const submission = await submissionsCollection.findOne({ _id: submissionId });

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }

  const templatesCollection = await getFormTemplatesCollection();
  let formTemplate;
  try {
    formTemplate = await templatesCollection.findOne({ _id: new ObjectId(submission.templateId) });
  } catch (err) {
    formTemplate = null;
  }

  if (!formTemplate) {
    return NextResponse.json({ error: 'Form template not found for submission.' }, { status: 404 });
  }

  const approvalRoles = Array.isArray(formTemplate.approvalRoles) ? formTemplate.approvalRoles : [];
  if (userRole !== 'Admin' && approvalRoles.length > 0 && !approvalRoles.includes(userRole)) {
    return NextResponse.json({ error: 'You are not authorized to approve or reject this submission.' }, { status: 403 });
  }

  const updateFields: any = {
    status: action === 'approve' ? 'Approved' : 'Rejected',
    updatedAt: new Date(),
    reviewer_comment: action === 'reject' ? body.comment || 'Needs correction' : body.comment || '',
  };

  if (action === 'approve') {
    updateFields.locked = true;
    updateFields.approvedBy = (session.user as any).id;
    updateFields.approvedAt = new Date();
  } else if (action === 'reject') {
    updateFields.locked = false;
    updateFields.rejectedBy = (session.user as any).id;
    updateFields.rejectedAt = new Date();
  }

  const updateDocument: any = { $set: updateFields };
  if (action === 'approve') {
    updateDocument.$unset = { rejectedBy: '', rejectedAt: '' };
  } else if (action === 'reject') {
    updateDocument.$unset = { approvedBy: '', approvedAt: '' };
  }

  let updated;

  try {
    const result = await submissionsCollection.findOneAndUpdate(
      { _id: submissionId },
      updateDocument,
      { returnDocument: 'after' }
    );

    updated = result?.value;

    if (!updated) {
      console.warn('findOneAndUpdate returned null; retrying update and fetch', {
        submissionId: params.id,
        updateFields,
      });

      await submissionsCollection.updateOne({ _id: submissionId }, updateDocument);
      updated = await submissionsCollection.findOne({ _id: submissionId });
    }
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 });
  }

  if (!updated) {
    console.error('Failed to retrieve updated submission after retry', params.id);
    return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 });
  }

  try {
    return NextResponse.json({
      success: true,
      submission: {
        _id: updated._id?.toString?.() ?? updated._id,
        templateId: updated.templateId,
        templateName: updated.templateName,
        submittedBy: updated.submittedBy,
        submittedById: updated.submittedById,
        data: updated.data ?? {},
        status: updated.status,
        locked: updated.locked,
        reviewer_comment: updated.reviewer_comment ?? updated.managerComment ?? '',
        approvedBy: updated.approvedBy ?? null,
        approvedAt: updated.approvedAt?.toISOString?.() ?? updated.approvedAt ?? null,
        rejectedBy: updated.rejectedBy ?? null,
        rejectedAt: updated.rejectedAt?.toISOString?.() ?? updated.rejectedAt ?? null,
        createdAt: updated.createdAt?.toISOString?.() ?? updated.createdAt,
        updatedAt: updated.updatedAt?.toISOString?.() ?? updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('Error serializing updated submission response:', err);
    return NextResponse.json({ error: 'Failed to serialize submission.' }, { status: 500 });
  }
}
