# 🏠 Mariya Homes — Full-Stack Real Estate Website

A complete real estate web application built with React.js, Node.js + Express, and MongoDB. The platform lets potential buyers browse property listings, view detailed property pages, explore construction & renovation portfolios, and contact the team — all managed through a secure admin dashboard.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schemas](#database-schemas)
- [Admin Panel](#admin-panel)
- [Analytics System](#analytics-system)
- [Deployment](#deployment)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose 9 |
| Authentication | JWT (jsonwebtoken) |
| Cloud Storage | Cloudinary |
| File Uploads | Multer (memory storage) + Streamifier |
| Email | Resend SDK |
| Password Hashing | bcryptjs |

---

## ✨ Features

### Public Website
- **Home Page** — Animated hero banner, About section, promotional video, Services overview, Testimonials
- **Properties Page** — Filterable grid (location, price, beds, baths, parking) with pagination
- **Property Details Page** — Main media (image/video), gallery, construction progress, amenities, map
- **Construction Page** — Portfolio gallery for construction projects
- **Renovation Page** — Portfolio gallery for renovation projects
- **Contact Page** — Validated contact form with email notification via Resend

### Admin Panel (`/admin`)
- JWT-secured login
- Manage Properties (CRUD + Cloudinary image upload)
- Manage Property Details (media, gallery, progress photos, amenities)
- Manage Gallery (construction & renovation, reorderable)
- Manage Video (homepage promotional video)
- View & Delete Contact Messages
- User Management (superadmin only: create/deactivate/delete admin users)
- Analytics Dashboard (sessions, page visits, geo-map, CSV export)

---

## 📁 Project Structure

```
mariya-homes-website/
├── package.json               ← Root build & start scripts
├── client/                    ← React frontend (CRA)
│   └── src/
│       ├── admin/             ← Admin panel pages & styles
│       │   ├── AdminProperties.jsx
│       │   ├── AdminPropertyDetails.jsx
│       │   ├── AdminGallery.jsx
│       │   ├── AdminVideo.jsx
│       │   ├── AdminContact.jsx
│       │   ├── AnalyticsDashboard.jsx
│       │   ├── UserManagement.jsx
│       │   └── auth/Login.jsx
│       ├── components/        ← Reusable UI components
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── Hero.jsx
│       │   ├── About.jsx
│       │   ├── Services.jsx
│       │   ├── VideoSection.jsx
│       │   ├── Testimonials.jsx
│       │   ├── PropertiesGrid.jsx
│       │   └── PropertyFilter.jsx
│       ├── pages/             ← Route-level pages
│       │   ├── Home.jsx
│       │   ├── Properties.jsx
│       │   ├── PropertyDetails.jsx
│       │   ├── Construction.jsx
│       │   ├── Renovation.jsx
│       │   ├── Contact.jsx
│       │   └── Layout.jsx
│       ├── styles/            ← CSS files
│       └── utils/
│           └── analyticsTracker.js
└── server/                    ← Express backend
    ├── index.js               ← App entry point
    ├── config/
    │   ├── db.js              ← MongoDB connection
    │   └── cloudinary.js      ← Cloudinary SDK config
    ├── models/
    │   ├── Property.js
    │   ├── PropertyDetails.js
    │   ├── Gallery.js
    │   ├── Video.js
    │   ├── Contact.js
    │   ├── User.js
    │   └── Analytics.js
    ├── routes/
    │   ├── propertyRoutes.js
    │   ├── propertyDetailsRoutes.js
    │   ├── galleryRoutes.js
    │   ├── videoRoutes.js
    │   ├── contactRoutes.js
    │   ├── userRoutes.js
    │   └── analyticsRoutes.js
    ├── controllers/           ← Business logic
    ├── middleware/
    │   ├── authMiddleware.js  ← JWT verification
    │   └── videoUpload.js
    └── createSuperAdmin.js    ← Initial superadmin setup script
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Resend account (for email)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mariya-homes-website.git
cd mariya-homes-website
```

### 2. Set up environment variables

Create a `.env` file in the `server/` directory.

### 3. Install dependencies & run in development

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Run server (from /server)
node index.js

# Run client (from /client, in a new terminal)
npm start
```

The React app runs on `http://localhost:3000` and proxies API calls to the Express server on `http://localhost:5000`.

### 4. Create the initial superadmin

```bash
cd server
node createSuperAdmin.js
```

---

## 🔐 Environment Variables

Create `server/.env` with the following:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mariya-homes

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Server
PORT=5000
```

---

## 📡 API Reference

All admin routes require an `Authorization: Bearer <token>` header.  
`staffProtect` = any authenticated admin. `superadmin` = superadmin role only.

### Properties

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/properties` | Public | List all properties |
| GET | `/api/admin/properties/:id` | Public | Get single property |
| POST | `/api/admin/properties` | Admin | Create property (image upload) |
| PUT | `/api/admin/properties/:id` | Admin | Update property |
| DELETE | `/api/admin/properties/:id` | Admin | Delete property |

### Property Details

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/property-details` | Admin | Create / update property details |
| GET | `/api/admin/property-details/:id` | Public | Get details for a property |
| DELETE | `/api/admin/property-details/:id` | Admin | Delete property details |

### Gallery

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/gallery/type/:type` | Public | Get gallery by type |
| GET | `/api/gallery` | Admin | Get all gallery items |
| POST | `/api/gallery` | Admin | Create gallery item |
| PUT | `/api/gallery/:id` | Admin | Update gallery item |
| DELETE | `/api/gallery/:id` | Admin | Delete gallery item |
| POST | `/api/gallery/reorder` | Admin | Reorder items |

### Video

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/video` | Public | Get homepage video URL |
| POST | `/api/admin/video` | Admin | Upload/replace video |
| DELETE | `/api/admin/video` | Admin | Remove video |

### Contact

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Submit contact form |
| GET | `/api/admin/messages` | Admin | List all messages |
| DELETE | `/api/admin/messages/:id` | Admin | Delete message |

### Users / Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | Public | Login, receive JWT |
| GET | `/api/admin/users` | Superadmin | List all admin users |
| POST | `/api/admin/users` | Superadmin | Create admin user |
| PATCH | `/api/admin/users/:username/toggle-status` | Superadmin | Activate/deactivate |
| PATCH | `/api/admin/users/:username/last-login` | Admin | Update last login |
| DELETE | `/api/admin/users/:username` | Superadmin | Delete user |

### Analytics

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/analytics/track-visit` | Public | Record page visit |
| POST | `/api/analytics/update-location` | Public | Update geo data |
| GET | `/api/analytics` | Admin | Full analytics data |
| GET | `/api/analytics/user/:sessionId` | Admin | Session details |
| GET | `/api/analytics/geo-map` | Admin | Geo distribution |
| GET | `/api/analytics/export/visits` | Admin | Export visits CSV |
| GET | `/api/analytics/export/users` | Admin | Export users CSV |

### Media Upload

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Public | Upload image to Cloudinary |

---

## 🗄 Database Schemas

### Property
```js
{
  title:        String (required),
  locationText: String (required),
  price:        String (required),
  image:        String (Cloudinary URL, required),
  category:     'For Sale' | 'Featured' | 'New' | 'Sold',
  features: {
    bed:  Number,
    bath: Number,
    sqft: Number
  },
  description:  String,
  timestamps
}
```

### PropertyDetails
```js
{
  propertyId:           ObjectId → Property,
  description:          String,
  additionalDetails:    String,
  mainMedia:            String (image or video URL),
  gallery:              [String] (max 10),
  propertyImages:       [String],
  mapUrl:               String,
  constructionProgress: [{ image: String, label: String }],
  amenities:            [String],
  timestamps
}
```

### Gallery
```js
{
  type:        'construction' | 'renovation',
  title:       String,
  description: String,
  image:       String (Cloudinary URL),
  order:       Number,
  isActive:    Boolean,
  timestamps,
  index: { type, order }
}
```

### Analytics
```js
{
  username:  String (default: 'Anonymous'),
  sessionId: String (unique),
  visits: [{
    location:  String,
    timeSpent: Number (seconds),
    exitReason: String,
    timestamp: Date
  }],
  ipAddress: String,
  userAgent: String,
  location: { city, region, country, latitude, longitude },
  firstVisit: Date,
  lastVisit:  Date,
  indexes: [username, visits.timestamp, firstVisit]
}
```

### User (Admin)
```js
{
  username:  String (unique, lowercase),
  password:  String (bcrypt hashed),
  role:      'admin' | 'superadmin',
  isActive:  Boolean,
  lastLogin: Date,
  createdBy: String
}
```

---

## 🖥 Admin Panel

Access the admin panel at `/admin/login`.

| Module | What you can do |
|---|---|
| **Properties** | Add, edit, delete property listings. Upload cover images. |
| **Property Details** | Add rich details per property: media, gallery, progress, amenities, map. |
| **Gallery** | Manage construction & renovation photo portfolios. Reorder by drag. |
| **Video** | Upload/replace the homepage promotional video. |
| **Contact Messages** | View and delete incoming contact form submissions. |
| **User Management** | Create/deactivate/delete admin accounts. (Superadmin only.) |
| **Analytics** | View real-time visitor sessions, page analytics, geo-map, export CSV. |

---

## 📊 Analytics System

The `analyticsTracker.js` utility runs client-side and automatically:

1. Generates a unique `sessionId` per browser session
2. Tracks every page navigation with page name and entry time
3. Records time spent on each page when the user navigates away
4. Captures exit reason (navigation vs. close/tab switch)
5. Sends geo-location data (with browser permission) for map visualization

All data is stored in the `Analytics` MongoDB collection and accessible via the Admin Analytics Dashboard.

---

## 🚢 Deployment

### Build for Production

```bash
# From project root
npm run build   # Builds React app + installs server deps

# Start the server (serves both API and static React build)
npm start
```

The Express server:
- Serves all `/api/*` routes via registered routers
- Serves the React `client/build/` as static files
- Catches all remaining routes and serves `index.html` (for React Router)

### Recommended Hosting
- **Server**: Any Node.js host (Railway, Render, AWS EC2, DigitalOcean)
- **Database**: MongoDB Atlas (free tier available)
- **Media**: Cloudinary (free tier: 25 GB storage)
- **Email**: Resend (free tier: 3,000 emails/month)

---

## 📄 License

This project is proprietary software developed for Mariya Homes. All rights reserved.
