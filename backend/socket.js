import { CLICK_COOLDOWN_MS, GRID_SIZE, LOCK_TIME_MS } from './config.js';
import db from './db.js';
import { getUserFromToken } from './utils.js';

const connectedUsers = new Map();

export function setupSocketAuth(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    const user = getUserFromToken(token);
    if (!user) return next(new Error('Invalid token'));
    socket.user = user;
    next();
  });
}

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const dbUser = socket.user;

    const player = {
      id: `user:${dbUser.id}`,
      name: dbUser.display_name || dbUser.username,
      color: dbUser.color,
      lastClick: 0
    };

    connectedUsers.set(socket.id, player);

    // Send initial state
    socket.emit('init', {
      user: { id: player.id, name: player.name, color: player.color },
      gridSize: GRID_SIZE,
      rules: {
        clickCooldownMs: CLICK_COOLDOWN_MS,
        lockTimeMs: LOCK_TIME_MS
      }
    });

    const cells = db.prepare(`
      SELECT x, y, owner_id, owner_name, owner_color, claimed_at, locked_until
      FROM cells
      WHERE owner_id IS NOT NULL
    `).all();
    socket.emit('grid:state', cells);

    // Broadcast online player count
    io.emit('players:online', connectedUsers.size);

    // Block claim handler logic
    socket.on('block:claim', ({ x, y }) => {
      if (typeof x !== 'number' || typeof y !== 'number') return;
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

      const now = Date.now();

      // Cooldown check
      if (now - player.lastClick < CLICK_COOLDOWN_MS) {
        const remaining = Math.ceil((CLICK_COOLDOWN_MS - (now - player.lastClick)) / 1000 * 10) / 10;
        socket.emit('block:error', { x, y, message: `Cooldown: wait ${remaining}s` });
        return;
      }

      // Lock time check
      const cell = db.prepare('SELECT owner_id, locked_until FROM cells WHERE x = ? AND y = ?').get(x, y);
      if (cell?.locked_until > now) {
        const remaining = Math.ceil((cell.locked_until - now) / 1000 * 10) / 10;
        socket.emit('block:error', { x, y, message: `Locked! Unlock in ${remaining}s` });
        return;
      }

      // Attempt claim
      const result = db.prepare(`
        UPDATE cells
        SET owner_id = ?, owner_name = ?, owner_color = ?, claimed_at = ?, locked_until = ?
        WHERE x = ? AND y = ? AND (owner_id IS NULL OR locked_until <= ?)
      `).run(player.id, player.name, player.color, now, now + LOCK_TIME_MS, x, y, now);

      if (result.changes === 0) {
        socket.emit('block:error', { x, y, message: 'This block is already claimed' });
        return;
      }

      player.lastClick = now;
      const update = {
        x, y,
        owner_id: player.id,
        owner_name: player.name,
        owner_color: player.color,
        claimed_at: now,
        locked_until: now + LOCK_TIME_MS
      };
      io.emit('block:claimed', update);

      // Broadcast score update to the player
      socket.emit('player:stats', {
        score: db.prepare('SELECT COUNT(*) as count FROM cells WHERE owner_id = ?').get(player.id).count
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      io.emit('players:online', connectedUsers.size);
    });
  });
}
