const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function seedOrganizationSettings() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('DDDCCBL');
    const settingsCollection = db.collection('organization_settings');

    // Check if settings already exist
    const existingSettings = await settingsCollection.findOne({ settingId: 'global' });

    if (existingSettings) {
      console.log('Organization settings already exist:', existingSettings);
      return;
    }

    // Create default organization settings
    const defaultSettings = {
      settingId: 'global',
      sessionTimeoutMinutes: 15,
      organizationName: 'Dakshin Dinajpur District Central Co-operative Bank Ltd.',
      logoPath: '/photos/dddccb_logo.png',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await settingsCollection.insertOne(defaultSettings);
    console.log('Default organization settings created successfully:', defaultSettings);

  } catch (error) {
    console.error('Error seeding organization settings:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedOrganizationSettings()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

// Made with Bob
