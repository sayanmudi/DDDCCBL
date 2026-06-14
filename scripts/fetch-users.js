require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required.');
}

const client = new MongoClient(uri);

async function fetchUsers() {
  try {
    await client.connect();
    const db = client.db('DDDCCBL');
    const users = db.collection('users');

    const allUsers = await users.find({}).toArray();
    
    console.log('Total users found:', allUsers.length);
    console.log('\n=== User Data ===\n');
    console.log(JSON.stringify(allUsers, null, 2));
    
  } finally {
    await client.close();
  }
}

fetchUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Made with Bob
