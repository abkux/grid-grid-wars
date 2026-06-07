import { create } from 'zustand';

export const useStore = create((set) => ({
  socket: null,
  user: null,
  token: localStorage.getItem('gridwars_token') || null,
  gridSize: 50,
  cells: new Map(),
  connected: false,
  error: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  isPanning: false,
  rules: null,
  playerStats: { score: 0 },
  hoveredCell: null,
  recentClaims: new Map(),
  onlineCount: 0,

  setSocket: (socket) => set({ socket }),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('gridwars_token', token);
    else localStorage.removeItem('gridwars_token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('gridwars_token');
    set({ token: null, user: null, socket: null, connected: false, playerStats: { score: 0 }, recentClaims: new Map() });
  },
  setGridSize: (gridSize) => set({ gridSize }),
  setConnected: (connected) => set({ connected }),
  setError: (error) => set({ error }),
  setRules: (rules) => set({ rules }),
  setPlayerStats: (playerStats) => set({ playerStats }),
  setHoveredCell: (hoveredCell) => set({ hoveredCell }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),

  setCells: (cellsArray) => {
    const cells = new Map();
    cellsArray.forEach((c) => cells.set(`${c.x},${c.y}`, c));
    set({ cells });
  },

  setCell: (cell) => {
    set((state) => {
      const cells = new Map(state.cells);
      cells.set(`${cell.x},${cell.y}`, cell);
      // Track recent claim for flash animation
      const recentClaims = new Map(state.recentClaims);
      recentClaims.set(`${cell.x},${cell.y}`, Date.now());
      // Clean old entries (keep last 100)
      if (recentClaims.size > 100) {
        const entries = Array.from(recentClaims.entries());
        entries.sort((a, b) => a[1] - b[1]);
        entries.slice(0, entries.length - 100).forEach(([k]) => recentClaims.delete(k));
      }
      return { cells, recentClaims };
    });
  },

  setZoom: (zoom) => set((state) => ({ zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom })),
  setPan: (pan) => set({ pan }),
  setIsPanning: (isPanning) => set({ isPanning }),
}));
