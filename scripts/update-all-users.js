require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required.');
}

const client = new MongoClient(uri);

async function updateAllUsers() {
  try {
    await client.connect();
    const db = client.db('DDDCCBL');
    const users = db.collection('users');

    // Update all users to have branch_code='101' and isActive=true
    const result = await users.updateMany(
      {}, // Match all documents
      {
        $set: {
          branch_code: '101',
          isActive: true
        }
      }
    );

    console.log('Update completed successfully!');
    console.log(`Matched ${result.matchedCount} users`);
    console.log(`Modified ${result.modifiedCount} users`);
    
    // Verify the update
    const updatedUsers = await users.find({}).toArray();
    console.log('\n=== Sample of updated users ===');
    console.log(JSON.stringify(updatedUsers.slice(0, 5), null, 2));
    
  } finally {
    await client.close();
  }
}

updateAllUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Made with Bob
