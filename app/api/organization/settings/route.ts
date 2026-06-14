import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getOrganizationSettingsCollection } from '../../../../lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const settingsCollection = await getOrganizationSettingsCollection();
    let settings = await settingsCollection.findOne({ settingId: 'global' });

    // If no settings exist, create default settings
    if (!settings) {
      const newSettings = {
        settingId: 'global',
        sessionTimeoutMinutes: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await settingsCollection.insertOne(newSettings);
      // Fetch the newly created document
      settings = await settingsCollection.findOne({ settingId: 'global' });
    }

    return NextResponse.json({
      sessionTimeoutMinutes: settings?.sessionTimeoutMinutes || 15
    });
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionTimeoutMinutes } = body;

    // Validate session timeout (15 minutes to 12 hours = 720 minutes)
    if (typeof sessionTimeoutMinutes !== 'number' || sessionTimeoutMinutes < 15 || sessionTimeoutMinutes > 720) {
      return NextResponse.json(
        { error: 'Session timeout must be between 15 minutes and 12 hours (720 minutes)' },
        { status: 400 }
      );
    }

    const settingsCollection = await getOrganizationSettingsCollection();
    
    const result = await settingsCollection.updateOne(
      { settingId: 'global' },
      {
        $set: {
          sessionTimeoutMinutes,
          updatedAt: new Date()
        },
        $setOnInsert: {
          settingId: 'global',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      sessionTimeoutMinutes,
      message: 'Session timeout updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Made with Bob
