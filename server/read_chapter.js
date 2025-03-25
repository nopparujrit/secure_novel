import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV || 'abcdef9876543210', 'utf8');

const normalizationMethod = process.env.NORMALIZATION_METHOD || 'NFD';


function decrypt(encryptedHex) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted.normalize(normalizationMethod);
}

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function getChapter(chapterNumber) {
  try {
    await client.connect();
    const db = client.db('novels');
    const chaptersCollection = db.collection('chapters');
    const doc = await chaptersCollection.findOne({ chapter: chapterNumber });
    if (doc) {
      const encryptedContent = doc.content;
      const decryptedContent = decrypt(encryptedContent);
      return decryptedContent;
    } else {
      return null; 
    }
  } finally {
    await client.close();
  }
}

const chapterNumber = parseInt(process.argv[2]);
if (isNaN(chapterNumber)) {
  console.error("Please provide a valid chapter number (e.g., node read_chapter.js 1)");
  process.exit(1);
}

try {
  const content = await getChapter(chapterNumber);
  if (content) {
    console.log(content); 
  } else {
    console.log(`Chapter ${chapterNumber} not found in the database.`);
  }
} catch (error) {
  console.error("Error retrieving or decrypting chapter:", error.message);
  process.exit(1);
}
