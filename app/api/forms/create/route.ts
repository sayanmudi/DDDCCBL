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
const formstemplate=await getformtemplatesCollection();

    const result =await formstemplate.insertOne({
          formName:
            body.formName,
          description:
            body.description,

          fields:
            body.fields,

          status:
            "Active",

          version: 1,

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        });

    return NextResponse.json({
      success: true,
      insertedId:
        result.insertedId,
    });


}