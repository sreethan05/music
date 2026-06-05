import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isCloudinaryEnabled = () => {
  return !!(process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

export const uploadFile = async (file, resourceType = 'auto') => {
  if (!file) return null;

  if (isCloudinaryEnabled()) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType
      });
      
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err);
      }
      
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to local storage:", error.message);
    }
  }

  // Local storage fallback: move file from temporary folder to public uploads directory
  const uploadsDir = path.resolve('public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname);
  const fileName = `${file.fieldname}_${Date.now()}${fileExt}`;
  const targetPath = path.join(uploadsDir, fileName);

  fs.renameSync(file.path, targetPath);
  
  const publicUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${publicUrl.replace(/\/$/, '')}/uploads/${fileName}`;
};
