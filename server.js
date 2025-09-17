const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing JWT_SECRET environment variable');
  } else {
    console.warn('JWT_SECRET not set. Using insecure development secret.');
    JWT_SECRET = 'dev-insecure-secret-do-not-use-in-production';
  }
}

// Initialize database tables
async function initDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poker_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_type VARCHAR(100) NOT NULL,
        blinds VARCHAR(50),
        location VARCHAR(255),
        location_type VARCHAR(50),
        buy_in DECIMAL(10,2) NOT NULL,
        end_amount DECIMAL(10,2) NOT NULL,
        winnings DECIMAL(10,2) NOT NULL,
        duration DECIMAL(5,2) NOT NULL,
        notes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
// Support/feedback email
app.post('/api/support', authenticateToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Email service not configured' });
      } else {
        // In development, allow testing without Resend configuration
        console.log('[DEV] Support message (no Resend API key configured):', {
          fromUser: { id: req.user.userId, email: req.user.email },
          subject,
          message
        });
        return res.json({ message: 'Feedback sent (dev noop)' });
      }
    }

    // Fetch user details to include name/email in the message
    let userDisplay = `User ID ${req.user.userId}`;
    try {
      const { rows } = await pool.query('SELECT name, email FROM users WHERE id = $1', [req.user.userId]);
      if (rows.length > 0) {
        userDisplay = `${rows[0].name} <${rows[0].email}>`;
      }
    } catch (_) {
      // non-fatal
    }

    const toEmail = process.env.SUPPORT_EMAIL || 'eddiejin18@gmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: req.user.email, // allows you to reply directly to the user
      subject: `[PokerTracker Support] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Feedback Received</h2>
          <p style="color: #374151; line-height: 1.6;">
            <strong>From:</strong> ${userDisplay}<br/>
            <strong>Email:</strong> <a href="mailto:${req.user.email}">${req.user.email}</a><br/>
            <strong>Subject:</strong> ${subject}
          </p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #374151; line-height: 1.6; margin: 0;">
              ${message.replace(/\n/g, '<br/>')}
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 0.875rem;">
            This feedback was submitted through PokerTracker.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send feedback' });
    }

    res.json({ message: 'Feedback sent', id: data.id });
  } catch (error) {
    console.error('Support email error:', error);
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, passwordHash, name]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found. Create an account to get started.' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user sessions
app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM poker_sessions WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create session
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const {
      gameType,
      blinds,
      location,
      locationType,
      buyIn,
      endAmount,
      duration,
      notes,
      timestamp
    } = req.body;

    const winnings = Number(endAmount) - Number(buyIn);
    // Normalize date-only strings to avoid timezone shifting to previous/next day
    const ts = timestamp
      ? (timestamp.includes('T') ? timestamp : `${timestamp}T12:00:00`)
      : null;

    // Require a timestamp to be provided so we never default to "now"
    if (!ts) {
      return res.status(400).json({ error: 'timestamp (YYYY-MM-DD or ISO) is required' });
    }

    const result = await pool.query(
      `INSERT INTO poker_sessions 
       (user_id, game_type, blinds, location, location_type, buy_in, end_amount, winnings, duration, notes, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamp)
       RETURNING *`,
      [req.user.userId, gameType, blinds, location, locationType, buyIn, endAmount, winnings, duration, notes, ts]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session
app.put('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      gameType,
      blinds,
      location,
      locationType,
      buyIn,
      endAmount,
      duration,
      notes,
      timestamp
    } = req.body;

    const winnings = endAmount - buyIn;

    const result = await pool.query(
      `UPDATE poker_sessions 
       SET game_type = $1, blinds = $2, location = $3, location_type = $4, 
           buy_in = $5, end_amount = $6, winnings = $7, duration = $8, notes = $9, timestamp = $10
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [gameType, blinds, location, locationType, buyIn, endAmount, winnings, duration, notes, timestamp, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete session
app.delete('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM poker_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database on startup
initDatabase();

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
