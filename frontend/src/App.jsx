import React, { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useStore } from './store';
import { Grid } from './components/Grid';
import { Leaderboard } from './components/Leaderboard';
import { Auth } from './components/Auth';

function App() {
  useSocket();
  const token = useStore((state) => state.token);
  const connected = useStore((state) => state.connected);
  const user = useStore((state) => state.user);
  const error = useStore((state) => state.error);
  const logout = useStore((state) => state.logout);
  const rules = useStore((state) => state.rules);
  const playerStats = useStore((state) => state.playerStats);
  const onlineCount = useStore((state) => state.onlineCount);
  // Verify token on app load to ensure its valid.
  useEffect(() => {
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      if (!res.ok) logout();
    }).catch(() => logout());
  }, [token, logout]);

  if (!token) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-3 sm:p-4">
      <header className="mb-4 sm:mb-6 text-center w-full max-w-5xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Grid Grid Wars
          </h1>
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-white animate-pulse' : 'bg-gray-600'} shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
        </div>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Claim blocks. Expand your territory. Dominate the grid.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          {onlineCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/50">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
              <span className="text-gray-400 text-xs uppercase tracking-wider">Online</span>
              <span className="font-mono text-white font-bold">{onlineCount}</span>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/50">
              <div className="w-3 h-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: user.color }} />
              <span className="font-semibold text-white">{user.name}</span>
            </div>
          )}
          {playerStats.score > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/50">
              <span className="text-gray-400 text-xs uppercase tracking-wider">Score</span>
              <span className="font-mono text-white font-bold">{playerStats.score}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all text-xs cursor-pointer"
          >
            Log out
          </button>
        </div>

        {error && (
          <div className="mt-3 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm animate-bounce inline-block font-medium">
            {error}
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start max-w-full">
        <Grid />
        <Leaderboard />
      </div>

      <div className="mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm text-center max-w-lg space-y-1">
        <p>Click any unclaimed block to capture it. Everyone sees changes instantly.</p>
        {rules && (
          <p className="text-gray-600 text-[11px] sm:text-xs">
            Cooldown: {rules.clickCooldownMs}ms · Lock time: {rules.lockTimeMs / 1000}s
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
