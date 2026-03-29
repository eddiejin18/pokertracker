const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
// Default 5001: macOS often reserves 5000 (AirPlay / Control Center)
const PORT = process.env.PORT || 5001;

// Database connection (Neon / most cloud URLs need SSL even in local dev)
const dbUrl = process.env.DATABASE_URL || '';
const needsSSL =
  process.env.NODE_ENV === 'production' ||
  /sslmode=require|neon\.tech|supabase\.co|render\.com|railway\.app/i.test(dbUrl);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

// Do not initialize Resend at module load to avoid throwing when key is missing

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS poker_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        invite_code VARCHAR(16) UNIQUE NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS poker_group_members (
        group_id INTEGER NOT NULL REFERENCES poker_groups(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (group_id, user_id)
      )
    `);

    // Optional roles for Product-Led Growth: allow moderators beyond the owner
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poker_group_member_roles (
        group_id INTEGER NOT NULL REFERENCES poker_groups(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('moderator')),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (group_id, user_id)
      )
    `);

    // Group-level settings (used to filter what data is shown on the leaderboard)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poker_group_settings (
        group_id INTEGER PRIMARY KEY REFERENCES poker_groups(id) ON DELETE CASCADE,
        location_type VARCHAR(50) DEFAULT 'ALL',
        location VARCHAR(255) DEFAULT NULL,
        game_type VARCHAR(100) DEFAULT 'ALL',
        blinds VARCHAR(50) DEFAULT 'ALL',
        start_date DATE DEFAULT NULL,
        end_date DATE DEFAULT NULL
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
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

    // Initialize Resend lazily to avoid throwing at import time
    const resend = new Resend(process.env.RESEND_API_KEY);

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
    
    let sendResult;
    try {
      sendResult = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        replyTo: req.user.email, // allows you to reply directly to the user
        subject: `[PokerTracker Support] ${subject}`,
        html: `
          <div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto;\">\n            <h2 style=\"color: #2563eb;\">New Feedback Received</h2>\n            <p style=\"color: #374151; line-height: 1.6;\">\n              <strong>From:</strong> ${userDisplay}<br/>\n              <strong>Email:</strong> <a href=\"mailto:${req.user.email}\">${req.user.email}</a><br/>\n              <strong>Subject:</strong> ${subject}\n            </p>\n            <div style=\"background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;\">\n              <p style=\"color: #374151; line-height: 1.6; margin: 0;\">\n                ${message.replace(/\\n/g, '<br/>')}\n              </p>\n            </div>\n            <hr style=\"border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;\" />\n            <p style=\"color: #6b7280; font-size: 0.875rem;\">\n              This feedback was submitted through PokerTracker.\n            </p>\n          </div>
        `,
      });
    } catch (e) {
      console.error('Resend send exception:', e);
      return res.status(500).json({ error: 'Failed to send feedback' });
    }

    if (sendResult && sendResult.error) {
      console.error('Resend error:', sendResult.error);
      return res.status(500).json({ error: 'Failed to send feedback' });
    }

    const messageId = sendResult && sendResult.data ? sendResult.data.id : undefined;
    return res.json({ message: 'Feedback sent', id: messageId });
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

