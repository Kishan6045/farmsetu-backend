# Mobile App Se Sab Requests Console Me Dikhengi

## ✅ Setup Complete!

Ab aapki mobile app (APK) se jo bhi request aayegi, wo aapke server console me show hogi.

---

## 📋 Kya-Kya Log Hoga:

1. **Login Request** - Phone number, password (hidden)
2. **Register Request** - Saari details
3. **Change Password** - Old/New password (hidden)
4. **Koi bhi API call** - Har request log hogi
5. **404 Errors** - Agar galat URL hit ho to

---

## 🚀 Server Start Karein:

```powershell
npm start
```

Aapko yeh dikhna chahiye:
```
======================================================================
🚀 Server is running on port 5000
📍 Local: http://localhost:5000
📍 Network: http://0.0.0.0:5000
📝 Request logging: ENABLED
======================================================================
```

---

## 📱 Mobile App Se Request Karne Par Console Me Kya Dikhega:

### Example: Login Request

```
======================================================================
📥 INCOMING REQUEST - 15/1/2024, 4:30:45 PM
Method: POST
URL: /api/auth/login
IP: 192.168.1.5
User-Agent: okhttp/4.9.0
Body: {
  "phoneNumber": "1234567890",
  "password": "***HIDDEN***"
}
==============================================================
🔐 Login attempt for phone: 1234567890
✅ User found: John Doe (john@example.com)
✅ Password verified successfully for user: john@example.com
🎫 JWT token generated for user: 65a1b2c3d4e5f6g7h8i9j0k1
📤 RESPONSE STATUS: 200
✅ Success Response
🎫 Token generated: eyJhbGciOiJIUzI1NiIsInR5cCI6...
======================================================================
```

### Example: Register Request

```
======================================================================
📥 INCOMING REQUEST - 15/1/2024, 4:31:20 PM
Method: POST
URL: /api/auth/register
IP: 192.168.1.5
User-Agent: okhttp/4.9.0
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "countryCode": "+91",
  "address": {
    "state": "Maharashtra",
    "district": "Pune",
    "taluko": "Pune",
    "villageName": "Test Village"
  },
  "pincode": "411001",
  "password": "***HIDDEN***"
}
==============================================================
🔍 Checking if user exists with email: john@example.com
✅ User created successfully! ID: 65a1b2c3d4e5f6g7h8i9j0k1
🎫 JWT token generated for user: 65a1b2c3d4e5f6g7h8i9j0k1
📤 RESPONSE STATUS: 201
✅ Success Response
======================================================================
```

### Example: Wrong URL (404)

```
======================================================================
📥 INCOMING REQUEST - 15/1/2024, 4:32:10 PM
Method: GET
URL: /api/wrong-endpoint
IP: 192.168.1.5
User-Agent: okhttp/4.9.0
==============================================================
❌ 404 - Route not found: GET /api/wrong-endpoint
📤 RESPONSE STATUS: 404
❌ Error Response: {
  "success": false,
  "message": "Route not found",
  "path": "/api/wrong-endpoint",
  "method": "GET"
}
======================================================================
```

---

## ✅ Test Karne Ke Liye:

### Step 1: Server Start Karein
```powershell
npm start
```

### Step 2: Mobile App Se Login/Register Karein

Mobile app me koi bhi action karein:
- Login
- Register
- Change Password
- Koi bhi API call

### Step 3: Console Check Karein

Server wali terminal me **sab kuch dikhna chahiye**:
- Request details
- IP address
- Request body
- Response status
- Errors (agar hui to)

---

## 🔍 Agar Logs Nahi Dikhe To:

### 1. Server Restart Karein
```powershell
# Ctrl+C se band karein
npm start  # Phir se start
```

### 2. Mobile App Ka URL Check Karein

Mobile app me sahi URL hona chahiye:
```
http://YOUR_COMPUTER_IP:5000/api/auth/login
```

Computer ka IP check karein:
```powershell
ipconfig
```

### 3. Same WiFi Network

Computer aur mobile **same WiFi** par hone chahiye!

### 4. Firewall Check

Port 5000 allow hona chahiye. Admin PowerShell me:
```powershell
New-NetFirewallRule -DisplayName "Node Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### 5. Test Endpoint Try Karein

Browser me kholen:
```
http://localhost:5000/test
```

Agar yeh logs dikhe, matlab logger kaam kar raha hai!

---

## 📊 Kya Log Hoga:

✅ **Sab Log Hogi:**
- Login requests
- Register requests  
- Change password requests
- Koi bhi API endpoint
- 404 errors
- IP addresses
- Request timing
- Response status

🔒 **Security:**
- Passwords `***HIDDEN***` dikhengi
- Tokens partially hidden (first 20 chars)

---

## 🎯 Summary:

1. ✅ Logger middleware setup ho gaya hai
2. ✅ Har request automatically log hogi
3. ✅ Mobile app se jo bhi request aayegi, console me dikhegi
4. ✅ Server terminal me sab kuch visible hoga

**Bas server start karein aur mobile app se requests karein - sab kuch console me dikhega!** 🎉
