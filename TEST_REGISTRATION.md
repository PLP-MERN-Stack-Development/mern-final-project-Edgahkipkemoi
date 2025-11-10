# Test Registration Endpoint

## Quick Test with curl

Open a terminal and run this command to test registration directly:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser123\",\"email\":\"test@example.com\",\"password\":\"TestPass123\",\"firstName\":\"Test\",\"lastName\":\"User\"}"
```

## Expected Response (Success):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "...",
    "user": {
      "id": "...",
      "username": "testuser123",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "isEmailVerified": false
    }
  }
}
```

## Common Errors and Solutions:

### 1. Connection Refused
**Error**: `Failed to connect to localhost port 5000`
**Solution**: Backend server is not running. Start it with:
```bash
cd backend
npm run dev
```

### 2. User Already Exists
**Error**: `User with this email already exists`
**Solution**: Use a different email or username

### 3. Validation Error
**Error**: `Validation failed`
**Solution**: Check that:
- Username: 3-30 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Min 8 chars, has uppercase, lowercase, and number
- First/Last name: 1-50 characters

### 4. MongoDB Connection Error
**Error**: `MongoDB connection error`
**Solution**: Check your `.env` file has correct MongoDB URI

## Check Backend Logs

When you try to register, check the backend terminal for error messages. Common issues:

1. **MongoDB not connected**: You'll see connection errors
2. **Validation errors**: You'll see which field failed validation
3. **Duplicate key errors**: User already exists

## Verify MongoDB Connection

Check if backend shows:
```
📦 MongoDB Connected: [your-mongodb-host]
```

If not, your MongoDB URI might be incorrect.
