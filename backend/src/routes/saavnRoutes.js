import express from 'express';
import { searchJioSaavn } from '../controllers/saavnController.js';

const saavnRouter = express.Router();

saavnRouter.get('/search', searchJioSaavn);

export default saavnRouter;
