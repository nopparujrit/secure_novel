const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI ;
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
// Encryption settings
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'utf8');
const iv = Buffer.from(process.env.ENCRYPTION_IV || 'abcdef9876543210', 'utf8');

// Encryption function
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

// Decryption function
function decrypt(encryptedText) {
  try {
    if (!encryptedText) {
      console.error('No encrypted text provided');
      return null;
    }
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    //console.log(decrypted);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// API Routes
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
    // Get specific chapter
    const chapter = await db.collection('chapters').findOne(
      { chapter: chapterNumber },
      { projection: { _id: 0 } }
    );
    
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    // Decrypt the content before sending
    const decryptedContent = decrypt(chapter.content);
    //console.log(decryptedContent);
    if (!decryptedContent) {
      return res.status(500).json({ error: 'Failed to decrypt chapter content' });
    }
    
    res.json({
      chapter: chapter.chapter,
      content: decryptedContent
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
    
    // You can customize this with real metadata from your database
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

// Start server
app.listen(PORT, async () => {
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
  console.log(`Server running on port ${PORT}`);
});
