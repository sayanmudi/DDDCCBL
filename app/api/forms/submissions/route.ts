import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import {
  filterSubmissionsByBranch,
  getUserBranchCode,
  normalizeBranchCode,
} from '../../../../lib/branchAccess';
import { applyFormulaFields, getMissingRequiredFields, normalizeFormField, validateFieldValues } from '../../../../lib/formFields';
import { getFormSubmissionsCollection, getFormTemplatesCollection, getUsersCollection } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

function serializeSubmission(submission: any) {
  return {
    _id: submission._id.toString(),
    templateId: submission.templateId,
    templateName: submission.templateName,
    submittedBy: submission.submittedBy,
    submittedById: submission.submittedById,
    branch_code: submission.branch_code ?? null,
    data: submission.data ?? {},
    status: submission.status,
    locked: submission.locked,
    reviewer_comment: submission.reviewer_comment ?? submission.managerComment ?? '',
    createdAt: submission.createdAt?.toISOString?.() ?? submission.createdAt,
    updatedAt: submission.updatedAt?.toISOString?.() ?? submission.updatedAt,
    approvedBy: submission.approvedBy ?? null,
    approvedAt: submission.approvedAt?.toISOString?.() ?? submission.approvedAt ?? null,
    rejectedBy: submission.rejectedBy ?? null,
    rejectedAt: submission.rejectedAt?.toISOString?.() ?? submission.rejectedAt ?? null,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; role?: string; branch_code?: string } | undefined;
  const userRole = sessionUser?.role ?? '';
  const userId = sessionUser?.id;
  const viewerBranchCode = normalizeBranchCode(sessionUser?.branch_code) || (await getUserBranchCode(userId));

  const params = request.nextUrl.searchParams;
  const status = params.get('status');
  const submittedBy = params.get('submittedBy');
  const submittedById = params.get('submittedById');
  const templateId = params.get('templateId');
  const templateName = params.get('templateName');
  const createdFrom = params.get('createdFrom');
  const createdTo = params.get('createdTo');
  const updatedFrom = params.get('updatedFrom');
  const updatedTo = params.get('updatedTo');

  const filter: any = {};

  if (status) {
    filter.status = status;
  }
  if (submittedBy) {
    filter.submittedBy = submittedBy;
  }
  if (submittedById) {
    filter.submittedById = submittedById;
  }
  if (templateId) {
    filter.templateId = templateId;
  }
  if (templateName) {
    filter.templateName = { $regex: templateName, $options: 'i' };
  }

  if (createdFrom || createdTo) {
    filter.createdAt = {};
    if (createdFrom) {
      const from = new Date(createdFrom);
      if (!Number.isNaN(from.getTime())) {
        filter.createdAt.$gte = from;
      }
    }
    if (createdTo) {
      const to = new Date(createdTo);
      if (!Number.isNaN(to.getTime())) {
        filter.createdAt.$lte = to;
      }
    }
    if (Object.keys(filter.createdAt).length === 0) {
      delete filter.createdAt;
    }
  }

  if (updatedFrom || updatedTo) {
    filter.updatedAt = {};
    if (updatedFrom) {
      const from = new Date(updatedFrom);
      if (!Number.isNaN(from.getTime())) {
        filter.updatedAt.$gte = from;
      }
    }
    if (updatedTo) {
      const to = new Date(updatedTo);
      if (!Number.isNaN(to.getTime())) {
        filter.updatedAt.$lte = to;
      }
    }
    if (Object.keys(filter.updatedAt).length === 0) {
      delete filter.updatedAt;
    }
  }

  const submissionsCollection = await getFormSubmissionsCollection();
  const submissions = await submissionsCollection.find(filter).sort({ updatedAt: -1 }).toArray();
  const scopedSubmissions = await filterSubmissionsByBranch(submissions, userRole, viewerBranchCode);

  return NextResponse.json({
    success: true,
    submissions: scopedSubmissions.map(serializeSubmission),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const userId = (session.user as any).id as string | undefined;
  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'Teller';

  if (userRole !== 'Teller' && userRole !== 'PACS') {
    return NextResponse.json({ error: 'Only Teller/PACS users can submit assigned forms.' }, { status: 403 });
  }

  const templateId = body.templateId;
  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required.' }, { status: 400 });
  }

  const templatesCollection = await getFormTemplatesCollection();
  const template = await templatesCollection.findOne({ _id: new ObjectId(templateId) });

  if (!template) {
    return NextResponse.json({ error: 'Form template not found.' }, { status: 404 });
  }

  if (!Array.isArray(template.assignedRoles) || (!template.assignedRoles.includes('Teller') && !template.assignedRoles.includes('PACS'))) {
    return NextResponse.json({ error: 'This form is not assigned to Teller or PACS users.' }, { status: 403 });
  }

  const submissionData =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  const fields = Array.isArray(template.fields) ? template.fields.map(normalizeFormField) : [];
  const missingRequiredFields = getMissingRequiredFields(fields, submissionData);

  if (missingRequiredFields.length) {
    return NextResponse.json(
      { error: `Please fill required field${missingRequiredFields.length > 1 ? 's' : ''}: ${missingRequiredFields.join(', ')}.` },
      { status: 400 }
    );
  }

  const validationErrors = validateFieldValues(fields, submissionData);
  if (validationErrors.length) {
    return NextResponse.json({ error: validationErrors.join(' ') }, { status: 400 });
  }

  const { data: computedData, errors: formulaErrors } = applyFormulaFields(
    fields,
    Object.fromEntries(Object.entries(submissionData).map(([key, value]) => [key, String(value ?? '')]))
  );

  if (formulaErrors.length) {
    return NextResponse.json({ error: formulaErrors.join(' ') }, { status: 400 });
  }

  const usersCollection = await getUsersCollection();
  const submitter = await usersCollection.findOne({ userId }, { projection: { branch_code: 1 } });
  const branchCode = normalizeBranchCode(submitter?.branch_code);

  if (!branchCode) {
    return NextResponse.json(
      { error: 'Your account is missing a branch code. Contact an administrator.' },
      { status: 400 }
    );
  }

  const submissionsCollection = await getFormSubmissionsCollection();
  const existing = await submissionsCollection.findOne({ templateId, submittedById: userId, status: { $in: ['Pending', 'Rejected'] } });
  const now = new Date();

  if (existing && existing.status === 'Pending') {
    return NextResponse.json({ error: 'A pending submission already exists for this form.' }, { status: 400 });
  }

  if (existing && existing.status === 'Rejected') {
    const existingId = typeof existing._id === 'string' ? new ObjectId(existing._id) : existing._id;

    const updated = await submissionsCollection.findOneAndUpdate(
      { _id: existingId },
      {
        $set: {
          data: computedData,
          status: 'Pending',
          locked: true,
          reviewer_comment: '',
          branch_code: branchCode,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    let updatedSubmission = updated?.value;
    if (!updatedSubmission) {
      updatedSubmission = await submissionsCollection.findOne({ _id: existingId });
    }
    if (!updatedSubmission) {
      return NextResponse.json({ error: 'Failed to update rejected submission.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      submission: serializeSubmission(updatedSubmission),
    });
  }

  const result = await submissionsCollection.insertOne({
    templateId,
    templateName: template.formName,
    submittedBy: userName,
    submittedById: userId,
    branch_code: branchCode,
    data: computedData,
    status: 'Pending',
    locked: true,
    reviewer_comment: '',
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    success: true,
    submission: serializeSubmission({
      _id: result.insertedId,
      templateId,
      templateName: template.formName,
      submittedBy: userName,
      submittedById: userId,
      branch_code: branchCode,
      data: computedData,
      status: 'Pending',
      locked: true,
      reviewer_comment: '',
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      createdAt: now,
      updatedAt: now,
    }),
  });
}
