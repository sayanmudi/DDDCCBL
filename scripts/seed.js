require('dotenv').config({ path: '.env.local' });
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

    await users.insertMany([
      {
        userId: '134',
        password: 'Admin@123',
        name: 'Sayan Mudi',
        mobile: '9804290021',
        role: 'Admin',
        image: '/photos/134_profile.jpg'
      },
      {
        userId: '138',
        password: 'Admin@123',
        name: 'Supriyo Chakraborty',
        mobile: '9804290021',
        role: 'Manager'
      },
      {
        userId: '149',
        password: 'Admin@123',
        name: 'Parthajit Sarkar',
        mobile: '9804290021',
        role: 'Teller'
      }
    ]);

    await menus.insertMany([
      {
        title: 'Dashboard',
        slug: 'dashboard',
        description: 'Role-aware dashboard landing page.',
        access: ['Admin', 'Manager', 'Supervisor', 'Teller'],
        subMenus: []
      },
      {
        title: 'Reports',
        slug: 'reports',
        description: 'Reports available for each role.',
        access: ['Admin', 'Manager', 'Supervisor', 'Teller'],
        subMenus: [
          {
            title: 'CBS Reports',
            slug: 'cbs-reports',
            access: ['Admin']
          },
          {
            title: 'Manager Reports',
            slug: 'manager-reports',
            access: ['Admin', 'Manager']
          },
          {
            title: 'Teller Reports',
            slug: 'teller-reports',
            access: ['Admin', 'Manager', 'Teller']
          }
        ]
      }
    ]);

    console.log('Seed completed successfully.');
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
