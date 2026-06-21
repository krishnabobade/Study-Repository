const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Resource = require('../models/Resource');

// Include global test hook setups
require('./setup');

describe('Resource API Endpoint Integration Tests', () => {
  it('should block resource creation if the request is unauthenticated', async () => {
    const res = await request(app)
      .post('/api/resources')
      .attach('file', Buffer.from('hello pdf content'), 'test.pdf')
      .field('title', 'Test Document')
      .field('subject', 'Maths')
      .field('course', 'BCA')
      .field('semester', 3)
      .field('category', 'notes');

    expect(res.status).toBe(401);
  });

  it('should successfully upload resource, generate simulated AI summary, and prevent duplicates', async () => {
    // 1. Create a user and fetch their login token
    const user = await User.create({
      name: 'Teacher User',
      email: 'teacher@mitwpu.edu.in',
      password: 'Password123!',
      role: 'student',
      isVerified: true
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teacher@mitwpu.edu.in',
        password: 'Password123!',
        consentAccepted: true
      });
    
    const token = loginRes.body.token;

    // 2. Upload file
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('unique pdf contents here...'), 'test.pdf')
      .field('title', 'Java Programming Basics')
      .field('subject', 'Java')
      .field('course', 'BCA')
      .field('semester', 3)
      .field('category', 'notes');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.resource).toBeDefined();
    expect(res.body.resource.title).toBe('Java Programming Basics');
    expect(res.body.resource.aiSummary).toBeDefined();

    // 3. Attempt duplicate file upload
    const dupRes = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('unique pdf contents here...'), 'test.pdf')
      .field('title', 'Java Programming Basics 2')
      .field('subject', 'Java')
      .field('course', 'BCA')
      .field('semester', 3)
      .field('category', 'notes');

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toContain('Duplicate file detected');
  });
});
