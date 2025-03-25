import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Encryption parameters
const algorithm = 'aes-256-cbc';
// key ต้องมีความยาว 32 bytes, iv 16 bytes
const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV || 'abcdef9876543210', 'utf8');

// เลือกวิธี normalization ผ่าน environment variable (ค่าเริ่มต้นเป็น 'NFD')
const normalizationMethod = process.env.NORMALIZATION_METHOD || 'NFD';

/**
 * Function to encrypt content.
 * ก่อนเข้ารหัสจะทำ normalization ตามวิธีที่กำหนด (NFC หรือ NFD)
 */
function encrypt(text) {
  // ตรวจสอบและ normalize ข้อความ (ภาษาไทยและอื่น ๆ)
  const normalizedText = text.normalize(normalizationMethod);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(normalizedText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// กำหนดโฟลเดอร์ที่เก็บไฟล์นิยาย
const folderPath = path.join(__dirname, 'novel');

// กำหนด URL ของ MongoDB (ปรับให้เข้ากับ environment ของคุณ)
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function importChapters() {
  try {
    // เชื่อมต่อกับ MongoDB
    await client.connect();
    const db = client.db('novels');
    const chaptersCollection = db.collection('chapters');

    // อ่านรายชื่อไฟล์จากโฟลเดอร์ novel
    const files = fs.readdirSync(folderPath);

    // วนลูปอ่านไฟล์ที่ตรงกับรูปแบบ chapter_<number>.txt
    for (const file of files) {
      const match = file.match(/^chapter_(\d+)\.txt$/);
      if (match) {
        const chapterNumber = parseInt(match[1]);
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // เข้ารหัสเนื้อหา (หลัง normalization)
        const encryptedContent = encrypt(content);

        // สร้าง document สำหรับเก็บใน MongoDB
        const doc = { chapter: chapterNumber, content: encryptedContent };

        // เก็บ document ลงใน MongoDB โดยใช้ upsert
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
