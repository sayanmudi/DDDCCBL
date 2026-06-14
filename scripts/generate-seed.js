require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required.');
}

const client = new MongoClient(uri);

async function generateSeed() {
  try {
    await client.connect();
    const db = client.db('DDDCCBL');
    const users = db.collection('users');
    const menus = db.collection('menus');

    // Fetch all users
    const allUsers = await users.find({}).toArray();
    
    // Fetch all menus
    const allMenus = await menus.find({}).toArray();

    // Remove _id from users
    const cleanUsers = allUsers.map(user => {
      const { _id, ...rest } = user;
      return rest;
    });

    // Remove _id from menus
    const cleanMenus = allMenus.map(menu => {
      const { _id, ...rest } = menu;
      return rest;
    });

    // Generate seed.js content
    const seedContent = `require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required.');
}

const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db('DDDCCBL');

    const users = db.collection('users');
    const menus = db.collection('menus');

    await users.deleteMany({});
    await menus.deleteMany({});

    await users.insertMany(${JSON.stringify(cleanUsers, null, 6)});

    await menus.insertMany(${JSON.stringify(cleanMenus, null, 6)});

    console.log('Seed completed successfully.');
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;

    // Write to seed.js
    fs.writeFileSync('scripts/seed.js', seedContent);
    
    console.log('✅ seed.js has been generated successfully!');
    console.log(`📊 Total users: ${cleanUsers.length}`);
    console.log(`📋 Total menus: ${cleanMenus.length}`);
    
  } finally {
    await client.close();
  }
}

generateSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Made with Bob
