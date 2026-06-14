import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationSettingsCollection } from '../../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const settingsCollection = await getOrganizationSettingsCollection();
    
    // Update the existing settings document
    const result = await settingsCollection.updateOne(
      { settingId: 'global' },
      {
        $set: {
          organizationName: 'Dakshin Dinajpur District Central Co-operative Bank Ltd.',
          logoPath: '/photos/dddccb_logo.png',
          updatedAt: new Date()
        }
      },
      { upsert: true } // Create if doesn't exist
    );

    // Fetch the updated document
    const updated = await settingsCollection.findOne({ settingId: 'global' });

    return NextResponse.json({
      success: true,
      message: 'Organization settings updated successfully',
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      settings: updated
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({
      error: 'Failed to update organization settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settingsCollection = await getOrganizationSettingsCollection();
    
    // Update the existing settings document
    const result = await settingsCollection.updateOne(
      { settingId: 'global' },
      {
        $set: {
          organizationName: 'Dakshin Dinajpur District Central Co-operative Bank Ltd.',
          logoPath: '/photos/dddccb_logo.png',
          updatedAt: new Date()
        }
      },
      { upsert: true } // Create if doesn't exist
    );

    // Fetch the updated document
    const updated = await settingsCollection.findOne({ settingId: 'global' });

    return NextResponse.json({
      success: true,
      message: 'Organization settings updated successfully',
      settings: updated
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({ 
      error: 'Failed to update organization settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Made with Bob
