import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getformtemplatesCollection } from '../../../../lib/mongodb';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const body = await request.json();
  
  // Validate due date if provided
  if (body.dueDate) {
    const dueDateObj = new Date(body.dueDate);
    const now = new Date();
    if (dueDateObj <= now) {
      return NextResponse.json({ error: 'Due date must be in the future' }, { status: 400 });
    }
  }

  const formstemplate = await getformtemplatesCollection();

  const templateData: any = {
    formName: body.formName,
    description: body.description,
    fields: body.fields,
    status: "Active",
    version: 1,
    
    // New fields for recurring/one-time submission
    submissionType: body.submissionType || "one-time",
    frequency: body.submissionType === "recurring" ? body.frequency : null,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    
    // 2nd approval role
    secondApprovalRole: body.secondApprovalRole || null,
    
    // Track approval stages
    requiresTwoStageApproval: !!body.secondApprovalRole,
    
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await formstemplate.insertOne(templateData);

  return NextResponse.json({
    success: true,
    insertedId: result.insertedId,
  });
}