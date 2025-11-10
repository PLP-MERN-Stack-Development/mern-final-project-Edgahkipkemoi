# 🚀 How to Start FitTrack Application

## The Problem
You're getting "Registration failed" because the **backend server is not running**.

## The Solution
You need to start BOTH servers (backend and frontend) and keep them running.

---

## ✅ Step-by-Step Instructions

### Step 1: Start Backend Server

1. Open a **NEW terminal window**
2. Navigate to backend folder:
   ```bash
   cd mern-final-project-Edgahkipkemoi/backend
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```
4. **KEEP THIS TERMINAL OPEN!** You should see:
   ```
   🚀 Server running in development mode on port 5000
   📦 MongoDB Connected: ac-x3lfylp-shard-00-00.8xmkqnl.mongodb.net
   📊 Health check available at http://localhost:5000/api/health
   ```

### Step 2: Start Frontend Server

1. Open a **SECOND terminal window** (keep backend running!)
2. Navigate to frontend folder:
   ```bash
   cd mern-final-project-Edgahkipkemoi/frontend
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. **KEEP THIS TERMINAL OPEN TOO!** You should see:
   ```
   Local: http://localhost:5173/
   ```

### Step 3: Test Registration

1. Open your browser
2. Go to: `http://localhost:5173`
3. Click "Sign up here"
4. Fill in the form:
   - Username: `myusername` (3-30 chars, letters/numbers/underscore only)
   - Email: `myemail@example.com`
   - Password: `MyPass123` (min 8 chars, uppercase, lowercase, number)
   - First Name: `John`
   - Last Name: `Doe`
5. Click "Create Account"
6. ✅ You should be registered and logged in!

---

## 🎯 Quick Test

Before trying the UI, test if backend is working:

```bash
# In a new terminal
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"OK","timestamp":"...","environment":"development"}
```

If this works, your backend is running correctly!

---

## ⚠️ Common Mistakes

### Mistake 1: Only Starting One Server
❌ **Wrong**: Starting only backend OR only frontend
✅ **Correct**: Start BOTH and keep both running

### Mistake 2: Closing Terminal Windows
❌ **Wrong**: Closing the terminal after starting server
✅ **Correct**: Keep both terminals open while using the app

### Mistake 3: Wrong Directory
❌ **Wrong**: Running `npm run dev` from root folder
✅ **Correct**: Run from `backend` folder for backend, `frontend` folder for frontend

---

## 📊 What You Should See

### Terminal 1 (Backend):
```
> fittrack-backend@1.0.0 dev
> nodemon src/server.ts

[nodemon] 3.1.10
[nodemon] starting `ts-node src/server.ts`
🚀 Server running in development mode on port 5000
📦 MongoDB Connected: ac-x3lfylp-shard-00-00.8xmkqnl.mongodb.net
📊 Health check available at http://localhost:5000/api/health
🚀 Socket.IO server initialized
```

### Terminal 2 (Frontend):
```
> fittrack-frontend@1.0.0 dev
> vite

  VITE v5.4.21  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error**: `Port 5000 is already in use`
**Solution**: Kill the process or change port
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

**Error**: `MongoDB connection error`
**Solution**: Check `backend/.env` file has correct MongoDB URI with password (no angle brackets)

### Frontend Won't Start

**Error**: `Port 5173 is already in use`
**Solution**: Kill the process or it will suggest another port

### Registration Still Fails

1. Check backend terminal for error messages
2. Check browser console (F12) for errors
3. Verify both servers are running
4. Try the curl test above

---

## 💡 Pro Tip

Use VS Code's split terminal feature:
1. Open VS Code
2. Open terminal (Ctrl + `)
3. Click the split terminal button
4. Run backend in one terminal, frontend in the other
5. Both visible at once!

---

## ✅ Success Checklist

Before trying to register, verify:

- [ ] Backend terminal is open and shows "Server running on port 5000"
- [ ] Backend shows "MongoDB Connected"
- [ ] Frontend terminal is open and shows "Local: http://localhost:5173/"
- [ ] Browser can access http://localhost:5173
- [ ] Health check works: `curl http://localhost:5000/api/health`

If all checked, registration will work! 🎉
