import { Router } from 'express';
import db from '../db.js';
import { TOTAL_CELLS } from '../config.js';

const router = Router();

// Leaderboard
router.get('/leaderboard', (req, res) => {
  const rows = db.prepare(`
    SELECT owner_name as name, owner_color as color, COUNT(*) as score
    FROM cells
    WHERE owner_id IS NOT NULL
    GROUP BY owner_id
    ORDER BY score DESC
    LIMIT 20
  `).all();
  res.json(rows);
});

// Stats
router.get('/stats', (req, res) => {
  const totalClaimed = db.prepare('SELECT COUNT(*) as count FROM cells WHERE owner_id IS NOT NULL').get();
  const totalPlayers = db.prepare('SELECT COUNT(DISTINCT owner_id) as count FROM cells WHERE owner_id IS NOT NULL').get();
  const topPlayer = db.prepare(`
    SELECT owner_name as name, owner_color as color, COUNT(*) as score
    FROM cells WHERE owner_id IS NOT NULL
    GROUP BY owner_id ORDER BY score DESC LIMIT 1
  `).get();
  res.json({
    totalCells: TOTAL_CELLS,
    claimedCells: totalClaimed.count,
    totalPlayers: totalPlayers.count,
    topPlayer: topPlayer || null
  });
});

export default router;
