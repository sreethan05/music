import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { addAlbum, listAlbum, removeAlbum } from '../controllers/albumController.js';
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

const albumRouter = express.Router();

albumRouter.post('/add', adminAuth, upload.single('image'), addAlbum);
albumRouter.get('/list', listAlbum);
albumRouter.post('/remove', adminAuth, removeAlbum);

export default albumRouter;
