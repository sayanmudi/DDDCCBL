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
            "userId": "75",
            "password": "0",
            "name": "Ashutosh Nath",
            "mobile": "1234567890",
            "role": "Manager",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "133",
            "password": "0",
            "name": "Prasenjit Sarkar",
            "mobile": "1234567890",
            "role": "Manager",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "134",
            "password": "0",
            "name": "Sayan Mudi",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "78",
            "password": "0",
            "name": "Sanjay Maitra",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "81",
            "password": "0",
            "name": "Ananda Dey",
            "mobile": "1234567890",
            "role": "Manager",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "95",
            "password": "0",
            "name": "Humayun Kabir",
            "mobile": "1234567890",
            "role": "Manager",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "97",
            "password": "0",
            "name": "Susanta Mali",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "111",
            "password": "0",
            "name": "Nirmalya Roy",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "119",
            "password": "0",
            "name": "Samit Das",
            "mobile": "1234567890",
            "role": "Manager",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "147",
            "password": "0",
            "name": "Santu Biswas",
            "mobile": "1234567890",
            "role": "Supervisor",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "138",
            "password": "0",
            "name": "Supriyo Chakraborty",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "142",
            "password": "0",
            "name": "Subhajit Saha",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "145",
            "password": "0",
            "name": "Anirban Ghosh",
            "mobile": "1234567890",
            "role": "Admin",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "146",
            "password": "0",
            "name": "Zareef Muzaheed",
            "mobile": "1234567890",
            "role": "Supervisor",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "148",
            "password": "0",
            "name": "Shubhranil Saha",
            "mobile": "1234567890",
            "role": "Supervisor",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "149",
            "password": "0",
            "name": "Parthajit Sarkar",
            "mobile": "1234567890",
            "role": "Teller",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "154",
            "password": "0",
            "name": "Aniruddha Mandal",
            "mobile": "1234567890",
            "role": "Supervisor",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "201",
            "password": "0",
            "name": "THAKURPURA BARAKAIL S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "202",
            "password": "0",
            "name": "PARANPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "203",
            "password": "0",
            "name": "NAKSHA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "204",
            "password": "0",
            "name": "KANJIALSHI S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "205",
            "password": "0",
            "name": "JAGANNATHBATII S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "206",
            "password": "0",
            "name": "PATIRAM C.A.C.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "207",
            "password": "0",
            "name": "DHARMAPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "208",
            "password": "0",
            "name": "BHATPARA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "209",
            "password": "0",
            "name": "MALANCHA(B) S.K.U.S. LTD. ",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "210",
            "password": "0",
            "name": "JALGHAR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "211",
            "password": "0",
            "name": "JALGHAR L.A.M.P.S LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "212",
            "password": "0",
            "name": "IDRAKPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "213",
            "password": "0",
            "name": "SEWAI S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "214",
            "password": "0",
            "name": "NAJIRPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "215",
            "password": "0",
            "name": "CHAKVRIGU ANCHAL SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "216",
            "password": "0",
            "name": "KAMARPARA LAMPS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "217",
            "password": "0",
            "name": "BISWABANGLA SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "218",
            "password": "0",
            "name": "DAMDAMA U.C.A.C.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "219",
            "password": "0",
            "name": "HOSSAINPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "220",
            "password": "0",
            "name": "PRANSAGAR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "221",
            "password": "0",
            "name": "BASURIYA SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "222",
            "password": "0",
            "name": "MILANEE S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "223",
            "password": "0",
            "name": "BANIHARI S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "224",
            "password": "0",
            "name": "PANCHAGRAM S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "225",
            "password": "0",
            "name": "UDAY U.C.A.C.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "226",
            "password": "0",
            "name": "MOSTAFAPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "227",
            "password": "0",
            "name": "RADHANAGAR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "228",
            "password": "0",
            "name": "SAYRAPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "229",
            "password": "0",
            "name": "FARIDPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "230",
            "password": "0",
            "name": "GOKULPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "231",
            "password": "0",
            "name": "BHADRA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "232",
            "password": "0",
            "name": "KARUMSUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "233",
            "password": "0",
            "name": "MAHARAJPUR SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "234",
            "password": "0",
            "name": "PUNARBHABA SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "235",
            "password": "0",
            "name": "GANGARAMPUR LAMPS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "236",
            "password": "0",
            "name": "NEHEMBA SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "237",
            "password": "0",
            "name": "BURIMATA SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "238",
            "password": "0",
            "name": "TRIMOHINI KSSS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "239",
            "password": "0",
            "name": "GARNA SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "240",
            "password": "0",
            "name": "BINSHIRA SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "241",
            "password": "0",
            "name": "PASCHIM HILI SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "242",
            "password": "0",
            "name": "CHURAIL KRISHNAPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "243",
            "password": "0",
            "name": "BATUN S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "244",
            "password": "0",
            "name": "BHAKLA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "245",
            "password": "0",
            "name": "MAHADEVPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "246",
            "password": "0",
            "name": "RAMKRISHNAPUR U.C.A.C.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "247",
            "password": "0",
            "name": "PALASHI S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "248",
            "password": "0",
            "name": "DEBIPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "249",
            "password": "0",
            "name": "SITIHARPUKURPARA SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "250",
            "password": "0",
            "name": "FAKIRGANJ SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "251",
            "password": "0",
            "name": "TULAT SKUS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "252",
            "password": "0",
            "name": "SALASH S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "253",
            "password": "0",
            "name": "DAYING MALANCHA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "254",
            "password": "0",
            "name": "PATKOLA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "255",
            "password": "0",
            "name": "FATEPUR TELEGHATA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "256",
            "password": "0",
            "name": "UDAYAN LAMPS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "257",
            "password": "0",
            "name": "14 MILE S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "258",
            "password": "0",
            "name": "OUTINA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "259",
            "password": "0",
            "name": "NAOGAON LAXMIPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "260",
            "password": "0",
            "name": "MALANCHA S.K.U.S. LTD. (T)",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "261",
            "password": "0",
            "name": "DESHBANDHU S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "262",
            "password": "0",
            "name": "AJMATPUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "263",
            "password": "0",
            "name": "KEWAPUKUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "264",
            "password": "0",
            "name": "BAZRAPUKUR S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "265",
            "password": "0",
            "name": "BANIAL MAHAKURI S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "266",
            "password": "0",
            "name": "VIVEKANANDA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "267",
            "password": "0",
            "name": "TAPAN S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "268",
            "password": "0",
            "name": "DARALHAT S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "269",
            "password": "0",
            "name": "HARSURA S.K.U.S. LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "270",
            "password": "0",
            "name": "NAZIRPUR LAMPS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "271",
            "password": "0",
            "name": "LASKARHAT LAMPS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "272",
            "password": "0",
            "name": "MAHANAJ LAMPS LTD.",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "273",
            "password": "0",
            "name": "BADSANKAIR SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "274",
            "password": "0",
            "name": "SARIFABAD SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "275",
            "password": "0",
            "name": "KCC ARD LOAN TAPAN BRANCH",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "276",
            "password": "0",
            "name": "KCC ARD LOAN BALURGHAT MAIN BRANCH",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "277",
            "password": "0",
            "name": "CHHATIM TOR SKUS LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      },
      {
            "userId": "278",
            "password": "0",
            "name": "PROGATI MAHILA COOPERATIVE CREDIT SOCIETY LTD",
            "mobile": "1234567890",
            "role": "PACS",
            "image": "/photos/134_profile.jpg",
            "branch_code": "101",
            "isActive": true
      }
]);

    await menus.insertMany([
      {
            "title": "Dashboard",
            "slug": "dashboard",
            "description": "Role-aware dashboard landing page.",
            "access": [
                  "Admin",
                  "Manager",
                  "Supervisor",
                  "Teller"
            ],
            "subMenus": []
      },
      {
            "title": "Reports",
            "slug": "reports",
            "description": "Reports available for each role.",
            "access": [
                  "Admin",
                  "Manager",
                  "Supervisor",
                  "Teller"
            ],
            "subMenus": [
                  {
                        "title": "CBS Reports",
                        "slug": "cbs-reports",
                        "access": [
                              "Admin"
                        ]
                  },
                  {
                        "title": "Manager Reports",
                        "slug": "manager-reports",
                        "access": [
                              "Admin",
                              "Manager"
                        ]
                  },
                  {
                        "title": "Teller Reports",
                        "slug": "teller-reports",
                        "access": [
                              "Admin",
                              "Manager",
                              "Teller"
                        ]
                  },
                  {
                        "title": "Submitted Forms",
                        "slug": "submissions",
                        "access": [
                              "Admin",
                              "Manager",
                              "Supervisor",
                              "Teller"
                        ]
                  }
            ]
      },
      {
            "title": "Create / Update Form",
            "slug": "forms",
            "description": "Create and assign role-based forms, then review submissions.",
            "access": [
                  "Admin",
                  "Manager",
                  "Supervisor",
                  "Teller",
                  "PACS"
            ],
            "subMenus": []
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
