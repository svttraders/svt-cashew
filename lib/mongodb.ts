import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  clientPromise: Promise<MongoClient> | null;
}

declare global {
  var _mongoGlobal: GlobalMongo | undefined;
}

let cached: GlobalMongo = global._mongoGlobal || { conn: null, promise: null, clientPromise: null };

if (!global._mongoGlobal) {
  global._mongoGlobal = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not set in environment variables. Operating in fallback mock mode.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Connected successfully to MongoDB Atlas.");
      return mongooseInstance;
    }).catch(err => {
      console.error("MongoDB Atlas connection error:", err.message);
      cached.promise = null;
      return null;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
