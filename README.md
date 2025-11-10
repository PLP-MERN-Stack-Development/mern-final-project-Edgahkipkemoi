# 🏋️ FitTrack - Comprehensive Fitness Tracking Application

[![CI/CD Pipeline](https://github.com/yourusername/fittrack/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/fittrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack MERN application for comprehensive fitness tracking with real-time features, social interactions, and detailed analytics.

## 🚀 Live Demo

- **Frontend**: [https://fittrack-frontend.vercel.app](https://fittrack-frontend.vercel.app)
- **Backend API**: [https://fittrack-backend.render.com](https://fittrack-backend.render.com)
- **API Documentation**: [https://fittrack-backend.render.com/api/health](https://fittrack-backend.render.com/api/health)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens and HTTP-only cookies
- 👤 **User Management**: Complete profile management with social features
- 💪 **Workout Tracking**: Create, track, and analyze workouts with detailed exercise data
- 🎯 **Goal Setting**: Set and track fitness goals with progress monitoring
- 📊 **Analytics & Charts**: Comprehensive statistics and progress visualization
- 🏃 **Exercise Library**: Extensive exercise database with custom exercise creation
- 👥 **Social Features**: Follow users, share workouts, like and comment on posts

### Technical Features
- ⚡ **Real-time Updates**: Socket.IO for live notifications and workout updates
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🔍 **Advanced Search**: Filter and search exercises, workouts, and users
- 📈 **Data Visualization**: Interactive charts with Recharts
- 🧪 **Comprehensive Testing**: Unit, integration, and E2E tests
- 🚀 **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- 🔒 **Security**: Rate limiting, input validation, and security headers

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO
- **Validation**: Express-validator
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Testing**: Jest + Playwright (E2E)
- **Icons**: Lucide React

### DevOps & Deployment
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **Monitoring**: Built-in health checks

## 📁 Project Structure

```
fittrack/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Utility scripts (seed, etc.)
│   │   ├── socket/         # Socket.IO handlers
│   │   ├── tests/          # Test files
│   │   ├── types/          # TypeScript type definitions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   └── main.tsx       # App entry point
│   ├── public/            # Static assets
│   ├── package.json
│   └── vite.config.ts
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── docs/                  # Documentation
├── package.json           # Root package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fittrack.git
cd fittrack
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Setup
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Development Servers
```bash
# From root directory - starts both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 5. Seed Sample Data (Optional)
```bash
cd backend
npm run seed
```

## 🔧 Installation

### Detailed Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fittrack
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

### Detailed Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the frontend server**:
   ```bash
   npm run dev
   ```

## 🌍 Environment Setup

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5000` | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | Yes |
| `COOKIE_SECRET` | Cookie signing secret | - | Yes |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `/api` | Yes |
| `VITE_APP_NAME` | Application name | `FitTrack` | No |

## 🏃 Running the Application

### Development Mode

1. **Start both servers** (recommended):
   ```bash
   npm run dev
   ```

2. **Start servers individually**:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Production Mode

1. **Build the applications**:
   ```bash
   npm run build
   ```

2. **Start production servers**:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend (serve built files)
   cd frontend && npm run preview
   ```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run linting
npm run lint
```

### Full Test Suite

```bash
# From root directory
npm test
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Configure build settings**:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install && cd frontend && npm install`

3. **Set environment variables**:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

### Backend Deployment (Render)

1. **Connect your GitHub repository to Render**
2. **Configure build settings**:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`

3. **Set environment variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-jwt-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   COOKIE_SECRET=your-production-cookie-secret
   ```

### Database Setup (MongoDB Atlas)

1. **Create a MongoDB Atlas account**
2. **Create a new cluster**
3. **Create a database user**
4. **Whitelist your IP addresses**
5. **Get your connection string**
6. **Update your environment variables**

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| GET | `/api/users/dashboard` | Get dashboard data |
| GET | `/api/users/search` | Search users |

### Workout Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | Get user workouts |
| POST | `/api/workouts` | Create workout |
| GET | `/api/workouts/:id` | Get workout by ID |
| PUT | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |

### Exercise Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | Get exercises |
| POST | `/api/exercises` | Create custom exercise |
| GET | `/api/exercises/:id` | Get exercise by ID |
| PUT | `/api/exercises/:id` | Update exercise |
| DELETE | `/api/exercises/:id` | Delete exercise |

### Goal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get user goals |
| POST | `/api/goals` | Create goal |
| GET | `/api/goals/:id` | Get goal by ID |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

### Social Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/social/feed` | Get user feed |
| GET | `/api/social/discover` | Get public posts |
| POST | `/api/social/posts` | Create post |
| POST | `/api/social/posts/:id/like` | Like/unlike post |
| POST | `/api/social/posts/:id/comments` | Add comment |

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/) for the database
- [Express.js](https://expressjs.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Socket.IO](https://socket.io/) for real-time features

## 📞 Support

If you have any questions or need help with setup, please:

1. Check the [Issues](https://github.com/yourusername/fittrack/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

**Happy Coding! 🚀**