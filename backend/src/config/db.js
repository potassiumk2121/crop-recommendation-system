import mongoose from 'mongoose';

/**
 * Connect MongoDB via Mongoose. Exits process on fatal connection errors in production.
 */
export async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[db] Connected to MongoDB');
}