// --- Groups (compare stats with friends) ---
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.userId;
    const result = await pool.query(
      `SELECT g.id, g.name, g.invite_code, g.created_at, g.created_by,
        (SELECT COUNT(*)::int FROM poker_group_members m WHERE m.group_id = g.id) AS member_count
       FROM poker_groups g
       INNER JOIN poker_group_members gm ON gm.group_id = g.id AND gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [uid]
    );
    const rows = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      memberCount: row.member_count,
      createdAt: row.created_at,
      isOwner: Number(row.created_by) === Number(uid),
      inviteCode: row.invite_code,
    }));
    res.json(rows);
  } catch (error) {
    console.error('List groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name || name.length > 120) {
      return res.status(400).json({ error: 'Group name is required (max 120 characters)' });
    }
    const uid = req.user.userId;
    const inviteCode = generateInviteCode();
    const ins = await pool.query(
      `INSERT INTO poker_groups (name, invite_code, created_by)
       VALUES ($1, $2, $3) RETURNING id, name, invite_code, created_at, created_by`,
      [name, inviteCode, uid]
    );
    const g = ins.rows[0];
    await pool.query(
      `INSERT INTO poker_group_members (group_id, user_id) VALUES ($1, $2)`,
      [g.id, uid]
    );
    // Ensure defaults exist for older groups and new ones
    await pool.query(
      `INSERT INTO poker_group_settings (group_id)
       VALUES ($1)
       ON CONFLICT (group_id) DO NOTHING`,
      [g.id]
    );
    res.status(201).json({
      id: g.id,
      name: g.name,
      memberCount: 1,
      createdAt: g.created_at,
      isOwner: true,
      inviteCode: g.invite_code,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/groups/join', authenticateToken, async (req, res) => {
  try {
    const raw = (req.body.inviteCode || '').trim().toUpperCase();
    if (!raw) {
      return res.status(400).json({ error: 'Invite code is required' });
    }
    const uid = req.user.userId;
    const found = await pool.query('SELECT id, name, invite_code, created_at, created_by FROM poker_groups WHERE invite_code = $1', [
      raw,
    ]);
    if (found.rows.length === 0) {
      return res.status(404).json({ error: 'No group found with that invite code' });
    }
    const g = found.rows[0];
    const exists = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [g.id, uid]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'You are already in this group' });
    }
    await pool.query(`INSERT INTO poker_group_members (group_id, user_id) VALUES ($1, $2)`, [g.id, uid]);
    const count = await pool.query('SELECT COUNT(*)::int AS c FROM poker_group_members WHERE group_id = $1', [g.id]);
    res.status(201).json({
      id: g.id,
      name: g.name,
      memberCount: count.rows[0].c,
      createdAt: g.created_at,
      isOwner: Number(g.created_by) === Number(uid),
      inviteCode: g.invite_code,
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/groups/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group id' });
    }
    const uid = req.user.userId;
    const member = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, uid]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const gRow = await pool.query(
      `SELECT g.id, g.name, g.invite_code, g.created_at, g.created_by FROM poker_groups g WHERE g.id = $1`,
      [groupId]
    );
    if (gRow.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const g = gRow.rows[0];

    const isModeratorRow = await pool.query(
      `SELECT 1
       FROM poker_group_member_roles
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, uid]
    );
    const viewerRole =
      Number(g.created_by) === Number(uid)
        ? 'owner'
        : isModeratorRow.rows.length > 0
          ? 'moderator'
          : 'member';

    const settingsRes = await pool.query(
      `SELECT location_type, location, game_type, blinds, start_date, end_date
       FROM poker_group_settings
       WHERE group_id = $1`,
      [groupId]
    );
    const settings = settingsRes.rows[0] || {};
    const locationType = settings.location_type || 'ALL';
    const location = settings.location || null;
    const gameType = settings.game_type || 'ALL';
    const blinds = settings.blinds || 'ALL';
    const startDate = settings.start_date || null;
    const endDate = settings.end_date || null;

    const stats = await pool.query(
      `SELECT gm.user_id AS "userId", u.name,
        COALESCE(SUM(ps.winnings), 0)::float AS "totalWinnings",
        COALESCE(SUM(ps.duration), 0)::float AS "totalHours",
        COUNT(ps.id)::int AS "sessionCount"
       FROM poker_group_members gm
       INNER JOIN users u ON u.id = gm.user_id
       LEFT JOIN poker_sessions ps
         ON ps.user_id = gm.user_id
        AND ($2::text = 'ALL' OR COALESCE(ps.location_type,'') = $2::text)
        AND ($3::text IS NULL OR $3::text = '' OR ps.location = $3::text)
        AND ($4::text = 'ALL' OR COALESCE(ps.game_type,'') = $4::text)
        AND ($5::text = 'ALL' OR COALESCE(ps.blinds,'') = $5::text)
        AND ($6::date IS NULL OR ps.timestamp >= $6::date::timestamp)
        AND ($7::date IS NULL OR ps.timestamp <= ($7::date::timestamp + interval '23:59:59'))
       WHERE gm.group_id = $1
       GROUP BY gm.user_id, u.name
       ORDER BY COALESCE(SUM(ps.winnings), 0) DESC, u.name ASC`,
      [groupId, locationType, location, gameType, blinds, startDate, endDate]
    );

    const leaderboard = stats.rows.map((row, index) => {
      const tw = Number(row.totalWinnings) || 0;
      const th = Number(row.totalHours) || 0;
      const hourly = th > 0 ? tw / th : 0;
      return {
        rank: index + 1,
        userId: row.userId,
        name: row.name,
        isYou: Number(row.userId) === Number(uid),
        totalWinnings: tw,
        totalHours: th,
        sessionCount: row.sessionCount,
        hourlyProfit: hourly,
      };
    });

    res.json({
      id: g.id,
      name: g.name,
      createdAt: g.created_at,
      isOwner: Number(g.created_by) === Number(uid),
      inviteCode: g.invite_code,
      viewerRole,
      memberCount: leaderboard.length,
      settings: {
        locationType,
        location,
        gameType,
        blinds,
        startDate,
        endDate,
      },
      leaderboard,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Group members + roles (owner/moderator management)
app.get('/api/groups/:id/members', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group id' });
    }
    const uid = req.user.userId;

    const member = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, uid]
    );
    if (member.rows.length === 0) return res.status(403).json({ error: 'Not a member of this group' });

    const gRow = await pool.query('SELECT id, created_by FROM poker_groups WHERE id = $1', [groupId]);
    if (gRow.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    const ownerId = gRow.rows[0].created_by;

    const isModeratorRow = await pool.query(
      `SELECT 1
       FROM poker_group_member_roles
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, uid]
    );

    const viewerRole = Number(ownerId) === Number(uid) ? 'owner' : isModeratorRow.rows.length > 0 ? 'moderator' : 'member';
    if (viewerRole === 'member') return res.status(403).json({ error: 'Insufficient permissions' });

    const rows = await pool.query(
      `SELECT gm.user_id AS "userId",
              u.name,
              CASE
                WHEN g.created_by = $2 THEN 'owner'
                WHEN r.user_id IS NOT NULL THEN 'moderator'
                ELSE 'member'
              END AS role
       FROM poker_group_members gm
       INNER JOIN users u ON u.id = gm.user_id
       INNER JOIN poker_groups g ON g.id = gm.group_id
       LEFT JOIN poker_group_member_roles r
         ON r.group_id = gm.group_id AND r.user_id = gm.user_id
       WHERE gm.group_id = $1
       ORDER BY
         CASE
           WHEN g.created_by = $2 THEN 2
           WHEN r.user_id IS NOT NULL THEN 1
           ELSE 0
         END DESC,
         u.name ASC`,
      [groupId, uid]
    );

    res.json(rows.rows);
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add moderator role (owner/moderator can do this)
app.post('/api/groups/:id/moderators', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });
    const uid = req.user.userId;
    const targetUserId = parseInt(req.body.userId, 10);
    if (Number.isNaN(targetUserId)) return res.status(400).json({ error: 'userId is required' });

    const gRow = await pool.query('SELECT created_by FROM poker_groups WHERE id = $1', [groupId]);
    if (gRow.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    const ownerId = gRow.rows[0].created_by;

    const membership = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, uid]
    );
    if (membership.rows.length === 0) return res.status(403).json({ error: 'Not a member of this group' });

    const isModeratorRow = await pool.query(
      `SELECT 1 FROM poker_group_member_roles WHERE group_id=$1 AND user_id=$2`,
      [groupId, uid]
    );
    const viewerRole = Number(ownerId) === Number(uid) ? 'owner' : isModeratorRow.rows.length > 0 ? 'moderator' : 'member';
    if (viewerRole === 'member') return res.status(403).json({ error: 'Insufficient permissions' });

    if (targetUserId === ownerId) {
      return res.status(400).json({ error: 'Owner is automatically privileged' });
    }

    const targetMembership = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, targetUserId]
    );
    if (targetMembership.rows.length === 0) {
      return res.status(404).json({ error: 'Target user is not in this group' });
    }

    await pool.query(
      `INSERT INTO poker_group_member_roles (group_id, user_id, role)
       VALUES ($1, $2, 'moderator')
       ON CONFLICT (group_id, user_id)
       DO UPDATE SET role = 'moderator'`,
      [groupId, targetUserId]
    );

    res.json({ message: 'Moderator updated' });
  } catch (error) {
    console.error('Add moderator error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a member from the group (owner/moderator can do this)
app.delete('/api/groups/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);
    if (Number.isNaN(groupId) || Number.isNaN(targetUserId)) return res.status(400).json({ error: 'Invalid id' });

    const uid = req.user.userId;

    const gRow = await pool.query('SELECT created_by FROM poker_groups WHERE id = $1', [groupId]);
    if (gRow.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    const ownerId = gRow.rows[0].created_by;

    const membership = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, uid]
    );
    if (membership.rows.length === 0) return res.status(403).json({ error: 'Not a member of this group' });

    const isModeratorRow = await pool.query(
      `SELECT 1 FROM poker_group_member_roles WHERE group_id=$1 AND user_id=$2`,
      [groupId, uid]
    );
    const viewerRole = Number(ownerId) === Number(uid) ? 'owner' : isModeratorRow.rows.length > 0 ? 'moderator' : 'member';
    if (viewerRole === 'member') return res.status(403).json({ error: 'Insufficient permissions' });

    if (targetUserId === ownerId) {
      return res.status(400).json({ error: 'Cannot remove the owner' });
    }
    if (targetUserId === uid) {
      return res.status(400).json({ error: 'Use Leave Group instead' });
    }

    const targetMembership = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, targetUserId]
    );
    if (targetMembership.rows.length === 0) return res.status(404).json({ error: 'Target user is not in this group' });

    await pool.query('DELETE FROM poker_group_member_roles WHERE group_id=$1 AND user_id=$2', [groupId, targetUserId]);
    await pool.query('DELETE FROM poker_group_members WHERE group_id=$1 AND user_id=$2', [groupId, targetUserId]);

    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Group settings (filters)
app.get('/api/groups/:id/settings', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

    const uid = req.user.userId;
    const member = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, uid]
    );
    if (member.rows.length === 0) return res.status(403).json({ error: 'Not a member of this group' });

    const settingsRes = await pool.query(
      `SELECT location_type, location, game_type, blinds, start_date, end_date
       FROM poker_group_settings WHERE group_id=$1`,
      [groupId]
    );
    const settings = settingsRes.rows[0] || {};

    res.json({
      locationType: settings.location_type || 'ALL',
      location: settings.location || null,
      gameType: settings.game_type || 'ALL',
      blinds: settings.blinds || 'ALL',
      startDate: settings.start_date || null,
      endDate: settings.end_date || null,
    });
  } catch (error) {
    console.error('Get group settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/groups/:id/settings', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

    const uid = req.user.userId;
    const member = await pool.query(
      'SELECT 1 FROM poker_group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, uid]
    );
    if (member.rows.length === 0) return res.status(403).json({ error: 'Not a member of this group' });

    const gRow = await pool.query('SELECT created_by FROM poker_groups WHERE id = $1', [groupId]);
    if (gRow.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    const ownerId = gRow.rows[0].created_by;

    const isModeratorRow = await pool.query(
      `SELECT 1 FROM poker_group_member_roles WHERE group_id=$1 AND user_id=$2`,
      [groupId, uid]
    );
    const viewerRole = Number(ownerId) === Number(uid) ? 'owner' : isModeratorRow.rows.length > 0 ? 'moderator' : 'member';
    if (viewerRole === 'member') return res.status(403).json({ error: 'Insufficient permissions' });

    const filters = req.body?.filters || {};
    const locationType = filters.locationType || 'ALL';
    const location = filters.location || null;
    const gameType = filters.gameType || 'ALL';
    const blinds = filters.blinds || 'ALL';
    const startDate = filters.startDate || null;
    const endDate = filters.endDate || null;

    await pool.query(
      `INSERT INTO poker_group_settings
        (group_id, location_type, location, game_type, blinds, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (group_id)
       DO UPDATE SET
         location_type = EXCLUDED.location_type,
         location = EXCLUDED.location,
         game_type = EXCLUDED.game_type,
         blinds = EXCLUDED.blinds,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date`,
      [groupId, locationType, location, gameType, blinds, startDate, endDate]
    );

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Update group settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/groups/:id/leave', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group id' });
    }
    const uid = req.user.userId;
    const g = await pool.query('SELECT created_by FROM poker_groups WHERE id = $1', [groupId]);
    if (g.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (Number(g.rows[0].created_by) === Number(uid)) {
      return res.status(400).json({ error: 'Transfer ownership or delete the group instead of leaving' });
    }
    await pool.query('DELETE FROM poker_group_members WHERE group_id = $1 AND user_id = $2', [groupId, uid]);
    res.json({ message: 'Left group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/groups/:id', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group id' });
    }
    const uid = req.user.userId;
    const g = await pool.query('DELETE FROM poker_groups WHERE id = $1 AND created_by = $2 RETURNING id', [groupId, uid]);
    if (g.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found or you are not the owner' });
    }
    res.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
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

// Bulk delete sessions (same user only)
app.post('/api/sessions/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const raw = req.body?.ids;
    if (!Array.isArray(raw) || raw.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }
    const ids = raw
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
    if (ids.length === 0) {
      return res.status(400).json({ error: 'No valid integer ids' });
    }
    const result = await pool.query(
      `DELETE FROM poker_sessions
       WHERE user_id = $1 AND id = ANY($2::int[])
       RETURNING id`,
      [req.user.userId, ids]
    );
    res.json({
      deleted: result.rows.length,
      ids: result.rows.map((r) => r.id),
    });
  } catch (error) {
    console.error('Bulk delete sessions error:', error);
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
