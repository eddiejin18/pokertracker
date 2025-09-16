# Poker Tracker Desktop App

A desktop application built with Electron and React for tracking poker sessions and analyzing performance over time.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google account
- 📊 **Interactive Dashboard** - Visual charts showing winnings over time
- 📈 **Performance Analytics** - Track win rate, total hours, and session statistics
- 💾 **Local Data Storage** - All data stored securely on your device
- 🎯 **Session Management** - Add, edit, and delete poker sessions
- 📱 **Responsive Design** - Beautiful UI with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Google Cloud Console account (for OAuth setup)

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000` to authorized origins
6. Copy your Client ID
7. Update `src/services/auth.js` with your Client ID:

```javascript
const GOOGLE_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
```

### 3. Development

Run the development server:

```bash
yarn dev
```

This will start both the React development server and Electron in development mode.

### 4. Production Build

Build the application:

```bash
yarn build
yarn electron-pack
```

## Project Structure

```
poker-tracker/
├── public/
│   ├── electron.js          # Electron main process
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── Dashboard.js     # Main dashboard component
│   │   ├── LoginPage.js     # Authentication page
│   │   ├── SessionModal.js  # Add/edit session modal
│   │   └── SessionList.js   # Recent sessions list
│   ├── services/
│   │   ├── auth.js          # Google OAuth service
│   │   └── storage.js       # Local data storage
│   ├── App.js               # Main React component
│   ├── App.css              # App styles
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── package.json
├── tailwind.config.js
└── README.md
```

## Usage

1. **Sign In**: Use your Google account to authenticate
2. **Add Sessions**: Click "New Session" to record poker sessions
3. **View Analytics**: Dashboard shows winnings over time and statistics
4. **Track Performance**: Monitor win rate, total hours, and session history

## Data Storage

All data is stored locally on your device using localStorage. No data is sent to external servers except for Google authentication.

## Technologies Used

- **Electron** - Desktop app framework
- **React** - UI library
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Google OAuth** - Authentication
- **Lucide React** - Icons

## License

MIT License
