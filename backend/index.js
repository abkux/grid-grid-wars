import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { PORT, FRONTEND_URL } from './config.js';
import './db.js'; // Initializes database on import

import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import { setupSocketAuth, setupSocketHandlers } from './socket.js';

// Express web server setup
const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: false }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', gameRoutes);

// Socket.IO
setupSocketAuth(io);
setupSocketHandlers(io);

// Start the express web server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
