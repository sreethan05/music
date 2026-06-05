import { createAlbum, getAlbums, deleteAlbum } from '../services/dbService.js';
import { uploadFile } from '../services/uploadService.js';

export const addAlbum = async (req, res) => {
  try {
    const { name, desc, bgColour } = req.body;
    const imageFile = req.file;

    if (!name || !desc || !bgColour || !imageFile) {
      return res.status(400).json({ success: false, message: "Missing required fields or image file." });
    }

    // Upload cover image
    const imageUrl = await uploadFile(imageFile, 'image');

    const albumData = {
      name,
      desc,
      bgColour,
      image: imageUrl
    };

    const newAlbum = await createAlbum(albumData);
    res.status(201).json({ success: true, message: "Album added successfully!", album: newAlbum });
  } catch (error) {
    console.error("Error adding album:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listAlbum = async (req, res) => {
  try {
    const albums = await getAlbums();
    res.status(200).json({ success: true, albums });
  } catch (error) {
    console.error("Error listing albums:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeAlbum = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing album ID." });
    }
    await deleteAlbum(id);
    res.status(200).json({ success: true, message: "Album removed successfully!" });
  } catch (error) {
    console.error("Error removing album:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
