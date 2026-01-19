# Debug Guide - Mobile App Se Login Karne Par Logs Nahi Dikhe

## Problem: Mobile App Se Login Kiya Lekin Terminal Me Logs Nahi Aaye

### Step 1: Server Running Hai Ya Nahi Check Karein

Terminal me yeh dikhna chahiye:
```
======================================================================
🚀 Server is running on port 5000
📍 Local: http://localhost:5000
📍 Network: http://0.0.0.0:5000
📝 Request logging: ENABLED
======================================================================
```

Agar yeh nahi dikh raha, to server start karein:
```powershell
npm start
```

---

### Step 2: Mobile App Ka URL Check Karein

**Important:** Mobile app jo URL hit kar rahi hai, wo sahi hona chahiye:

✅ **Correct URLs:**
- `http://YOUR_COMPUTER_IP:5000/api/auth/login`
- `http://localhost:5000/api/auth/login` (agar emulator me ho)
- `http://10.0.2.2:5000/api/auth/login` (Android emulator ke liye)

❌ **Wrong URLs:**
- `http://localhost:5000/login` (galat endpoint)
- `http://192.168.1.1/api/auth/login` (galat IP)

**Kaise Check Karein:**
1. Mobile app me login API call karein
2. Server terminal me kuch bhi nahi aaya?
3. Matlab request server tak nahi pahunchi

---

### Step 3: Computer Ka IP Address Check Karein

Mobile app ko computer ka IP chahiye. IP kaise nikalein:

**Windows PowerShell me:**
```powershell
ipconfig
```

Dekho "IPv4 Address" - example: `192.168.1.10`

**Phir mobile app me URL:**
```
http://192.168.1.10:5000/api/auth/login
```

**Important:** Computer aur mobile dono SAME WiFi network par hone chahiye!

---

### Step 4: Test Karein - Health Check

Mobile browser me ya Postman se test karein:

**Computer ka IP address use karke:**
```
http://YOUR_IP:5000/health
```

Ya test endpoint:
```
http://YOUR_IP:5000/test
```

Agar terminal me logs aaye, matlab connection sahi hai!

---

### Step 5: Firewall Check Karein

Windows Firewall port 5000 ko block kar sakta hai.

**Firewall Allow Karne Ke Liye:**

1. Windows Search me "Firewall" type karein
2. "Windows Defender Firewall" kholen
3. "Advanced settings" click karein
4. "Inbound Rules" me jayein
5. "New Rule" click karein
6. "Port" select karein
7. "TCP" select karein
8. "Specific local ports" me `5000` likhen
9. "Allow the connection" select karein
10. Finish karein

Ya simple command (Admin PowerShell me):
```powershell
New-NetFirewallRule -DisplayName "Node Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

### Step 6: Logger Test Karein

Server start karke, browser me yeh kholen:
```
http://localhost:5000/test
```

Terminal me yeh dikhna chahiye:
```
==============================================================
📥 INCOMING REQUEST - [timestamp]
Method: GET
URL: /test
IP: ::1
...
🧪 Test endpoint called
📤 RESPONSE STATUS: 200
✅ Success Response
==============================================================
```

Agar yeh nahi dikha, to logger ka issue hai.

---

### Step 7: Mobile App Me Network Error Check Karein

Mobile app me login karne par:
- ✅ Success response aaya? → Server kaam kar raha hai, bas logs nahi dikh rahe
- ❌ Network error? → Connection issue hai
- ❌ Timeout? → Server tak request nahi pahunch rahi

---

### Step 8: Server Restart Karein

Kabhi-kabhi restart se kaam ho jata hai:

1. Server band karein (Ctrl+C)
2. Phir start karein:
```powershell
npm start
```

---

### Step 9: Console Me Ek Simple Test

Terminal me yeh command run karein (server running rakh ke):
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/test" -Method GET
```

Agar terminal me logs aaye, matlab logger sahi kaam kar raha hai.

---

## Common Issues Aur Solutions

### Issue 1: Server Running Hai Lekin Logs Nahi Aa Raha

**Solution:** 
- Logger middleware check karein `server.js` me line 22 pe `app.use(logger);` hona chahiye
- Server restart karein

### Issue 2: Mobile Se Request Nahi Pahunch Rahi

**Solution:**
- Computer aur mobile same WiFi par hain?
- Computer ka IP sahi hai?
- Firewall port 5000 ko allow kar raha hai?

### Issue 3: Android Emulator Se Request Nahi Pahunch Rahi

**Solution:**
- Emulator ke liye `http://10.0.2.2:5000` use karein (localhost ki jagah)
- Ya phir `http://YOUR_COMPUTER_IP:5000` use karein

### Issue 4: Real Device Se Request Nahi Pahunch Rahi

**Solution:**
- Computer ka IP check karein (`ipconfig`)
- Mobile aur computer same WiFi par hain?
- Firewall me port allow karein

---

## Quick Debug Checklist

- [ ] Server running hai? (`npm start`)
- [ ] Terminal me "Request logging: ENABLED" dikha?
- [ ] Mobile app sahi URL hit kar rahi hai?
- [ ] Computer ka IP sahi hai?
- [ ] Computer aur mobile same WiFi par hain?
- [ ] Firewall port 5000 allow kar raha hai?
- [ ] Browser me `http://localhost:5000/test` se logs aaye?

---

## Agar Phir Bhi Nahi Ho To:

1. Server console screenshot share karein
2. Mobile app ka network request screenshot share karein
3. Mobile app me jo URL use ho rahi hai wo share karein

Yeh sab check karein aur batayein kya issue hai!
