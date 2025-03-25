import express from 'express';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Encryption parameters (ต้องตรงกับที่ใช้ใน importChapters.js)
const algorithm = 'aes-256-cbc';
// key ต้องมีความยาว 32 bytes, iv 16 bytes
const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV || 'abcdef9876543210', 'utf8');
// เลือกวิธี normalization ผ่าน environment variable (ค่าเริ่มต้นเป็น 'NFD')
const normalizationMethod = process.env.NORMALIZATION_METHOD || 'NFD';

// MongoDB connection setup (ปรับให้เข้ากับ environment ของคุณ)
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

// Function to decrypt content
function decrypt(encryptedHex) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted.normalize(normalizationMethod);
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get chapter content
app.get('/api/chapter/:number', async (req, res) => {
  try {
    const chapterNumber = parseInt(req.params.number);
    await client.connect();
    const db = client.db('novels');
    const chaptersCollection = db.collection('chapters');
    const doc = await chaptersCollection.findOne({ chapter: chapterNumber });

    if (doc) {
      const decryptedContent = decrypt(doc.content);
      res.json({ content: decryptedContent });
    } else {
      res.status(404).json({ error: 'Chapter not found' });
    }
  } catch (error) {
    console.error('Error retrieving chapter:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// API endpoint to get chapter list
app.get('/api/chapters', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('novels');
    const chaptersCollection = db.collection('chapters');
    const chapters = await chaptersCollection.find({}, { projection: { chapter: 1, _id: 0 } }).toArray();
    
    const chapterList = chapters.map(chapter => ({
      number: chapter.chapter,
      url: `/chapter/${chapter.chapter}`
    }));
    
    res.json(chapterList);
  } catch (error) {
    console.error('Error retrieving chapter list:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve chapter pages
app.get('/chapter/:number', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chapter.html'));
});

// Add this fallback route to handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 