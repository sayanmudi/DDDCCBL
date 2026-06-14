import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const client = new MongoClient(uri);



export async function connectToDatabase() {
  const clientAny = client as any;
  if (!clientAny.topology?.isConnected?.()) {
    await client.connect();
  }

  return client.db('DDDCCBL');
}

export async function getUsersCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

export async function getMenusCollection() {
  const db = await connectToDatabase();
  return db.collection('menus');
}
export function serializeMenuItems(menuItems: any[]) {
  return menuItems.map((menu) => ({
    ...menu,
    _id: menu._id?.toString?.() ?? menu._id,
    subMenus: menu.subMenus?.map((submenu: any) => ({ ...submenu })) ?? undefined
  }));
}

export async function getFormTemplatesCollection() {
  const db = await connectToDatabase();
  return db.collection('form_templates');
}

export async function getformtemplatesCollection() {
  return getFormTemplatesCollection();
}

export async function getFormSubmissionsCollection() {
  const db = await connectToDatabase();
  return db.collection('form_submissions');
}

export async function getOrganizationSettingsCollection() {
  const db = await connectToDatabase();
  return db.collection('organization_settings');
}

