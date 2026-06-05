import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import songModel from '../models/songModel.js';
import albumModel from '../models/albumModel.js';
import userModel from '../models/userModel.js';

const dbPath = path.resolve('db.json');

const initLocalDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ albums: [], songs: [], users: [] }, null, 2));
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (!data.users) {
        data.users = [];
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.error("Local DB read failed during initialization, resetting users:", e);
    }
  }
};

const readLocalDb = () => {
  initLocalDb();
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const writeLocalDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const isMongoEnabled = () => {
  return !!process.env.MONGODB_URI && mongoose.connection.readyState === 1;
};

export const getAlbums = async () => {
  if (isMongoEnabled()) {
    return await albumModel.find({});
  } else {
    return readLocalDb().albums;
  }
};

export const createAlbum = async (albumData) => {
  if (isMongoEnabled()) {
    const album = new albumModel(albumData);
    return await album.save();
  } else {
    const db = readLocalDb();
    const newAlbum = {
      _id: 'album_' + Date.now(),
      ...albumData
    };
    db.albums.push(newAlbum);
    writeLocalDb(db);
    return newAlbum;
  }
};

export const deleteAlbum = async (id) => {
  if (isMongoEnabled()) {
    return await albumModel.findByIdAndDelete(id);
  } else {
    const db = readLocalDb();
    db.albums = db.albums.filter(a => a._id !== id);
    writeLocalDb(db);
    return { success: true };
  }
};

export const getSongs = async () => {
  if (isMongoEnabled()) {
    return await songModel.find({});
  } else {
    return readLocalDb().songs;
  }
};

export const createSong = async (songData) => {
  if (isMongoEnabled()) {
    const song = new songModel(songData);
    return await song.save();
  } else {
    const db = readLocalDb();
    const newSong = {
      _id: 'song_' + Date.now(),
      ...songData
    };
    db.songs.push(newSong);
    writeLocalDb(db);
    return newSong;
  }
};

export const deleteSong = async (id) => {
  if (isMongoEnabled()) {
    return await songModel.findByIdAndDelete(id);
  } else {
    const db = readLocalDb();
    db.songs = db.songs.filter(s => s._id !== id);
    writeLocalDb(db);
    return { success: true };
  }
};

export const getUserByEmail = async (email) => {
  if (isMongoEnabled()) {
    return await userModel.findOne({ email });
  } else {
    const db = readLocalDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
};

export const createUser = async (userData) => {
  if (isMongoEnabled()) {
    const user = new userModel(userData);
    return await user.save();
  } else {
    const db = readLocalDb();
    const newUser = {
      _id: 'user_' + Date.now(),
      ...userData
    };
    db.users.push(newUser);
    writeLocalDb(db);
    return newUser;
  }
};

export const getUserById = async (id) => {
  if (isMongoEnabled()) {
    return await userModel.findById(id);
  } else {
    const db = readLocalDb();
    return db.users.find(u => u._id === id);
  }
};
