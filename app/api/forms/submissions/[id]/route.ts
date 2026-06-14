import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import {
  canAccessSubmissionByBranch,
  getUserBranchCode,
  normalizeBranchCode,
  resolveSubmissionBranchCode,
} from '../../../../../lib/branchAccess';
import { getFormSubmissionsCollection, getFormTemplatesCollection } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const userRole = (session.user as any).role as string;
  const reviewerId = (session.user as any).id as string | undefined;
  if (userRole !== 'Manager' && userRole !== 'Admin' && userRole !== 'Supervisor') {
    return NextResponse.json({ error: 'Only Manager ,Supervisor or Admin users can review submissions.' }, { status: 403 });
  }

  const reviewerBranchCode =
    normalizeBranchCode((session.user as any).branch_code) || (await getUserBranchCode(reviewerId));

  const body = await request.json();
  const action = body.action;
  
  // Handle unlock action for Manager
  if (action === 'unlock') {
    if (userRole !== 'Manager' && userRole !== 'Admin') {
      return NextResponse.json({ error: 'Only Manager or Admin can unlock submissions.' }, { status: 403 });
    }
    
    const submissionsCollection = await getFormSubmissionsCollection();
    let submissionId: ObjectId;
    try {
      submissionId = new ObjectId(params.id);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid submission ID.' }, { status: 400 });
    }

    const result = await submissionsCollection.findOneAndUpdate(
      { _id: submissionId },
      {
        $set: {
          isUnlocked: true,
          unlockedBy: reviewerId,
          unlockedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result?.value) {
      return NextResponse.json({ error: 'Failed to unlock submission.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission unlocked successfully.',
      submission: result.value,
    });
  }
  
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

  // Check if form has passed due date
  const now = new Date();
  const dueDate = formTemplate.dueDate ? new Date(formTemplate.dueDate) : null;
  const isPostDueDate = dueDate && now > dueDate;
  
  // Check if submission is unlocked (for post-due-date scenarios)
  const isUnlocked = submission.isUnlocked === true;

  // Supervisor cannot approve/reject post due date unless unlocked by Manager
  if (isPostDueDate && userRole === 'Supervisor' && !isUnlocked) {
    return NextResponse.json({
      error: 'This submission is past the due date. Please request a Manager to unlock it for review.'
    }, { status: 403 });
  }

  const approvalRoles = Array.isArray(formTemplate.approvalRoles) ? formTemplate.approvalRoles : [];
  if (userRole !== 'Admin' && approvalRoles.length > 0 && !approvalRoles.includes(userRole)) {
    return NextResponse.json({ error: 'You are not authorized to approve or reject this submission.' }, { status: 403 });
  }

  // Handle two-stage approval
  const requiresTwoStageApproval = formTemplate.requiresTwoStageApproval === true;
  const secondApprovalRole = formTemplate.secondApprovalRole;
  
  if (requiresTwoStageApproval && secondApprovalRole) {
    // Check if this is first or second stage approval
    const hasFirstApproval = submission.firstApprovedBy && submission.firstApprovedAt;
    
    if (!hasFirstApproval) {
      // First stage approval - must be from primary approval role
      if (userRole === secondApprovalRole) {
        return NextResponse.json({
          error: 'This submission requires first approval before second approval.'
        }, { status: 403 });
      }
    } else {
      // Second stage approval - must be from second approval role
      if (userRole !== secondApprovalRole && userRole !== 'Admin') {
        return NextResponse.json({
          error: `This submission requires approval from ${secondApprovalRole} as second approver.`
        }, { status: 403 });
      }
    }
  }

  const submissionBranchCode = await resolveSubmissionBranchCode(submission);
  if (!canAccessSubmissionByBranch(userRole, reviewerBranchCode, submissionBranchCode)) {
    return NextResponse.json(
      { error: 'You can only review submissions from your branch.' },
      { status: 403 }
    );
  }

  const updateFields: any = {
    updatedAt: new Date(),
    reviewer_comment: action === 'reject' ? body.comment || 'Needs correction' : body.comment || '',
  };

  // Use the requiresTwoStageApproval variable already declared above
  const hasFirstApproval = submission.firstApprovedBy && submission.firstApprovedAt;

  if (action === 'approve') {
    if (requiresTwoStageApproval && !hasFirstApproval) {
      // First stage approval
      updateFields.status = 'Pending'; // Keep as pending for second approval
      updateFields.locked = true;
      updateFields.firstApprovedBy = (session.user as any).id;
      updateFields.firstApprovedAt = new Date();
      updateFields.firstApproverRole = userRole;
    } else {
      // Final approval (either single stage or second stage)
      updateFields.status = 'Approved';
      updateFields.locked = true;
      
      if (requiresTwoStageApproval) {
        // Second stage approval
        updateFields.secondApprovedBy = (session.user as any).id;
        updateFields.secondApprovedAt = new Date();
        updateFields.secondApproverRole = userRole;
      } else {
        // Single stage approval
        updateFields.approvedBy = (session.user as any).id;
        updateFields.approvedAt = new Date();
      }
    }
  } else if (action === 'reject') {
    updateFields.status = 'Rejected';
    updateFields.locked = false;
    updateFields.rejectedBy = (session.user as any).id;
    updateFields.rejectedAt = new Date();
  }

  const updateDocument: any = { $set: updateFields };
  
  if (action === 'approve' && !requiresTwoStageApproval) {
    updateDocument.$unset = { rejectedBy: '', rejectedAt: '' };
  } else if (action === 'reject') {
    updateDocument.$unset = {
      approvedBy: '',
      approvedAt: '',
      firstApprovedBy: '',
      firstApprovedAt: '',
      firstApproverRole: '',
      secondApprovedBy: '',
      secondApprovedAt: '',
      secondApproverRole: ''
    };
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
        branch_code: updated.branch_code ?? null,
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
