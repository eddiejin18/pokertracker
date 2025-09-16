# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Poker Tracker"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "Poker Tracker"
   - Add your email as developer contact
   - Save and continue through the steps
4. For Application type, choose "Web application"
5. Add authorized origins:
   - `http://localhost:3000`
   - `http://localhost:3001` (if using different port)
6. Click "Create"

## Step 4: Get Your Client ID

1. Copy the generated Client ID (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
2. Open `src/services/auth.js`
3. Replace `your-google-client-id.apps.googleusercontent.com` with your actual Client ID:

```javascript
const GOOGLE_CLIENT_ID = 'your-actual-client-id-here.apps.googleusercontent.com';
```

## Step 5: Test the App

1. Run `yarn dev`
2. Open `http://localhost:3000` in your browser
3. Click "Sign in with Google"
4. You should see the Google OAuth popup

## Troubleshooting

- **"This app isn't verified"**: Click "Advanced" → "Go to Poker Tracker (unsafe)" (this is normal for development)
- **"Error 400: redirect_uri_mismatch**: Make sure you added the correct localhost URL to authorized origins
- **Script errors**: Check browser console for specific error messages

## Security Note

Never commit your actual Client ID to version control. For production, use environment variables.
