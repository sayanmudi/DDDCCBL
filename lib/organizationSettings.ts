import { getOrganizationSettingsCollection } from './mongodb';

export async function getOrganizationSettings() {
  const settingsCollection = await getOrganizationSettingsCollection();
  const settings = await settingsCollection.findOne({ settingId: 'global' });
  
  return {
    organizationName: settings?.organizationName || 'Dakshin Dinajpur District Central Co-operative Bank Ltd.',
    logoPath: settings?.logoPath || '/photos/dddccb_logo.png',
  };
}

// Made with Bob
