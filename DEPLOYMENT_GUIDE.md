# Startup OS - Production Deployment Guide

## 🚀 Recommended Setup: Vercel + Railway

This is the **easiest and fastest** way to deploy with generous free tiers.

---

## Step-by-Step Deployment

### 1️⃣ Deploy Backend to Railway

**Railway** will host your Node.js backend API.

#### A. Sign Up & Create Project
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository (or create a new repo just for the backend)

#### B. Configure Backend
1. Select the `backend` folder as the root directory
2. Railway will auto-detect Node.js

#### C. Add Environment Variables
In Railway dashboard → Variables tab, add:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_E4riS7oaMvfw@ep-bold-dream-ahysdvvv-pooler.c-3.us-east-1.aws.neon.tech/StartUp_OS?sslmode=require

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_aGFwcHkta2FuZ2Fyb28tNjUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_as9zcOmw91JPrGA9shg6BX9yhUtAjASVIfy3cA0EFT

# Server
PORT=3001
NODE_ENV=production

# CORS (Update after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app

# SendGrid Email
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@startupos.dev
SENDGRID_FROM_NAME=Startup OS
```

#### D. Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. **Copy your backend URL** (e.g., `https://startup-os-production.up.railway.app`)

---

### 2️⃣ Deploy Frontend to Vercel

**Vercel** will host your React/Vite frontend.

#### A. Sign Up & Import Project
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository

#### B. Configure Build Settings
Vercel will auto-detect Vite. Verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### C. Add Environment Variables
In Vercel → Project Settings → Environment Variables:

```bash
# Clerk (Production keys - get from Clerk dashboard)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE

# Backend API URL (from Railway)
VITE_API_URL=https://startup-os-production.up.railway.app
```

#### D. Deploy
1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Your app is live at `https://your-app.vercel.app`

---

### 3️⃣ Update Backend CORS

Go back to Railway and update the `FRONTEND_URL` variable:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy the backend for changes to take effect.

---

### 4️⃣ Update Clerk Settings

In your Clerk Dashboard (https://dashboard.clerk.com):

1. Go to **API Keys** → Switch to **Production**
2. Copy the **Publishable Key** and **Secret Key**
3. Update both Railway (backend) and Vercel (frontend) with **production keys**

4. Go to **Domains** → Add your production URLs:
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://startup-os-production.up.railway.app`

5. Go to **Redirects** → Configure:
   - After sign in: `https://your-app.vercel.app/home`
   - After sign up: `https://your-app.vercel.app/home`

---

## ✅ Post-Deployment Checklist

- [ ] Backend is running on Railway
- [ ] Frontend is running on Vercel
- [ ] CORS is configured correctly
- [ ] Clerk production keys are set
- [ ] Clerk redirect URLs are updated
- [ ] Database is accessible from Railway
- [ ] SendGrid emails are working
- [ ] Test user registration flow
- [ ] Test invitation emails
- [ ] Test organization creation
- [ ] Test all major features

---

## 🌐 Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate is auto-generated

### For Railway (Backend)
1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records
4. Update `FRONTEND_URL` in Vercel to use your custom domain

---

## 💰 Cost Breakdown

### Free Tier (Great for MVP)
- **Vercel**: 100GB bandwidth, unlimited projects
- **Railway**: $5 credit/month (enough for small apps)
- **Neon DB**: 10GB storage, 1 project
- **SendGrid**: 100 emails/day
- **Total**: ~$0-5/month

### Paid Tier (Production-ready)
- **Vercel Pro**: $20/month (team features)
- **Railway**: ~$10-20/month (based on usage)
- **Neon Pro**: $19/month (better performance)
- **SendGrid**: $15/month (40k emails)
- **Total**: ~$50-70/month

---

## 🔧 Alternative Deployment Options

### Option 2: Render (All-in-One)
- Deploy both frontend and backend on Render
- Simpler but less flexible
- Free tier: 750 hours/month
- https://render.com

### Option 3: Netlify + Railway
- Similar to Vercel + Railway
- Netlify has great form handling
- https://netlify.com

### Option 4: AWS (Advanced)
- S3 + CloudFront (frontend)
- Elastic Beanstalk (backend)
- RDS (database)
- Most control, more complex
- Higher costs (~$30-100/month)

### Option 5: DigitalOcean App Platform
- $5-12/month for both services
- Good balance of simplicity and control
- https://digitalocean.com

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check Railway logs for blocked requests
- Verify Clerk redirect URLs include your production domain

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Database Connection Issues
- Confirm `DATABASE_URL` is correct in Railway
- Check Neon dashboard for connection limits
- Verify SSL mode is enabled

### Email Not Sending
- Check SendGrid API key is valid
- Verify sender email is verified in SendGrid
- Check Railway logs for email errors

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Enable in Project Settings → Analytics
- Track page views, performance, and errors

### Railway Logs
- View real-time logs in Railway dashboard
- Set up alerts for errors

### Sentry (Optional)
- Add error tracking: https://sentry.io
- Free tier: 5k errors/month

---

## 🔐 Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] HTTPS is enabled (automatic with Vercel/Railway)
- [ ] CORS is restricted to your frontend domain
- [ ] Database has SSL enabled
- [ ] Clerk is using production keys
- [ ] SendGrid API key has minimal permissions
- [ ] `.env` files are in `.gitignore`

---

## 🚀 Quick Deploy Commands

If you prefer CLI deployment:

### Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Railway CLI
```bash
npm i -g @railway/cli
railway login
railway up
```

---

## 📝 Environment Variable Template

Save this as `.env.production`:

```bash
# Backend (Railway)
DATABASE_URL=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PORT=3001
NODE_ENV=production
FRONTEND_URL=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=

# Frontend (Vercel)
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

---

## 🎉 You're Live!

Once deployed, your app will be accessible at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.railway.app`

Share the link, invite your team, and start building! 🚀

---

**Questions?** Check the Railway/Vercel documentation or create an issue in your repository.
