# Vercel + Neon Deployment Guide

## Step 1: Set up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Copy your connection string from "Connection Details"

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your project:
```bash
vercel
```

4. Add environment variables:
```bash
vercel env add DATABASE_URL
# Paste your Neon connection string when prompted

vercel env add JWT_SECRET
# Enter a secure random string (e.g., use a password generator)

vercel env add NODE_ENV
# Enter: production
```

5. Redeploy with environment variables:
```bash
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables in project settings:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
5. Deploy!

## Step 3: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Create a new account
3. Start adding poker sessions!

## Environment Variables Needed

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

## Features After Deployment

- ✅ **User Registration & Login** - Email/password authentication
- ✅ **Cloud Database** - Data persists across devices
- ✅ **Poker Session Tracking** - Add sessions with detailed info
- ✅ **Calendar View** - Click dates to add sessions
- ✅ **Analytics Dashboard** - View performance metrics
- ✅ **Responsive Design** - Works on desktop and mobile

## Troubleshooting

- **Database connection errors**: Check your DATABASE_URL
- **Build failures**: Check Vercel build logs
- **Authentication issues**: Verify JWT_SECRET is set
- **CORS errors**: Should be handled automatically by Vercel

## Cost

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Neon**: Free tier includes 0.5GB storage and 10GB transfer/month
- **Total**: $0/month for personal use!
