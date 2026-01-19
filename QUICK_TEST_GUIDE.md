# Quick Test Guide - Console Logging Check

## Step 1: Server Start Karein

Apne terminal me yeh command run karein:

```powershell
npm start
```

Aapko yeh dikhna chahiye:
```
MongoDB Connected: ...
Server is running on port 5000
```

## Step 2: Server Console Open Rakhein

**Important:** Server wala terminal/tab open rakhein - yahi pe logs dikhenge!

## Step 3: Login API Test Karein

### Option A: PowerShell Script Use Karein (Easiest)

Naya terminal window kholen (server running rahegi pehle wale me) aur yeh command run karein:

```powershell
.\test-login.ps1
```

Ya phir directly PowerShell command:

```powershell
$body = @{
    phoneNumber = "1234567890"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Option B: Postman/Thunder Client Use Karein

1. Postman kholen ya Thunder Client extension
2. POST request: `http://localhost:5000/api/auth/login`
3. Body (JSON):
```json
{
  "phoneNumber": "1234567890",
  "password": "password123"
}
```
4. Send click karein

### Option C: Browser se (Simple Test)

Browser me kholen:
```
http://localhost:5000/health
```

Yeh health check hai - isse server check hota hai.

## Step 4: Console Me Kya Dikhna Chahiye

Server console me aapko yeh dikhna chahiye:

```
============================================================
📥 INCOMING REQUEST - 2024-01-15T10:30:45.123Z
Method: POST
URL: /api/auth/login
IP: ::1
Body: {
  "phoneNumber": "1234567890",
  "password": "***HIDDEN***"
}
============================================================
🔐 Login attempt for phone: 1234567890
✅ User found: John Doe (john@example.com)
✅ Password verified successfully for user: john@example.com
🎫 JWT token generated for user: 65a1b2c3d4e5f6g7h8i9j0k1
📤 RESPONSE STATUS: 200
✅ Success Response
============================================================
```

## Agar Logs Nahi Dikhe To:

1. **Server restart karein:**
   ```powershell
   # Server band karein (Ctrl+C)
   npm start  # Phir se start karein
   ```

2. **Check karein ki logger middleware loaded hai:**
   - `server.js` me line 22 pe `app.use(logger);` hona chahiye

3. **Simple test:**
   - Browser me `http://localhost:5000/health` kholen
   - Console me at least request log dikhna chahiye

## Pehle User Register Karna Zaroori Hai

Agar pehle user register nahi kiya, to pehle register karein:

```powershell
$registerBody = @{
    firstName = "John"
    lastName = "Doe"
    email = "john@example.com"
    phoneNumber = "1234567890"
    countryCode = "+91"
    address = @{
        state = "Maharashtra"
        district = "Pune"
        taluko = "Pune"
        villageName = "Test Village"
    }
    pincode = "411001"
    password = "password123"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
```

Fir login karein!
