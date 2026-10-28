import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from 'vitest';

beforeAll(async () => {
  const uri = process.env.TEST_MONGODB_URI;
  if (uri && mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
