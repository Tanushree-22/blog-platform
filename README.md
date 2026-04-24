# ✦ BlogSpace — MERN Blog Platform

A full-stack blog platform built with MongoDB, Express, React, and Node.js.
Features: Auth (JWT), CRUD posts, likes, comments, dark mode, search, pagination.

---

## 📁 Complete Folder Structure

```
blog-platform/                        ← Root folder
├── package.json                      ← Root scripts (run both servers together)
├── .gitignore                        ← Git ignore rules
│
├── server/                           ← Backend (Node + Express)
│   ├── package.json
│   ├── server.js                     ← Entry point
│   ├── .env.example                  ← Copy this → .env and fill in values
│   ├── .gitignore
│   │
│   ├── config/
│   │   └── db.js                     ← MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js                   ← User schema (name, email, password…)
│   │   └── Post.js                   ← Post schema (title, content, tags…)
│   │
│   ├── controllers/
│   │   ├── authController.js         ← register, login, getMe
│   │   ├── postController.js         ← CRUD, like, comment
│   │   └── userController.js         ← profile, update, user posts
│   │
│   ├── routes/
│   │   ├── auth.js                   ← /api/auth/*
│   │   ├── posts.js                  ← /api/posts/*
│   │   └── users.js                  ← /api/users/*
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         ← JWT protect / optionalAuth
│   │   ├── errorMiddleware.js        ← Global error handler
│   │   └── validators.js             ← Input validation rules
│   │
│   ├── utils/
│   │   └── generateToken.js          ← JWT sign / verify helpers
│   │
│   └── uploads/                      ← (auto-created) local file uploads
│       └── .gitkeep
│
└── client/                           ← Frontend (React)
    ├── package.json
    ├── .env.example
    ├── .gitignore
    │
    ├── public/
    │   └── index.html                ← HTML shell
    │
    └── src/
        ├── index.js                  ← ReactDOM entry point
        ├── App.js                    ← Routes + providers
        │
        ├── styles/
        │   └── global.css            ← CSS variables, dark mode, base styles
        │
        ├── context/
        │   ├── AuthContext.js        ← Auth state (user, token, login/logout)
        │   └── ThemeContext.js       ← Dark/light mode toggle
        │
        ├── utils/
        │   └── api.js                ← Axios instance + all API functions
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.js + .css  ← Top navigation
        │   │   └── Footer.js + .css  ← Footer
        │   │
        │   ├── blog/
        │   │   ├── BlogCard.js + .css     ← Post preview card
        │   │   ├── PostForm.js + .css     ← Create/Edit form with preview
        │   │   └── CommentSection.js+.css ← Comments list + add comment
        │   │
        │   └── common/
        │       ├── Loaders.js        ← Spinner, PageLoader, Skeleton
        │       ├── Pagination.js     ← Page navigation
        │       └── Pagination.css
        │
        └── pages/
            ├── Home.js + .css        ← Blog listing, search, filter
            ├── BlogDetail.js + .css  ← Full post view, like, comments
            ├── Login.js              ← Sign in form
            ├── Register.js           ← Create account form
            ├── Auth.css              ← Shared auth page styles
            ├── CreatePost.js         ← Write new post
            ├── EditPost.js           ← Edit existing post
            ├── PostPage.css          ← Shared create/edit styles
            ├── Dashboard.js + .css   ← User's posts table + stats
            ├── Profile.js + .css     ← Public author profile
            └── NotFound.js           ← 404 page
```

---

## 🔧 Prerequisites — Install These First

Before anything, make sure you have these installed on your computer:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org (choose LTS) |
| npm | comes with Node | — |
| Git | latest | https://git-scm.com |
| VS Code | latest | https://code.visualstudio.com |

**Check if installed** — open Terminal (Mac/Linux) or Command Prompt (Windows) and run:
```bash
node --version    # should show v18.x.x or higher
npm --version     # should show 9.x.x or higher
git --version     # should show git version 2.x.x
```

---

## 🗄️ Step 1 — Set Up MongoDB Atlas (Free Cloud Database)

1. Go to **https://www.mongodb.com/cloud/atlas** and click **"Try Free"**
2. Create a free account (use Google or email)
3. Choose **"Create a FREE cluster"** (M0 Sandbox — always free)
4. Pick any cloud provider and region close to you → click **"Create Cluster"** (takes ~2 min)

