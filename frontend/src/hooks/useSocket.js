import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../store';

export function useSocket() {
  const token = useStore((state) => state.token);
  const setSocket = useStore((state) => state.setSocket);
  const setUser = useStore((state) => state.setUser);
  const setGridSize = useStore((state) => state.setGridSize);
  const setCells = useStore((state) => state.setCells);
  const setCell = useStore((state) => state.setCell);
  const setConnected = useStore((state) => state.setConnected);
  const setError = useStore((state) => state.setError);
  const setRules = useStore((state) => state.setRules);
  const setPlayerStats = useStore((state) => state.setPlayerStats);
  const setOnlineCount = useStore((state) => state.setOnlineCount);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token }
    });

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      setConnected(false);
      if (err.message === 'Authentication required' || err.message === 'Invalid token') {
        setError('Session expired. Please log in again.');
        useStore.getState().logout();
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('init', ({ user, gridSize, rules }) => {
      setUser(user);
      setGridSize(gridSize);
      setRules(rules);
    });

    socket.on('grid:state', (cells) => {
      setCells(cells);
    });

    socket.on('block:claimed', (cell) => {
      setCell(cell);
    });

    socket.on('block:error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 2500);
    });

    socket.on('player:stats', (stats) => {
      setPlayerStats(stats);
    });

    socket.on('players:online', (count) => {
      setOnlineCount(count);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [token]);
}
