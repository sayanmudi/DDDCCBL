import { getBranchesCollection } from './mongodb';

export interface Branch {
  branchCode: string;
  branchName: string;
}

/**
 * Get branch name from branch code
 */
export async function getBranchName(branchCode: string | undefined): Promise<string> {
  if (!branchCode) return '';
  
  try {
    const branchesCollection = await getBranchesCollection();
    const branch = await branchesCollection.findOne({ branchCode: branchCode.toString() });
    return branch?.branchName || '';
  } catch (error) {
    console.error('Error fetching branch name:', error);
    return '';
  }
}

/**
 * Get all branches
 */
export async function getAllBranches(): Promise<Branch[]> {
  try {
    const branchesCollection = await getBranchesCollection();
    const branches = await branchesCollection.find({}).sort({ branchCode: 1 }).toArray();
    return branches.map(branch => ({
      branchCode: branch.branchCode,
      branchName: branch.branchName,
    }));
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

/**
 * Get branch by code
 */
export async function getBranchByCode(branchCode: string): Promise<Branch | null> {
  if (!branchCode) return null;
  
  try {
    const branchesCollection = await getBranchesCollection();
    const branch = await branchesCollection.findOne({ branchCode: branchCode.toString() });
    if (!branch) return null;
    
    return {
      branchCode: branch.branchCode,
      branchName: branch.branchName,
    };
  } catch (error) {
    console.error('Error fetching branch:', error);
    return null;
  }
}

// Made with Bob
