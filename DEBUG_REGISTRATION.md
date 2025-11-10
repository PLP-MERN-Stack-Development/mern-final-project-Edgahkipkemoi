# 🔍 Debug Registration Issue

## Step 1: Verify Backend is Running

Open a terminal and check if backend is running:

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

**If this fails**, start the backend:
```bash
cd backend
npm run dev
```

## Step 2: Check Backend Logs

When backend starts, you should see:
```
🚀 Server running in development mode on port 5000
📦 MongoDB Connected: ac-x3lfylp-shard-00-00.8xmkqnl.mongodb.net
📊 Health check available at http://localhost:5000/api/health
🚀 Socket.IO server initialized
```

**If you see MongoDB connection error:**
- Check your `backend/.env` file
- Verify MongoDB Atlas password is correct (no angle brackets)
- Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0)

## Step 3: Test Registration Directly

Test the registration endpoint with curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"newuser\",\"email\":\"newuser@test.com\",\"password\":\"Password123\",\"firstName\":\"New\",\"lastName\":\"User\"}"
```

## Step 4: Common Issues and Fixes

### Issue 1: Backend Not Running
**Symptom**: `ERR_CONNECTION_REFUSED` or `Failed to connect`
**Fix**: 
```bash
cd backend
npm run dev
```

### Issue 2: MongoDB Not Connected
**Symptom**: Backend starts but shows MongoDB connection error
**Fix**: Check `backend/.env` file:
```env
MONGODB_URI=mongodb+srv://kipkemoiedgah_db_user:KQrYX1hj4rYSDmrG@fittrackuser.8xmkqnl.mongodb.net/fittrack?retryWrites=true&w=majority&appName=fittrackUser
```
Make sure password has NO angle brackets!

### Issue 3: CORS Error
**Symptom**: Browser console shows CORS error
**Fix**: Backend `.env` should have:
```env
FRONTEND_URL=http://localhost:5173
```

### Issue 4: Validation Error
**Symptom**: "Validation failed" message
**Fix**: Ensure registration form has:
- Username: 3-30 chars, alphanumeric + underscore only
- Email: Valid email format
- Password: Min 8 chars, must have uppercase, lowercase, and number
- First/Last Name: 1-50 chars

### Issue 5: Port Already in Use
**Symptom**: `Port 5000 is already in use`
**Fix**: Kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Or change port in backend/.env
PORT=5001
```

## Step 5: Check Browser Console

Open browser DevTools (F12) and check:

1. **Network Tab**: Look for the POST request to `/api/auth/register`
   - Status should be 201 (success) or 400 (validation error)
   - Check the response body for error details

2. **Console Tab**: Look for any JavaScript errors

## Step 6: Verify MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Database" → "Browse Collections"
3. Look for `fittrack` database
4. Check if `users` collection exists
5. After successful registration, you should see the new user there

## Quick Fix Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Backend shows "MongoDB Connected" message
- [ ] Health endpoint works: `curl http://localhost:5000/api/health`
- [ ] Frontend server is running (`npm run dev` in frontend folder)
- [ ] Frontend is accessible at `http://localhost:5173`
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] Password in `.env` has no angle brackets
- [ ] Browser console shows no CORS errors

## Test with Postman

If curl doesn't work, use Postman:

1. Import the collection from `docs/FitTrack-API.postman_collection.json`
2. Set environment variable: `baseUrl = http://localhost:5000/api`
3. Run the "Register User" request
4. Check the response

## Still Not Working?

Check the backend terminal for the EXACT error message when you try to register. The error will tell you exactly what's wrong:

- "User with this email already exists" → Use different email
- "Validation failed" → Check password requirements
- "MongoDB connection error" → Check database connection
- No error but registration fails → Check backend logs for stack trace