**After cluster is created:**

5. In left sidebar click **"Database Access"** → **"Add New Database User"**
   - Username: `bloguser`
   - Password: click **"Autogenerate Secure Password"** → **copy the password** somewhere safe
   - Role: `Read and write to any database`
   - Click **"Add User"**

6. In left sidebar click **"Network Access"** → **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - Click **"Confirm"**

7. Go to **"Database"** in left sidebar → click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Driver: Node.js, Version: 5.5 or later
   - **Copy the connection string** — it looks like:
     ```
     mongodb+srv://bloguser:<password>@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you copied in step 5
   - Add the database name before `?`:
     ```
     mongodb+srv://bloguser:yourpassword@cluster0.abc12.mongodb.net/blog-platform?retryWrites=true&w=majority
     ```

---

## 💻 Step 2 — Get the Project Files

**Option A — If you downloaded the ZIP:**
```bash
# Extract the ZIP, then open terminal inside the blog-platform folder
cd path/to/blog-platform
```

**Option B — If you're cloning from GitHub (after you push it):**
```bash
git clone https://github.com/YOUR_USERNAME/blog-platform.git
cd blog-platform
```

---

## ⚙️ Step 3 — Configure Environment Variables

### Server `.env` file

```bash
# Navigate to server folder
cd server

# Copy the example file
cp .env.example .env
```

Now open `server/.env` in VS Code and fill in the values:

```env
PORT=5000
NODE_ENV=development

# Paste your MongoDB Atlas connection string here
MONGO_URI=mongodb+srv://bloguser:yourpassword@cluster0.abc12.mongodb.net/blog-platform?retryWrites=true&w=majority

# Make up a long random secret (at least 32 characters)
JWT_SECRET=mySuper$ecretKey2024BlogPlatformChangeThisNow!

JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Client `.env` file

```bash
# Navigate to client folder (from root)
cd ../client

# Copy the example file
cp .env.example .env
```

`client/.env` should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📦 Step 4 — Install Dependencies

Go back to the root folder and install everything:

```bash
# From the blog-platform root folder:
cd ..   # if you're inside client/

# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Go back to root
cd ..
```

**You should see no errors.** If you see warnings, that's usually fine.

---

## 🚀 Step 5 — Run the Project Locally

From the **root** `blog-platform/` folder:

```bash
npm run dev
```

This starts **both** servers at the same time:
- 🟢 **Backend** running at: `http://localhost:5000`
- 🔵 **Frontend** running at: `http://localhost:3000`

Your browser should automatically open `http://localhost:3000`.

**To run them separately** (if `npm run dev` has issues):

```bash
# Terminal 1 — start backend
cd server
npm run dev

# Terminal 2 — start frontend
cd client
npm start
```

---

## ✅ Step 6 — Verify Everything Works

1. Open **http://localhost:3000** — you should see the BlogSpace homepage
2. Click **"Get Started"** → register a new account
3. After login, click **"Write"** in the navbar → create a test post
4. Go back to Home → your post should appear!

**Test the API directly:**
- Open **http://localhost:5000/api/health** → should show `{"status":"ok","message":"Blog Platform API is running 🚀"}`

---

## 🐛 Common Errors & Fixes

### ❌ `MongoServerError: bad auth` or connection refused
- Your MongoDB URI is wrong. Double-check username, password (no special chars without URL-encoding), and cluster URL.
- Make sure Network Access allows `0.0.0.0/0` in Atlas.

### ❌ `Error: Cannot find module 'xyz'`
- Run `npm install` again inside that folder (`server/` or `client/`).

### ❌ `Port 5000 already in use`
- Change `PORT=5001` in `server/.env` and update `client/.env` to `REACT_APP_API_URL=http://localhost:5001/api`

### ❌ `CORS error` in browser console
- Make sure `CLIENT_URL=http://localhost:3000` is in `server/.env`
- Restart the backend server after changing `.env`

### ❌ React shows blank white screen
- Open browser DevTools (F12) → Console tab → read the error
- Most common: missing `.env` in `client/` or a missing import

### ❌ `slugify is not a function`
- Run `cd server && npm install slugify` 

---

## 📤 Step 7 — Push to GitHub

### 7a — Create a GitHub account
Go to **https://github.com** and sign up (free).

