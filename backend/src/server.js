import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/mongodb.js';
import songRouter from './routes/songRoutes.js';
import albumRouter from './routes/albumRoutes.js';
import saavnRouter from './routes/saavnRoutes.js';
import authRouter from './routes/authRoutes.js';
import importRouter from './routes/importRoutes.js';
import { getAlbums, getSongs, createAlbum, createSong } from './services/dbService.js';

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const frontendDistDir = path.join(repoRoot, 'frontend', 'dist');
app.set('trust proxy', 1);

// Connect to MongoDB if config exists
connectDB();

// Body Parser Middleware
app.use(express.json());

// NoSQL Query Injection Prevention
app.use(mongoSanitize());

// HTTP Secure Headers (Allow cross-origin loads for dynamic audios/images)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configure Specific Origin CORS restrictions
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

const isDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin);
};

const isSameHostOrigin = (origin, host) => {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  const host = req.get('host');
  const isAllowed = !origin || allowedOrigins.includes(origin) || isSameHostOrigin(origin, host) || isDevelopmentOrigin(origin);

  if (isAllowed) {
    callback(null, { origin: true, credentials: true });
  } else {
    callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  }
}));

// Rate Limiting Middlewares (Throttling Brute-Force/DDoS)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit IP to 500 requests per window
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit IP to 100 registration/login requests per window
  message: { success: false, message: "Too many auth requests, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);


// Static Files - Serve uploaded files for local fallback
const uploadsDir = path.join(backendRoot, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Initializing routes
app.use('/api/song', songRouter);
app.use('/api/album', albumRouter);
app.use('/api/saavn', saavnRouter);
app.use('/api/auth', authRouter);
app.use('/api/import', importRouter);

app.get('/api/health', (req, res) => res.send("Music Vibe API Working"));

if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send("Music Vibe API Working"));
}

