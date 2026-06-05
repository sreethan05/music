import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { addSong, listSong, removeSong } from '../controllers/songController.js';
import { adminAuth } from '../controllers/authController.js';

// Setup local temp directory for multer
const tempDir = path.resolve('temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

const songRouter = express.Router();

songRouter.post('/add', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), addSong);

songRouter.get('/list', listSong);
songRouter.post('/remove', adminAuth, removeSong);

export default songRouter;
