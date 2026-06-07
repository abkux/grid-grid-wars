import jwt from 'jsonwebtoken';
import db from './db.js';
import { JWT_SECRET } from './config.js';

export function generateColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 75%, 55%)`;
}

export function getUserFromToken(token) {
  if (!token) return null;
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    return db.prepare('SELECT id, username, display_name, color FROM users WHERE id = ?').get(userId);
  } catch {
    return null;
  }
}
