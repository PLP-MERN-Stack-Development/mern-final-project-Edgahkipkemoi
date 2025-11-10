# 🚀 FitTrack Complete Setup Guide

This guide will walk you through setting up the complete FitTrack application from scratch to deployment.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** and **npm** ([Download here](https://nodejs.org/))
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) account)
- **Git** ([Download here](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

## 🏗️ Project Architecture Overview

FitTrack is a full-stack MERN application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   MongoDB       │
│   (Port 5173)   │◄──►│   (Port 5000)   │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • TypeScript    │    │ • TypeScript    │    │ • User Data     │
│ • Tailwind CSS │    │ • JWT Auth      │    │ • Workouts      │
│ • React Query  │    │ • Socket.IO     │    │ • Goals         │
│ • Socket.IO    │    │ • Validation    │    │ • Social Posts  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Step-by-Step Setup

### Step 1: Clone and Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd mern-final-project-Edgahkipkemoi

# Install root dependencies
npm install
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your backend `.env` file:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (Choose one option)
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/fittrack

# Option 2: MongoDB Atlas (Recommended for production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fittrack

# JWT Configuration (Generate secure secrets)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECRET=your-cookie-secret-min-32-chars

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Start the backend server:**

```bash
# Development mode with auto-reload
npm run dev

# Or build and start production mode
npm run build
npm start
```

**Verify backend is running:**
- Open http://localhost:5000/api/health
- You should see: `{"status":"OK","timestamp":"...","environment":"development"}`

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your frontend `.env` file:**

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=FitTrack
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

**Start the frontend server:**

```bash
# Development mode with hot reload
npm run dev

# Or build and preview production mode
npm run build
npm run preview
```

**Verify frontend is running:**
- Open http://localhost:5173
- You should see the FitTrack login page

### Step 4: Database Setup

#### Option A: Local MongoDB

1. **Install MongoDB locally** ([Installation Guide](https://docs.mongodb.com/manual/installation/))

2. **Start MongoDB service:**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

3. **Verify connection:**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # In MongoDB shell
   show dbs
   use fittrack
   ```

#### Option B: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas account** at [mongodb.com/atlas](https://www.mongodb.com/atlas)

2. **Create a new cluster:**
   - Choose the free tier (M0)
   - Select your preferred region
   - Create cluster

3. **Create database user:**
   - Go to Database Access
   - Add new database user
   - Choose password authentication
   - Save username and password

4. **Configure network access:**
   - Go to Network Access
   - Add IP Address
   - For development: Add `0.0.0.0/0` (allow from anywhere)
   - For production: Add specific IP addresses

5. **Get connection string:**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update your backend `.env` file

### Step 5: Seed Sample Data (Optional but Recommended)

```bash
# From backend directory
cd backend
npm run seed
```

This will create:
- Sample users (john_doe, jane_smith, etc.)
- Exercise library (push-ups, squats, etc.)
- Sample workouts and goals
- Social posts and interactions

**Demo Login Credentials:**
- Username: `john_doe`
- Password: `Password123`

### Step 6: Start Both Servers

From the root directory, you can start both servers simultaneously:

```bash
# Start both backend and frontend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 🧪 Testing Setup

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 🚀 Deployment Setup

### Frontend Deployment (Vercel)

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Set environment variables in Vercel:**
   ```
   VITE_API_URL=https://your-backend-url.render.com/api
   ```

### Backend Deployment (Render)

1. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure build settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Set environment variables in Render:**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-jwt-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   COOKIE_SECRET=your-production-cookie-secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Backend won't start
```bash
# Check if MongoDB is running
mongosh

# Check if port 5000 is available
lsof -i :5000

# Check environment variables
cat backend/.env
```

#### 2. Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check frontend environment
cat frontend/.env

# Check browser console for CORS errors
```

#### 3. Database connection issues
```bash
# Test MongoDB connection
mongosh "your-connection-string"

# Check network access (Atlas)
# Verify IP whitelist in MongoDB Atlas

# Check credentials
# Ensure username/password are correct
```

#### 4. Authentication not working
```bash
# Check JWT secrets are set
echo $JWT_SECRET

# Clear browser cookies and localStorage
# Try incognito/private browsing mode

# Check backend logs for JWT errors
```

#### 5. Socket.IO connection issues
```bash
# Check if Socket.IO is enabled
# Verify CORS settings in backend
# Check browser network tab for WebSocket connections
```

## 📚 API Testing with Postman

1. **Import the Postman collection:**
   - Open Postman
   - Import `docs/FitTrack-API.postman_collection.json`

2. **Set up environment variables:**
   - Create new environment in Postman
   - Add variable: `baseUrl` = `http://localhost:5000/api`

3. **Test the API:**
   - Start with "Health Check"
   - Register a new user or login with demo credentials
   - Test other endpoints (the collection will auto-set tokens)

## 🔒 Security Considerations

### Development
- Use strong, unique secrets for JWT and cookies
- Never commit `.env` files to version control
- Use HTTPS in production
- Implement proper input validation

### Production
- Use environment-specific secrets
- Enable rate limiting
- Set up monitoring and logging
- Regular security updates
- Database backups

## 📈 Performance Optimization

### Backend
- Enable compression middleware
- Implement database indexing
- Use connection pooling
- Cache frequently accessed data

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis
- Service worker for caching

## 🎯 Next Steps

After successful setup:

1. **Explore the application:**
   - Create user accounts
   - Add workouts and exercises
   - Set fitness goals
   - Use social features

2. **Customize for your needs:**
   - Add new exercise categories
   - Implement additional features
   - Modify the UI/UX
   - Add integrations

3. **Deploy to production:**
   - Follow deployment guides above
   - Set up monitoring
   - Configure custom domains
   - Set up CI/CD pipelines

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:**
   ```bash
   # Backend logs
   cd backend && npm run dev
   
   # Frontend logs  
   cd frontend && npm run dev
   ```

2. **Common commands:**
   ```bash
   # Reset node_modules
   rm -rf node_modules package-lock.json && npm install
   
   # Reset database (development)
   # Drop database and re-seed
   
   # Check running processes
   ps aux | grep node
   ```

3. **Resources:**
   - [MongoDB Documentation](https://docs.mongodb.com/)
   - [Express.js Guide](https://expressjs.com/en/guide/)
   - [React Documentation](https://react.dev/)
   - [Vite Guide](https://vitejs.dev/guide/)

---

**Congratulations! 🎉 You now have a fully functional FitTrack application running locally and ready for deployment.**