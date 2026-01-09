# API Testing Guide

This guide shows you how to test all the authentication endpoints.

## Prerequisites

1. Make sure the server is running:
   ```bash
   npm start
   ```

2. You should see:
   ```
   MongoDB Connected: localhost:27017
   Server is running on port 5000
   ```

## Testing Tools

You can use any of these tools:
- **Postman** (Desktop app or web)
- **Thunder Client** (VS Code/Cursor extension)
- **curl** (Command line)
- **REST Client** (VS Code extension)
- **Browser** (only for GET requests)

---

## 1. Health Check (Optional)

First, verify the server is running:

**Method:** GET  
**URL:** `http://localhost:5000/health`

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 2. Register User API

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Content-Type:** `application/json`

### Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "countryCode": "+91",
  "address": {
    "state": "Maharashtra",
    "district": "Pune",
    "taluko": "Pune",
    "villageName": "Sample Village"
  },
  "pincode": "411001",
  "password": "password123"
}
```

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john.doe@example.com\",\"phoneNumber\":\"1234567890\",\"countryCode\":\"+91\",\"address\":{\"state\":\"Maharashtra\",\"district\":\"Pune\",\"taluko\":\"Pune\",\"villageName\":\"Sample Village\"},\"pincode\":\"411001\",\"password\":\"password123\"}"
```

### Using PowerShell (Invoke-RestMethod):
```powershell
$body = @{
    firstName = "John"
    lastName = "Doe"
    email = "john.doe@example.com"
    phoneNumber = "1234567890"
    countryCode = "+91"
    address = @{
        state = "Maharashtra"
        district = "Pune"
        taluko = "Pune"
        villageName = "Sample Village"
    }
    pincode = "411001"
    password = "password123"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Expected Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "1234567890",
      "countryCode": "+91",
      "address": {
        "state": "Maharashtra",
        "district": "Pune",
        "taluko": "Pune",
        "villageName": "Sample Village"
      },
      "pincode": "411001"
    }
  }
}
```

**Important:** Save the `token` from the response - you'll need it for the Change Password API!

---

## 3. Login API

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Content-Type:** `application/json`

### Request Body:
```json
{
  "phoneNumber": "1234567890",
  "password": "password123"
}
```

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"1234567890\",\"password\":\"password123\"}"
```

### Using PowerShell:
```powershell
$body = @{
    phoneNumber = "1234567890"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Expected Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "1234567890",
      "countryCode": "+91",
      "address": {
        "state": "Maharashtra",
        "district": "Pune",
        "taluko": "Pune",
        "villageName": "Sample Village"
      },
      "pincode": "411001"
    }
  }
}
```

**Important:** Save the `token` from the response!

---

## 4. Change Password API (Protected Route)

**Method:** PUT  
**URL:** `http://localhost:5000/api/auth/change-password`  
**Content-Type:** `application/json`  
**Authorization:** Required (Bearer Token)

### Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

### Request Body:
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

### Using cURL:
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"oldPassword\":\"password123\",\"newPassword\":\"newpassword456\"}"
```

### Using PowerShell:
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    oldPassword = "password123"
    newPassword = "newpassword456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/change-password" -Method PUT -Body $body -Headers $headers
```

### Expected Response (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Testing with Postman

1. **Create a new collection** named "FarmSetu Auth"

2. **Register User:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body: raw JSON (use the register request body above)
   - Click "Send"
   - Copy the token from response to a variable or save it

3. **Login:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body: raw JSON (use the login request body above)
   - Click "Send"
   - Copy the token

4. **Change Password:**
   - Method: PUT
   - URL: `http://localhost:5000/api/auth/change-password`
   - Headers: 
     - `Content-Type: application/json`
     - `Authorization: Bearer {{token}}` (use environment variable)
   - Body: raw JSON (use the change password request body above)
   - Click "Send"

---

## Testing with Thunder Client (VS Code/Cursor)

1. **Install Thunder Client** extension if not already installed

2. **Register User:**
   - Click "+ New Request"
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body tab → JSON
   - Paste the register request body
   - Click "Send"
   - Copy the token from response

3. **Login:**
   - Create new request
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body tab → JSON
   - Paste the login request body
   - Click "Send"
   - Copy the token

4. **Change Password:**
   - Create new request
   - Method: PUT
   - URL: `http://localhost:5000/api/auth/change-password`
   - Header tab → Add:
     - Key: `Authorization`
     - Value: `Bearer YOUR_TOKEN_HERE`
   - Body tab → JSON
   - Paste the change password request body
   - Click "Send"

---

## Common Error Responses

### 400 - Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 - Unauthorized (Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 401 - Unauthorized (Missing/Invalid Token)
```json
{
  "success": false,
  "message": "Not authorized to access this route. No token provided."
}
```

### 400 - User Already Exists
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

## Quick Test Script (Node.js)

Create a file `test-api.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAPI() {
  try {
    // 1. Register
    console.log('1. Testing Register...');
    const registerRes = await axios.post(`${BASE_URL}/register`, {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phoneNumber: "9876543210",
      countryCode: "+91",
      address: {
        state: "Maharashtra",
        district: "Pune",
        taluko: "Pune",
        villageName: "Test Village"
      },
      pincode: "411001",
      password: "test123"
    });
    console.log('Register Success:', registerRes.data.message);
    const token = registerRes.data.data.token;

    // 2. Login
    console.log('\n2. Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      phoneNumber: "9876543210",
      password: "test123"
    });
    console.log('Login Success:', loginRes.data.message);

    // 3. Change Password
    console.log('\n3. Testing Change Password...');
    const changePassRes = await axios.put(
      `${BASE_URL}/change-password`,
      {
        oldPassword: "test123",
        newPassword: "newtest123"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('Change Password Success:', changePassRes.data.message);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
```

Run with: `node test-api.js` (requires axios: `npm install axios`)

---

## Tips

1. **Save tokens:** Copy and save JWT tokens from register/login responses
2. **Use environment variables:** In Postman/Thunder Client, save tokens as variables for easy reuse
3. **Test error cases:** Try invalid credentials, missing fields, duplicate emails/phones
4. **Check MongoDB:** Use MongoDB Compass or mongo shell to verify user data is saved correctly