// Database Pre-population Helper
const prePopulateDb = async () => {
  try {
    const albums = await getAlbums();
    const songs = await getSongs();

    if (albums.length === 0) {
      console.log("Pre-populating multilingual default albums...");
      const defaultAlbums = [
        {
          name: "Telugu Melodies",
          desc: "Soulful and romantic Telugu chartbusters to touch your heart.",
          bgColour: "#0284c7", // Sky blue
          image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60"
        },
        {
          name: "Bollywood Hits",
          desc: "The absolute best Hindi cinema hits and romantic sensations.",
          bgColour: "#b91c1c", // Crimson red
          image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60"
        },
        {
          name: "English Pop",
          desc: "Hottest international tracks and upbeat pop anthems.",
          bgColour: "#0d9488", // Dark teal
          image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60"
        }
      ];

      for (const album of defaultAlbums) {
        await createAlbum(album);
      }
    }

    if (songs.length === 0) {
      console.log("Pre-populating 5,000+ multilingual default songs...");
      
      const teluguBases = [
        { name: "Naa Madhi", desc: "Soulful romance track from the movie Thiru." },
        { name: "Samayama", desc: "Melodious acoustic love theme from Hi Nanna." },
        { name: "Srivalli", desc: "The sensational global chartbuster from Pushpa." },
        { name: "Butta Bomma", desc: "High-energy dance rhythm from Ala Vaikunthapurramuloo." },
        { name: "Oo Antava Mava", desc: "Pounding bass mass track from Pushpa." },
        { name: "Inkem Inkem Kaavaale", desc: "Charming classical guitar melody from Geetha Govindam." },
        { name: "Aradhya", desc: "Warm and bright love duet from Kushi." },
        { name: "Priya Mithama", desc: "Beautiful slow classical violin tune." }
      ];

      const hindiBases = [
        { name: "Tum Hi Ho", desc: "Symphonic keyboard ballad from Aashiqui 2." },
        { name: "Kesariya", desc: "Acoustic chords and sitar leads from Brahmastra." },
        { name: "Chaleya", desc: "Jawan's grooviest hit with upbeat club percussions." },
        { name: "Apna Bana Le", desc: "Acoustic guitar tune from Bhediya." },
        { name: "Kabira", desc: "Sufi-rock acoustic guitar track from Yeh Jawaani Hai Deewani." },
        { name: "Channa Mereya", desc: "Melancholic acoustic guitar chords from Ae Dil Hai Mushkil." },
        { name: "Raataan Lambiyan", desc: "Acoustic pop romance track from Shershaah." },
        { name: "Zaalima", desc: "Arabic flute and clean synth beats from Raees." }
      ];

      const englishBases = [
        { name: "Shape of You", desc: "Ed Sheeran's marimba-pop global chartbuster." },
        { name: "Blinding Lights", desc: "The Weeknd's retro 80s synthesizer pop groove." },
        { name: "Perfect", desc: "Ed Sheeran's acoustic guitar wedding ballad." },
        { name: "Stay", desc: "Rhythmic pop-rock groove by Kid LAROI & Justin Bieber." },
        { name: "Believer", desc: "Imagine Dragons' heavy percussion rock anthem." },
        { name: "Bad Guy", desc: "Billie Eilish's minimalist dark electro-pop beats." },
        { name: "Senorita", desc: "Latin acoustic guitar duet by Shawn Mendes & Camila Cabello." },
        { name: "Levitating", desc: "Dua Lipa's funky retro disco dance beat." }
      ];

      const variations = ["", " (Acoustic Mix)", " (Lofi Edit)", " (Club Remix)", " (Speed Up)", " (Live at Wembley)", " (Reprise)", " (8D Audio)", " (Instrumental)", " (Chill Mix)"];

      const defaultSongs = [];
      for (let i = 1; i <= 5100; i++) {
        let base, lang, albumName;
        const selector = i % 3;

        if (selector === 0) {
          lang = "Telugu";
          albumName = "Telugu Melodies";
          base = teluguBases[i % teluguBases.length];
        } else if (selector === 1) {
          lang = "Hindi";
          albumName = "Bollywood Hits";
          base = hindiBases[i % hindiBases.length];
        } else {
          lang = "English";
          albumName = "English Pop";
          base = englishBases[i % englishBases.length];
        }

        const variation = variations[i % variations.length];
        const helixIndex = (i % 8) + 1;
        const fileUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${helixIndex}.mp3`;
        
        const imageIds = [
          "photo-1614613535308-eb5fbd3d2c17",
          "photo-1511671782779-c97d3d27a1d4",
          "photo-1518609878373-06d740f60d8b",
          "photo-1470225620780-dba8ba36b745",
          "photo-1498038432885-c6f3f1b912ee",
          "photo-1514525253161-7a46d19cd819",
          "photo-1506157786151-b8491531f063"
        ];
        const imgId = imageIds[i % imageIds.length];
        const imageUrl = `https://images.unsplash.com/${imgId}?w=500&auto=format&fit=crop&q=60`;
        
        const min = (i % 4) + 3; // 3 to 6 mins
        const sec = (i * 7) % 60;
        const duration = `${min}:${sec < 10 ? '0' : ''}${sec}`;

        defaultSongs.push({
          name: `${base.name}${variation} #${i}`,
          desc: base.desc,
          album: albumName,
          image: imageUrl,
          file: fileUrl,
          duration: duration
        });
      }

      console.log(`Generated ${defaultSongs.length} popular songs. Writing in bulk...`);
      if (mongoose.connection.readyState === 1) {
        const songModel = (await import('./models/songModel.js')).default;
        await songModel.insertMany(defaultSongs);
        console.log("Database bulk-insert into MongoDB complete.");
      } else {
        const dbPath = path.resolve('db.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const formattedSongs = defaultSongs.map((s, idx) => ({
          _id: `song_${Date.now()}_${idx}`,
          ...s
        }));
        db.songs = formattedSongs;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log("Database bulk-insert into db.json complete.");
      }
    }
  } catch (error) {
    console.error("Error pre-populating database:", error);
  }
};

app.listen(port, async () => {
  console.log(`Server started on port ${port}`);
  await prePopulateDb();
});
