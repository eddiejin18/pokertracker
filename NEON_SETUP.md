# Neon Database Setup Guide

## Step 1: Create Neon Account

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account
3. Create a new project

## Step 2: Get Database Connection String

1. In your Neon project dashboard, go to "Connection Details"
2. Copy the connection string (looks like: `postgresql://username:password@host:port/database`)
3. Create a `.env` file in your project root:

```bash
cp env.example .env
```

4. Update the `.env` file with your Neon connection string:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

## Step 3: Install Dependencies

```bash
yarn install
```

## Step 4: Start the Application

```bash
# Start both frontend and backend
yarn dev-full

# Or start them separately:
# Terminal 1: Backend
yarn server

# Terminal 2: Frontend  
yarn dev
```

## Step 5: Test the Application

1. Open `http://localhost:3000` in your browser
2. Create a new account
3. Start adding poker sessions!

## Database Schema

The application will automatically create these tables:

- **users**: Stores user accounts (id, email, password_hash, name, created_at)
- **poker_sessions**: Stores poker session data (id, user_id, game_type, blinds, location, buy_in, end_amount, winnings, duration, notes, timestamp)

## Security Features

- ✅ **Password hashing** with bcrypt
- ✅ **JWT authentication** for secure sessions
- ✅ **User isolation** - each user only sees their own data
- ✅ **Input validation** and SQL injection protection
- ✅ **CORS protection** for API endpoints

## Troubleshooting

- **Connection errors**: Check your DATABASE_URL in .env
- **Port conflicts**: Make sure ports 3000 and 5000 are available
- **Database errors**: Check the server console for detailed error messages
