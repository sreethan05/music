import { createSong, getSongs, deleteSong } from '../services/dbService.js';
import { uploadFile } from '../services/uploadService.js';

export const addSong = async (req, res) => {
  try {
    const { name, desc, album } = req.body;
    
    // Multer uploads will put files on req.files
    const audioFile = req.files && req.files.audio ? req.files.audio[0] : null;
    const imageFile = req.files && req.files.image ? req.files.image[0] : null;

    if (!name || !desc || !album || !audioFile || !imageFile) {
      return res.status(400).json({ success: false, message: "Missing required fields or files." });
    }

    // Upload audio and image files
    // Cloudinary needs resource_type: 'video' for audio files
    const audioUrl = await uploadFile(audioFile, 'video');
    const imageUrl = await uploadFile(imageFile, 'image');

    // Calculate duration
    // If the upload url is from Cloudinary and has duration, we can read it.
    // In our local fallback we will default to a standard "3:00".
    // When the audio loads in the browser, the browser will dynamically determine the precise duration.
    let duration = "3:00";
    
    // If we want a dynamic duration for local files, we can estimate it,
    // or just leave it as a clean default. 3:00 is a very safe placeholder.
    const songData = {
      name,
      desc,
      album,
      image: imageUrl,
      file: audioUrl,
      duration
    };

    const newSong = await createSong(songData);
    res.status(201).json({ success: true, message: "Song added successfully!", song: newSong });
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listSong = async (req, res) => {
  try {
    const songs = await getSongs();
    res.status(200).json({ success: true, songs });
  } catch (error) {
    console.error("Error listing songs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeSong = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing song ID." });
    }
    await deleteSong(id);
    res.status(200).json({ success: true, message: "Song removed successfully!" });
  } catch (error) {
    console.error("Error removing song:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
