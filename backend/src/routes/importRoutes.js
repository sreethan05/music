import express from 'express';
import { importPlaylist } from '../controllers/importController.js';
import { userAuth } from '../controllers/authController.js';

const importRouter = express.Router();

importRouter.post('/playlist', userAuth, importPlaylist);

export default importRouter;
