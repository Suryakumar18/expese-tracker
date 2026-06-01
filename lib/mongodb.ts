import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://localhost:27017/expense_tracker";

if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');

interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
declare global { var _mongoose: MongooseCache | undefined }

const cached: MongooseCache = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
