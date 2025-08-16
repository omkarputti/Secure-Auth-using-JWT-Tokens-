Secure Notes App — JWT Authentication

Live Demo: https://secure-auth-using-jwt-tokens.vercel.app/

A simple yet secure notes application featuring:

User Authentication: Register and login with JWT (JSON Web Tokens) for stateless sessions

CRUD Notes API: Create, view, and delete notes—private to each authenticated user

Easy Deployment: Frontend hosted on Vercel and backend on Render

Features
Capability	Stack / Tool	Description
Authentication	Flask-JWT-Extended	Stateles auth using access_token
API Security	Protected API routes	All /api/notes routes are JWT-secured
Notes CRUD	Flask + SQLAlchemy	Users can manage personal notes stored in SQLite
Database	SQLite (default)	Lightweight and easy—no extra setup needed
CORS	Flask-CORS	Safely allows frontend hosted on Vercel to access backend
Hosting	Vercel + Render	Frontend auto-deploys from GitHub, backend uses gunicorn via Render
Quick Start Guide
1. Clone and Setup
git clone https://github.com/omkarputti/Secure-Auth-using-JWT-Tokens-.git
cd Secure-Auth-using-JWT-Tokens-


Create a .env file (optional for development) in the root:

SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///notes.db


Install dependencies:

pip install -r requirements.txt


Run locally (development mode):

python app.py


Navigate to http://localhost:5000/api/health—you should see:

{ "status": "ok" }

2. Deploy Backend on Render

Go to Render and create a Web Service using your GitHub repo

Configure:

Build Command: pip install -r requirements.txt

Start Command: gunicorn app:app

Leave Root Directory blank (app.py is at the repo root)

Once spinning up, use ...onrender.com/api/health to verify deployment.

3. Deploy Frontend on Vercel

Push your frontend code to GitHub

In Vercel:

Import the repo

Set notes_frontend (or your frontend folder) as the Root Directory

Build Command: npm run build

Output Directory: dist (for Vite, or build if using CRA)

Set environment variables if needed (e.g., VITE_API_URL)

Deploy!

4. Using the App

Visit the frontend live site.

Register a new account.

Log in to receive your JWT—frontend stores it locally.

Create, view, and delete notes. All actions are authenticated.

Modules Listing (for requirements.txt)
Flask
Flask-Cors
Flask-JWT-Extended
Flask-SQLAlchemy
gunicorn
Werkzeug
python-dotenv

CORS & Security Notes

Backend uses Flask-CORS to allow cross-origin requests from your React app on Vercel.

Authentication happens on the backend only—never trust the frontend UI, always validate the JWT on the server.

“You can not secure front-end parts, only API in back-end.” — StackOverflow advice 
Stack Overflow
