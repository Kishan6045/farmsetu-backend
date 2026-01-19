# Terminal Commands - Copy Paste Karo

## Step 1: Server Start Karne Ke Liye

Terminal me yeh likho:
```
npm start
```

---

## Step 2: Login Test Karne Ke Liye (Nayi Terminal Me)

Pehle wali terminal ko chod do (server running rahegi), nayi terminal kholo aur yeh likho:

### Option 1: Simple Test (Ek Line Me)
```
$body = @{ phoneNumber = "1234567890"; password = "password123" } | ConvertTo-Json; Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Option 2: Step By Step (Easy To Understand)

Pehle yeh:
```
$body = @{
    phoneNumber = "1234567890"
    password = "password123"
} | ConvertTo-Json
```

Phir yeh:
```
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## Step 3: Pehle User Register Karna Hai (Agar Nahi Hai)

Agar pehle user register nahi kiya, to pehle yeh run karo:

```
$registerBody = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
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

---

## Console Me Kya Dikhna Chahiye

Server wali terminal me yeh sab dikhna chahiye:
- 📥 INCOMING REQUEST
- 🔐 Login attempt
- ✅ User found
- ✅ Password verified
- 🎫 JWT token generated
- 📤 RESPONSE STATUS
