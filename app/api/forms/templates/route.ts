import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { normalizeFormField, validateTemplateFields, validateTemplateFormulaFields } from '../../../../lib/formFields';
import { getFormTemplatesCollection } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const templatesCollection = await getFormTemplatesCollection();
  const allTemplates = await templatesCollection.find({}).toArray();
  
  // Filter out templates that have passed their due date (for Teller/PACS users)
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const now = new Date();
  
  let templates = allTemplates;
  
  // Only filter for non-admin users
  if (userRole === 'Teller' || userRole === 'PACS') {
    templates = allTemplates.filter((template) => {
      // If no due date, show the template
      if (!template.dueDate) return true;
      
      // If has due date, only show if not expired
      const dueDate = new Date(template.dueDate);
      return now <= dueDate;
    });
  }
  
  return NextResponse.json({
    success: true,
    templates: templates.map((template) => ({
      ...template,
      _id: template._id.toString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const templatesCollection = await getFormTemplatesCollection();
  const now = new Date();
  const fields = Array.isArray(body.fields) ? body.fields.map(normalizeFormField) : [];
  const fieldErrors = validateTemplateFields(fields);
  const formulaErrors = validateTemplateFormulaFields(fields);

  if (fieldErrors.length) {
    return NextResponse.json({ error: fieldErrors.join(' ') }, { status: 400 });
  }

  if (formulaErrors.length) {
    return NextResponse.json({ error: formulaErrors.join(' ') }, { status: 400 });
  }

  if (body._id) {
    const existing = await templatesCollection.findOne({ _id: new ObjectId(body._id) });
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existing.status === 'Approved') {
      return NextResponse.json(
        { error: 'Cannot update an approved template. Create a new version instead.' },
        { status: 403 }
      );
    }

    const templatePayload = {
      formName: body.formName || '',
      description: body.description || '',
      fields,
      assignedRoles: Array.isArray(body.assignedRoles) ? body.assignedRoles : [],
      approvalRoles: Array.isArray(body.approvalRoles) ? body.approvalRoles : [],
      assignedBranches: Array.isArray(body.assignedBranches) ? body.assignedBranches : [],
      submissionType: body.submissionType || 'one-time',
      frequency: body.frequency || 'daily',
      dueDate: body.dueDate || null,
      secondApprovalRole: body.secondApprovalRole || null,
      requiresTwoStageApproval: body.secondApprovalRole ? true : false,
      updatedAt: now,
    };

    const result = await templatesCollection.findOneAndUpdate(
      { _id: new ObjectId(body._id) },
      { $set: templatePayload },
      { returnDocument: 'after' }
    );

    const updatedTemplate = result?.value;
    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      template: {
        ...updatedTemplate,
        _id: updatedTemplate._id.toString(),
      },
    });
  }

  const templatePayload = {
    formName: body.formName || '',
    description: body.description || '',
    fields,
    assignedRoles: Array.isArray(body.assignedRoles) ? body.assignedRoles : [],
    approvalRoles: Array.isArray(body.approvalRoles) ? body.approvalRoles : [],
    assignedBranches: Array.isArray(body.assignedBranches) ? body.assignedBranches : [],
    submissionType: body.submissionType || 'one-time',
    frequency: body.frequency || 'daily',
    dueDate: body.dueDate || null,
    secondApprovalRole: body.secondApprovalRole || null,
    requiresTwoStageApproval: body.secondApprovalRole ? true : false,
    status: 'Draft',
    version: body.version || 1,
    createdAt: now,
    updatedAt: now,
  };

  const insertResult = await templatesCollection.insertOne(templatePayload);

  return NextResponse.json({
    success: true,
    template: {
      ...templatePayload,
      _id: insertResult.insertedId.toString(),
    },
  });
}
