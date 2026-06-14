const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const branches = [
  { branchCode: '100', branchName: 'Head Office' },
  { branchCode: '101', branchName: 'Balurghat Main Branch' },
  { branchCode: '102', branchName: 'Balurghat Evening Branch' },
  { branchCode: '103', branchName: 'Tapan Branch' },
  { branchCode: '104', branchName: 'Gangarampur Branch' },
  { branchCode: '105', branchName: 'Patiram Branch' },
  { branchCode: '106', branchName: 'Kumarganj Branch' },
  { branchCode: '107', branchName: 'Hili Branch' },
  { branchCode: '108', branchName: 'Gofanagar Branch' },
  { branchCode: '109', branchName: 'Gurail Branch' },
];

async function seedBranches() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('DDDCCBL');
    const branchesCollection = db.collection('branches');

    // Clear existing branches
    await branchesCollection.deleteMany({});
    console.log('Cleared existing branches');

    // Insert new branches
    const result = await branchesCollection.insertMany(branches);
    console.log(`Inserted ${result.insertedCount} branches`);

    // Create index on branchCode for faster lookups
    await branchesCollection.createIndex({ branchCode: 1 }, { unique: true });
    console.log('Created index on branchCode');

    console.log('\nBranches seeded successfully:');
    branches.forEach(branch => {
      console.log(`  ${branch.branchCode}: ${branch.branchName}`);
    });

  } catch (error) {
    console.error('Error seeding branches:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

seedBranches();

// Made with Bob
