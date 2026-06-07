import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET } from '../config.js';
import { generateColor, getUserFromToken } from '../utils.js';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { username, password, displayName } = req.body;

  if (!username || !password || username.length < 3 || password.length < 4) {
    return res.status(400).json({ error: 'Username (min 3) and password (min 4) required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const name = displayName?.trim() || username;
  const color = generateColor();

  const result = db.prepare(
    'INSERT INTO users (username, password_hash, display_name, color) VALUES (?, ?, ?, ?)'
  ).run(username, hash, name, color);

  const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: result.lastInsertRowid, username, displayName: name, color }
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, username: user.username, displayName: user.display_name, color: user.color }
  });
});

// Get current user
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  const user = getUserFromToken(auth.slice(7));

  if (!user) return res.status(401).json({ error: 'Invalid token' });

  res.json({ id: user.id, username: user.username, displayName: user.display_name, color: user.color });
});

export default router;
