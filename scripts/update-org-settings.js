const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function updateOrganizationSettings() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('DDDCCBL');
    const settingsCollection = db.collection('organization_settings');

    // Update the existing settings document
    const result = await settingsCollection.updateOne(
      { settingId: 'global' },
      {
        $set: {
          organizationName: 'Dakshin Dinajpur District Central Co-operative Bank Ltd.',
          logoPath: '/photos/dddccb_logo.png',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log('No settings document found. Creating new one...');
      await settingsCollection.insertOne({
        settingId: 'global',
        sessionTimeoutMinutes: 15,
        organizationName: 'Dakshin Dinajpur District Central Co-operative Bank Ltd.',
        logoPath: '/photos/dddccb_logo.png',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('New settings document created');
    } else {
      console.log('Organization settings updated successfully');
      const updated = await settingsCollection.findOne({ settingId: 'global' });
      console.log('Updated settings:', updated);
    }

  } catch (error) {
    console.error('Error updating organization settings:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateOrganizationSettings()
  .then(() => {
    console.log('Update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });

// Made with Bob
