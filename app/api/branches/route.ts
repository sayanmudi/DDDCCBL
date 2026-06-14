import { NextResponse } from 'next/server';
import { getAllBranches } from '../../../lib/branches';

export async function GET() {
  try {
    const branches = await getAllBranches();
    return NextResponse.json({
      success: true,
      branches,
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

// Made with Bob
