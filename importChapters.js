import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
  console.error('ERROR: ENCRYPTION_KEY and ENCRYPTION_IV must be defined in environment variables');
  console.error('For security, the application will not start with default encryption keys');
  process.exit(1);
}
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY , 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'utf8');

if (key.length !== 32) {
  console.error(`ERROR: ENCRYPTION_KEY must be exactly 32 bytes (currently ${key.length} bytes)`);
  process.exit(1);
}

if (iv.length !== 16) {
  console.error(`ERROR: ENCRYPTION_IV must be exactly 16 bytes (currently ${iv.length} bytes)`);
  process.exit(1);
}
const normalizationMethod = process.env.NORMALIZATION_METHOD || 'NFD';


function encrypt(text) {
  const normalizedText = text.normalize(normalizationMethod);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(normalizedText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}


const folderPath = path.join(__dirname, 'novel');

const uri = process.env.MONGODB_URI ;
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function importChapters() {
  try {
    await client.connect();
    const db = client.db('novels');
    const chaptersCollection = db.collection('chapters');


    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const match = file.match(/^chapter_(\d+)\.txt$/);
      if (match) {
        const chapterNumber = parseInt(match[1]);
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const encryptedContent = encrypt(content);

        const doc = { chapter: chapterNumber, content: encryptedContent };

        await chaptersCollection.updateOne(
          { chapter: chapterNumber },
          { $set: doc },
          { upsert: true }
        );
        console.log(`Imported chapter ${chapterNumber}`);
      }
    }
    console.log('All chapters imported successfully.');
  } catch (error) {
    console.error("Error importing chapters:", error);
  } finally {
    await client.close();
  }
}

importChapters();
