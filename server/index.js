const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'secure-novel-2.vercel.app',
    'http://localhost:3000',
    'secure-novel-2-git-main-nopparujs-projects-17f85434.vercel.app',
    'secure-novel-2-417v4pftt-nopparujs-projects-17f85434.vercel.app',
    'https://secure-novel.vercel.app', 
    'https://secure-novel-git-main-nopparujs-projects-17f85434.vercel.app',
    'secure-novel-bpg8zp37e-nopparujs-projects-17f85434.vercel.app' 
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
  console.error('ERROR: ENCRYPTION_KEY and ENCRYPTION_IV must be defined in environment variables');
  console.error('For security, the application will not start with default encryption keys');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('novels');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'utf8');

if (key.length !== 32) {
  console.error(`ERROR: ENCRYPTION_KEY must be exactly 32 bytes (currently ${key.length} bytes)`);
  process.exit(1);
}

if (iv.length !== 16) {
  console.error(`ERROR: ENCRYPTION_IV must be exactly 16 bytes (currently ${iv.length} bytes)`);
  process.exit(1);
}

function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

function decrypt(encryptedText) {
  try {
    if (!encryptedText) {
      console.error('No encrypted text provided');
      return null;
    }
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

app.get('/api/chapters', async (req, res) => {
  try {
    const db = await connectDB();
    const chapters = await db.collection('chapters')
      .find({}, { projection: { chapter: 1, _id: 0 } })
      .sort({ chapter: 1 })
      .toArray();
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

app.get('/api/chapters/:chapterNumber', async (req, res) => {
  try {
    const chapterNumber = parseInt(req.params.chapterNumber);
    
    const db = await connectDB();
    const chapter = await db.collection('chapters').findOne(
      { chapter: chapterNumber },
      { projection: { _id: 0 } }
    );
    
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    console.log(chapter.content);
    res.json({
      chapter: chapter.chapter,
      content: chapter.content
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

app.get('/api/novel/metadata', async (req, res) => {
  try {
    const db = await connectDB();
    const chaptersCount = await db.collection('chapters').countDocuments();
    
    const metadata = {
      totalChapters: chaptersCount,
      title: "Secure Novel",
      author: "Nopparuj",
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.post('/api/decrypt', (req, res) => {
  try {
    const { encryptedContent } = req.body;
    
    if (!encryptedContent) {
      return res.status(400).json({ error: 'No encrypted content provided' });
    }

    const decryptedContent = decrypt(encryptedContent);
    
    if (decryptedContent === null) {
      return res.status(400).json({ error: 'Decryption failed' });
    }

    res.json({ decryptedContent });
  } catch (error) {
    console.error('Error in decrypt endpoint:', error);
    res.status(500).json({ error: 'Server error during decryption' });
  }
});

app.listen(PORT, async () => {
  try {
    const db = await connectDB();
    const chapters = await db.collection('chapters')
      .find({}, { projection: { chapter: 1, _id: 0 } })
      .sort({ chapter: 1 })
      .toArray();
    console.log(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
  }
  console.log(`Server running on port ${PORT}`);
});
