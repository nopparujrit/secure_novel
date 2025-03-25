import { MongoClient } from 'mongodb';
import crypto from 'crypto';

// Encryption parameters (ต้องตรงกับที่ใช้ใน importChapters.js)
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV || 'abcdef9876543210', 'utf8');
// ใช้ normalization method เดียวกัน (ค่าเริ่มต้น 'NFD')
const normalizationMethod = process.env.NORMALIZATION_METHOD || 'NFD';

/**
 * Function to decrypt the encrypted content.
 * หลังการถอดรหัสจะทำ normalization อีกครั้ง
 */
function decrypt(encryptedHex) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted.normalize(normalizationMethod);
}

// MongoDB connection setup
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * Async function to retrieve and decrypt a chapter by its number.
 */
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
      return null; // ไม่พบ chapter
    }
  } finally {
    await client.close(); // ปิดการเชื่อมต่อให้แน่ใจแม้เกิด error
  }
}

// Main execution block
const chapterNumber = parseInt(process.argv[2]);
if (isNaN(chapterNumber)) {
  console.error("Please provide a valid chapter number (e.g., node read_chapter.js 1)");
  process.exit(1);
}

try {
  const content = await getChapter(chapterNumber);
  if (content) {
    console.log(content); // แสดงผลเนื้อหาที่ถูกถอดรหัส
  } else {
    console.log(`Chapter ${chapterNumber} not found in the database.`);
  }
} catch (error) {
  console.error("Error retrieving or decrypting chapter:", error.message);
  process.exit(1);
}
