import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { normalizeFormField, validateTemplateFields, validateTemplateFormulaFields } from '../../../../lib/formFields';
import { getFormTemplatesCollection } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const templatesCollection = await getFormTemplatesCollection();
  const templates = await templatesCollection.find({}).toArray();
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
