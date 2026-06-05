import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log("No MONGODB_URI found. Running backend with local JSON database fallback.");
    return;
  }

  try {
    mongoose.connection.on('connected', () => {
      console.log("MongoDB connection established successfully.");
    });
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
