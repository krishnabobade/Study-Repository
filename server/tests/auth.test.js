const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

// Include global test hook setups
require('./setup');

describe('Authentication API Endpoint Integration Tests', () => {
  it('should block user registration with a non-MIT-WPU email domain', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Student',
        email: 'student@gmail.com',
        password: 'Password123!',
        phone: '1234567890'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('domain');
  });

  it('should successfully register a student with a valid `@mitwpu.edu.in` email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john.doe@mitwpu.edu.in',
        password: 'Password123!',
        phone: '9876543210',
        course: 'BCA',
        semester: 3
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('john.doe@mitwpu.edu.in');

    // Verify it saved in DB
    const dbUser = await User.findOne({ email: 'john.doe@mitwpu.edu.in' });
    expect(dbUser).not.toBeNull();
    expect(dbUser.name).toBe('John Doe');
  });

  it('should successfully authenticate (login) a user with valid credentials', async () => {
    // 1. Manually seed a verified user in DB
    await User.create({
      name: 'Jane Doe',
      email: 'jane.doe@mitwpu.edu.in',
      password: 'Password123!',
      isVerified: true
    });

    // 2. Attempt login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane.doe@mitwpu.edu.in',
        password: 'Password123!',
        consentAccepted: true
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('jane.doe@mitwpu.edu.in');
  });

  it('should reject login attempt with incorrect credentials', async () => {
    await User.create({
      name: 'Jane Doe',
      email: 'jane.doe@mitwpu.edu.in',
      password: 'Password123!',
      isVerified: true
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane.doe@mitwpu.edu.in',
        password: 'WrongPassword!',
        consentAccepted: true
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
