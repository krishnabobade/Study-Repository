const mongoose = require('mongoose');

beforeAll(async () => {
  // Use a separate test database
  process.env.MONGO_URI = 'mongodb://localhost:27017/studyrepo_test';
  process.env.JWT_SECRET = 'test_secret_key_123';
  process.env.ADMIN_EMAIL = 'admin@mitwpu.edu.in';
});

afterAll(async () => {
  // Drop the test database and close connection
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (e) {
      // Ignored if connection already closed or db not initialized
    }
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  // Clear collections
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
