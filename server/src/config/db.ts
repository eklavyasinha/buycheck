import mongoose from 'mongoose';

let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>') || uri === 'memory') {
    console.log('ℹ️ MongoDB URI not configured. BuyCheck is running in In-Memory Local Persistence Mode.');
    isMongoConnected = false;
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
    return true;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection failed (${err.message}). Falling back to In-Memory Local Mode.`);
    isMongoConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isMongoConnected;
}
