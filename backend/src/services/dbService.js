import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import songModel from '../models/songModel.js';
import albumModel from '../models/albumModel.js';
import userModel from '../models/userModel.js';

const dbPath = path.resolve('db.json');

// Transaction queue to serialize concurrent write operations
let writeQueue = Promise.resolve();

const queueTransaction = (fn) => {
  const result = writeQueue.then(async () => {
    return fn();
  });
  writeQueue = result.catch(() => {});
  return result;
};

const writeLocalDbAtomic = async (data) => {
  const tempPath = `${dbPath}.tmp`;
  try {
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, dbPath);
  } catch (error) {
    console.error("Atomic write to local DB failed:", error);
    try {
      await fs.promises.unlink(tempPath);
    } catch (_) {}
    throw error;
  }
};

const initLocalDbAsync = async () => {
  try {
    await fs.promises.access(dbPath);
    const content = await fs.promises.readFile(dbPath, 'utf-8');
    const data = JSON.parse(content);
    if (!data.users) {
      data.users = [];
      await writeLocalDbAtomic(data);
    }
  } catch (err) {
    // File doesn't exist or is invalid JSON; initialize new structure
    await writeLocalDbAtomic({ albums: [], songs: [], users: [] });
  }
};

const readLocalDb = async () => {
  await initLocalDbAsync();
  const data = await fs.promises.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
};

const isMongoEnabled = () => {
  return !!process.env.MONGODB_URI && mongoose.connection.readyState === 1;
};

export const getAlbums = async () => {
  if (isMongoEnabled()) {
    return await albumModel.find({});
  } else {
    return (await readLocalDb()).albums;
  }
};

export const createAlbum = async (albumData) => {
  if (isMongoEnabled()) {
    const album = new albumModel(albumData);
    return await album.save();
  } else {
    return queueTransaction(async () => {
      const db = await readLocalDb();
      const newAlbum = {
        _id: 'album_' + Date.now(),
        ...albumData
      };
      db.albums.push(newAlbum);
      await writeLocalDbAtomic(db);
      return newAlbum;
    });
  }
};

export const deleteAlbum = async (id) => {
  if (isMongoEnabled()) {
    return await albumModel.findByIdAndDelete(id);
  } else {
    return queueTransaction(async () => {
      const db = await readLocalDb();
      db.albums = db.albums.filter(a => a._id !== id);
      await writeLocalDbAtomic(db);
      return { success: true };
    });
  }
};

export const getSongs = async () => {
  if (isMongoEnabled()) {
    return await songModel.find({});
  } else {
    return (await readLocalDb()).songs;
  }
};

export const createSong = async (songData) => {
  if (isMongoEnabled()) {
    const song = new songModel(songData);
    return await song.save();
  } else {
    return queueTransaction(async () => {
      const db = await readLocalDb();
      const newSong = {
        _id: 'song_' + Date.now(),
        ...songData
      };
      db.songs.push(newSong);
      await writeLocalDbAtomic(db);
      return newSong;
    });
  }
};

export const deleteSong = async (id) => {
  if (isMongoEnabled()) {
    return await songModel.findByIdAndDelete(id);
  } else {
    return queueTransaction(async () => {
      const db = await readLocalDb();
      db.songs = db.songs.filter(s => s._id !== id);
      await writeLocalDbAtomic(db);
      return { success: true };
    });
  }
};

export const getUserByEmail = async (email) => {
  if (isMongoEnabled()) {
    return await userModel.findOne({ email });
  } else {
    const db = await readLocalDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
};

export const createUser = async (userData) => {
  if (isMongoEnabled()) {
    const user = new userModel(userData);
    return await user.save();
  } else {
    return queueTransaction(async () => {
      const db = await readLocalDb();
      const newUser = {
        _id: 'user_' + Date.now(),
        ...userData
      };
      db.users.push(newUser);
      await writeLocalDbAtomic(db);
      return newUser;
    });
  }
};

export const getUserById = async (id) => {
  if (isMongoEnabled()) {
    return await userModel.findById(id);
  } else {
    const db = await readLocalDb();
    return db.users.find(u => u._id === id);
  }
};
