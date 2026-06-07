import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3009;
export const DB_PATH = path.join(__dirname, 'grid.db');
export const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// Game constants
export const GRID_SIZE = 50;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const CLICK_COOLDOWN_MS = 500;
export const LOCK_TIME_MS = 5000; // Cells stay locked for 5s after claim
