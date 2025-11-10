import request from 'supertest';
import { app } from '../server';
import User from '../models/User';

describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.data.user.username).toBe(userData.username);
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.accessToken).toBeDefined();

            // Verify user was created in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user?.username).toBe(userData.username);
        });

        it('should not register user with invalid email', async () => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should not register user with weak password', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'weak',
                firstName: 'Test',
                lastName: 'User',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should not register user with duplicate email', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User',
            };

            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Try to register with same email
            const duplicateData = {
                ...userData,
                username: 'testuser2',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(duplicateData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User',
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);
        });

        it('should login with valid credentials (email)', async () => {
            const loginData = {
                identifier: 'test@example.com',
                password: 'TestPass123',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(response.body.data.accessToken).toBeDefined();
        });

        it('should login with valid credentials (username)', async () => {
            const loginData = {
                identifier: 'testuser',
                password: 'TestPass123',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data.user.username).toBe('testuser');
            expect(response.body.data.accessToken).toBeDefined();
        });

        it('should not login with invalid credentials', async () => {
            const loginData = {
                identifier: 'test@example.com',
                password: 'WrongPassword',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should not login with non-existent user', async () => {
            const loginData = {
                identifier: 'nonexistent@example.com',
                password: 'TestPass123',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        let accessToken: string;

        beforeEach(async () => {
            // Register and login to get access token
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User',
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            accessToken = registerResponse.body.data.accessToken;
        });

        it('should get current user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.username).toBe('testuser');
            expect(response.body.data.user.email).toBe('test@example.com');
        });

        it('should not get profile without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Access denied. No token provided.');
        });

        it('should not get profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid token.');
        });
    });

    describe('POST /api/auth/logout', () => {
        let accessToken: string;

        beforeEach(async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User',
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            accessToken = registerResponse.body.data.accessToken;
        });

        it('should logout successfully with valid token', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logout successful');
        });

        it('should not logout without token', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});