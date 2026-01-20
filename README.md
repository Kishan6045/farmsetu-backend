# FarmSetu Backend - Marketplace API

A complete marketplace backend built with Node.js, Express, and MongoDB for buying and selling items.

## Features

### Authentication
- User Registration with complete profile information
- User Login with JWT token authentication
- Password change functionality (protected route)
- Secure password hashing using bcrypt
- JWT-based authentication middleware

### Listings (Buy & Sell)
- Create listings with title, description, price
- Upload up to 3 images and 1 video
- Address-based listing (village, taluko, district, state)
- District-based visibility control
- Duplicate prevention (same user, same title)
- Status management (active/inactive)
- Get all active listings with district filtering

## Project Structure

```
FarmSetu/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── authController.js    # Authentication logic (register, login, changePassword)
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # User schema/model
├── routes/
│   └── authRoutes.js        # Authentication routes
├── server.js                # Main server file
├── .env.example             # Environment variables template
└── package.json             # Dependencies and scripts
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd FarmSetu
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Create environment file**
   - Create a `.env` file in the root directory
   - Add the following environment variables:
     ```env
     PORT=5000
     MONGODB_URI=mongodb+srv://username:password@cluster0.rorsju8.mongodb.net/?retryWrites=true&w=majority
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRE=30d
     ```
   
   **⚠️ IMPORTANT - Database Connection:**
   - Make sure your `MONGODB_URI` points to YOUR MongoDB cluster
   - The database name is automatically set to `farmsetu` in the code
   - When the server starts, it will log which cluster and database it's connected to
   - If you see a warning about wrong database, check your `MONGODB_URI` immediately

4. **Start MongoDB** (if using local MongoDB)
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`

## Running the Server

### Development Mode
```bash
npm start
```
or
```bash
node server.js
```

The server will start on port 5000 (or the port specified in your `.env` file).

You should see:
```
🔌 Connecting to MongoDB...
📍 Cluster: cluster0.rorsju8.mongodb.net
📦 Target Database: farmsetu
✅ MongoDB Connected Successfully!
📊 Connected Database: farmsetu
🌐 Connected Host: cluster0-shard-00-00.xxxxx.mongodb.net
✅ Database name verified: farmsetu
Server is running on port 5000
```

## API Endpoints

### Base URL
```
http://localhost:5000 (or port from .env)
```

### Authentication Endpoints

#### Base: `/api/auth`

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
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
      "villageName": "Village Name"
    },
    "pincode": "411001",
    "password": "password123"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890",
        "countryCode": "+91",
        "address": { ... },
        "pincode": "411001"
      }
    }
  }
  ```

### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "phoneNumber": "1234567890",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890",
        "countryCode": "+91",
        "address": { ... },
        "pincode": "411001"
      }
    }
  }
  ```

### 3. Change Password
- **Endpoint:** `PUT /api/auth/change-password`
- **Access:** Private (Requires JWT Token)
- **Headers:**
  ```
  Authorization: Bearer <jwt-token>
  ```
- **Request Body:**
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

### Health Check
- **Endpoint:** `GET /health`
- **Access:** Public
- **Response:**
  ```json
  {
    "success": true,
    "message": "Server is running"
  }
  ```

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token is returned upon successful registration or login.

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Passwords are hashed using bcrypt before storing in database
- JWT tokens for secure authentication
- Password field is excluded from default queries
- Input validation and sanitization

### Listing Endpoints

#### Base: `/api/listings`

#### 1. Create Listing
- **Endpoint:** `POST /api/listings`
- **Access:** Private (Requires JWT Token)
- **Content-Type:** `multipart/form-data`
- **Headers:**
  ```
  Authorization: Bearer <jwt-token>
  ```
- **Body (form-data):**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | Text | Yes | Listing title |
  | `description` | Text | Yes | Listing description |
  | `expectedPrice` | Text | Yes | Expected price (number) |
  | `village` | Text | Yes | Village name |
  | `taluko` | Text | Yes | Taluko name |
  | `district` | Text | Yes | District name |
  | `state` | Text | Yes | State name |
  | `showOnlyInMyDistrict` | Text | No | "true" or "false" (default: false) |
  | `images` | File | No | Image file (max 3) |
  | `video` | File | No | Video file (max 1) |

- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Listing created successfully",
    "data": {
      "_id": "...",
      "user": "...",
      "title": "Used Tractor",
      "description": "Well maintained",
      "expectedPrice": 250000,
      "images": ["/uploads/images/..."],
      "video": "/uploads/videos/...",
      "address": {
        "village": "Rampur",
        "taluko": "Mandvi",
        "district": "Surat",
        "state": "Gujarat"
      },
      "showOnlyInMyDistrict": true,
      "status": "active",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

- **Error Response (400 - Duplicate):**
  ```json
  {
    "success": false,
    "message": "You have already created a listing with this title. Please use a different title or update your existing listing.",
    "existingListingId": "..."
  }
  ```

#### 2. Get Listings
- **Endpoint:** `GET /api/listings`
- **Access:** Private (Requires JWT Token)
- **Headers:**
  ```
  Authorization: Bearer <jwt-token>
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "user": {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe"
        },
        "title": "Used Tractor",
        "description": "...",
        "expectedPrice": 250000,
        "images": ["/uploads/images/..."],
        "video": "/uploads/videos/...",
        "address": {...},
        "showOnlyInMyDistrict": true,
        "status": "active",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
  ```
- **Note:** Only returns `active` listings. Respects `showOnlyInMyDistrict` flag.

## Testing with Postman

### Step 1: Get Authentication Token

**POST** `http://localhost:5000/api/auth/login`
```json
{
  "phoneNumber": "9876543210",
  "password": "password123"
}
```
Copy the `token` from `data.token`

### Step 2: Create Listing in Postman

1. **Method:** `POST`
2. **URL:** `http://localhost:5000/api/listings`
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - **DO NOT** set `Content-Type` manually
4. **Body Tab:**
   - Select **`form-data`** (NOT raw JSON)
   - Add fields:

| Key | Type | Value |
|-----|------|-------|
| `title` | **Text** | `Used Tractor` |
| `description` | **Text** | `Well maintained` |
| `expectedPrice` | **Text** | `250000` |
| `village` | **Text** | `Rampur` |
| `taluko` | **Text** | `Mandvi` |
| `district` | **Text** | `Surat` |
| `state` | **Text** | `Gujarat` |
| `showOnlyInMyDistrict` | **Text** | `true` |
| `images` | **File** | Select image (up to 3) |
| `video` | **File** | Select video (1 max) |

**Important:**
- Text fields must be "Text" type (not "File")
- Only `images` and `video` should be "File" type
- Field names must be exact (case-sensitive, no trailing spaces)

### Step 3: Get Listings

**GET** `http://localhost:5000/api/listings`
- Headers: `Authorization: Bearer YOUR_TOKEN`

## Common Issues & Solutions

### Issue: "Unexpected file field" Error
**Problem:** A text field is set to "File" type in Postman

**Solution:**
1. Open Postman → Body → form-data
2. Check each text field (`title`, `description`, etc.)
3. Change dropdown from "File" to "Text"
4. Only `images` and `video` should be "File" type

### Issue: Duplicate Listing
**Problem:** Same user trying to create listing with same title

**Solution:**
- Use a different title
- Or update existing listing (if update API exists)

### Issue: Field Name Has Tab/Space
**Problem:** Field name has trailing whitespace (e.g., `images\t`)

**Solution:**
1. Delete the field in Postman
2. Re-type the field name exactly (no spaces/tabs)
3. Make sure it's exactly `images` or `video` (case-sensitive)

### Issue: Files Not Uploading
**Solution:**
- Check file size is under 20MB
- Verify file types (images for `images`, videos for `video`)
- Ensure field type is "File" in Postman

## Troubleshooting

- **MongoDB Connection Error:** Ensure MongoDB is running and the `MONGODB_URI` in `.env` is correct
- **Data going to wrong database:** 
  - Check the console logs when server starts - it shows which cluster and database you're connected to
  - Verify your `MONGODB_URI` points to YOUR cluster (not someone else's)
  - The database name is hardcoded to `farmsetu` - if you see a different database name in logs, your URI is wrong
- **Port Already in Use:** Change the `PORT` in `.env` file (Note: Port change does NOT affect database connection)
- **JWT Secret Error:** Make sure `JWT_SECRET` is set in `.env` file
- **Duplicate Email/Phone:** Each user must have a unique email and phone number

## Project Structure

```
FarmSetu/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── listingController.js # Listing logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── upload.js            # File upload middleware (multer)
│   └── logger.js            # Request logging
├── models/
│   ├── User.js              # User schema/model
│   └── Listing.js           # Listing schema/model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── listingRoutes.js     # Listing routes
├── uploads/                 # Uploaded files (auto-created)
│   ├── images/              # Image uploads
│   └── videos/              # Video uploads
├── server.js                # Main server file
├── .env                     # Environment variables
└── package.json             # Dependencies and scripts
```

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB object modeling
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling

## License

ISC
