import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getFormSubmissionsCollection, getFormTemplatesCollection } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
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

  return NextResponse.json({
    success: true,
    submissions: submissions.map((submission) => ({
      _id: submission._id.toString(),
      templateId: submission.templateId,
      templateName: submission.templateName,
      submittedBy: submission.submittedBy,
      submittedById: submission.submittedById,
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
    })),
  });
}

const cleanOptions = (options: unknown) =>
  Array.isArray(options) ? options.map((option) => String(option).trim()).filter(Boolean) : [];

const getSelectedCheckboxOptions = (value: unknown) =>
  String(value ?? '').split(',').map((option) => option.trim()).filter(Boolean);

const isRequiredField = (field: any) => field.required === true || field.required === 'true';

const getMissingRequiredFields = (fields: any[], data: Record<string, unknown>) =>
  fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => {
      if (!isRequiredField(field)) return false;
      const label = String(field.label ?? '');
      const value = data[label];

      if (field.type === 'checkbox') {
        return cleanOptions(field.options).length
          ? getSelectedCheckboxOptions(value).length === 0
          : value !== true && value !== 'true';
      }

      return !String(value ?? '').trim();
    })
    .map(({ field, index }) => String(field.label ?? '').trim() || `Field ${index + 1}`);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const userId = (session.user as any).id as string | undefined;
  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'Teller';

  if (userRole !== 'Teller') {
    return NextResponse.json({ error: 'Only Teller users can submit assigned forms.' }, { status: 403 });
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

  if (!Array.isArray(template.assignedRoles) || !template.assignedRoles.includes('Teller')) {
    return NextResponse.json({ error: 'This form is not assigned to Teller users.' }, { status: 403 });
  }

  const submissionData =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  const missingRequiredFields = getMissingRequiredFields(
    Array.isArray(template.fields) ? template.fields : [],
    submissionData
  );

  if (missingRequiredFields.length) {
    return NextResponse.json(
      { error: `Please fill required field${missingRequiredFields.length > 1 ? 's' : ''}: ${missingRequiredFields.join(', ')}.` },
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
          data: submissionData,
          status: 'Pending',
          locked: true,
          reviewer_comment: '',
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
      submission: {
        _id: updatedSubmission._id.toString(),
        templateId: updatedSubmission.templateId,
        templateName: updatedSubmission.templateName,
        submittedBy: updatedSubmission.submittedBy,
        submittedById: updatedSubmission.submittedById,
        data: updatedSubmission.data ?? {},
        status: updatedSubmission.status,
        locked: updatedSubmission.locked,
        reviewer_comment: updatedSubmission.reviewer_comment ?? '',
        createdAt: updatedSubmission.createdAt?.toISOString?.() ?? updatedSubmission.createdAt,
        updatedAt: updatedSubmission.updatedAt?.toISOString?.() ?? updatedSubmission.updatedAt,
        approvedBy: updatedSubmission.approvedBy ?? null,
        approvedAt: updatedSubmission.approvedAt?.toISOString?.() ?? updatedSubmission.approvedAt ?? null,
        rejectedBy: updatedSubmission.rejectedBy ?? null,
        rejectedAt: updatedSubmission.rejectedAt?.toISOString?.() ?? updatedSubmission.rejectedAt ?? null,
      },
    });
  }

  const result = await submissionsCollection.insertOne({
    templateId,
    templateName: template.formName,
    submittedBy: userName,
    submittedById: userId,
    data: submissionData,
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
    submission: {
      _id: result.insertedId.toString(),
      templateId,
      templateName: template.formName,
      submittedBy: userName,
      submittedById: userId,
      data: submissionData,
      status: 'Pending',
      locked: true,
      reviewer_comment: '',
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  });
}