### 7b — Create a new repository
1. Click the **"+"** icon → **"New repository"**
2. Repository name: `blog-platform`
3. Description: `Full-stack MERN Blog Platform`
4. Keep it **Public** (or Private)
5. **Do NOT check** "Initialize with README" (we already have one)
6. Click **"Create repository"**

### 7c — Initialize Git and push

Open terminal in your `blog-platform/` root folder:

```bash
# Step 1: Initialize git (only once)
git init

# Step 2: Stage all files
git add .

# Step 3: Make your first commit
git commit -m "🚀 Initial commit: MERN Blog Platform"

# Step 4: Connect to your GitHub repo
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/blog-platform.git

# Step 5: Push to GitHub
git branch -M main
git push -u origin main
```

5. Refresh your GitHub page — all files should be uploaded! ✅

### 7d — Future updates

Every time you make changes:
```bash
git add .
git commit -m "your message describing what changed"
git push
```

---

## 🌐 Step 8 — Deploy Online (Optional)

### Deploy Backend → Render.com (Free)

1. Go to **https://render.com** → Sign up with GitHub
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo → select `blog-platform`
4. Configure:
   - **Name**: `blog-platform-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click **"Advanced"** → **"Add Environment Variable"** — add all your `.env` values:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = your secret
   - `JWT_EXPIRE` = 7d
   - `NODE_ENV` = production
   - `CLIENT_URL` = your Vercel frontend URL (fill in after deploying frontend)
6. Click **"Create Web Service"** — wait ~3 minutes for it to deploy
7. Copy your Render URL: `https://blog-platform-api.onrender.com`

### Deploy Frontend → Vercel (Free)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your `blog-platform` GitHub repo
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
5. Click **"Environment Variables"** → add:
   - `REACT_APP_API_URL` = `https://blog-platform-api.onrender.com/api`
6. Click **"Deploy"** — done in ~2 minutes!
7. Copy your Vercel URL (e.g. `https://blog-platform.vercel.app`)
8. Go back to Render → update `CLIENT_URL` env var to your Vercel URL → redeploy

---

## 🔑 API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/posts` | ❌ | List posts (search, filter, paginate) |
| GET | `/api/posts/:slug` | ❌ | Get single post |
| POST | `/api/posts` | ✅ | Create new post |
| PUT | `/api/posts/:id` | ✅ | Update post (author only) |
| DELETE | `/api/posts/:id` | ✅ | Delete post (author only) |
| POST | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/comments` | ✅ | Add comment |
| DELETE | `/api/posts/:id/comments/:cId` | ✅ | Delete comment |
| GET | `/api/posts/tags/popular` | ❌ | Popular tags |
| GET | `/api/users/:id` | ❌ | Public user profile |
| GET | `/api/users/:id/posts` | ❌ | User's posts |
| PUT | `/api/users/profile` | ✅ | Update profile |
| PUT | `/api/users/password` | ✅ | Change password |

---

## 🧰 VS Code Extensions (Recommended)

Install these in VS Code for best experience:

- **ES7+ React/Redux/React-Native snippets** — React code shortcuts
- **Prettier - Code formatter** — auto-format code
- **ESLint** — catch code errors
- **Thunder Client** — test your API routes inside VS Code
- **GitLens** — better Git integration
- **Auto Rename Tag** — rename HTML/JSX tags easily

---

## 📋 Quick Reference — npm Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` (root) | Start both frontend + backend |
| `npm run server` (root) | Start only backend |
| `npm run client` (root) | Start only frontend |
| `npm install:all` (root) | Install all dependencies |
| `npm run build` (root) | Build React for production |
| `npm run dev` (in server/) | Start backend with auto-reload |
| `npm start` (in server/) | Start backend (production) |
| `npm start` (in client/) | Start React dev server |
| `npm run build` (in client/) | Build React for deployment |

---

## 💡 Tips for Beginners

1. **Always restart the server** after changing `server/.env`
2. **Never commit `.env` files** — they contain secrets (`.gitignore` handles this)
3. **Read error messages carefully** — they usually tell you exactly what's wrong
4. The **browser DevTools Console** (F12) is your best friend for frontend errors
5. Use **Thunder Client** or **Postman** to test API routes before connecting frontend
6. If stuck, check the error against the "Common Errors" section above

---

Built with ❤️ using the MERN Stack
