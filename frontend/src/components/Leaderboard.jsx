import React, { useEffect, useState } from 'react';

export function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardRes, statsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leaderboard`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stats`)
        ]);
        const boardData = await boardRes.json();
        const statsData = await statsRes.json();
        setBoard(boardData);
        setStats(statsData);
      } catch (e) {
        console.error('Failed to fetch leaderboard', e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full lg:w-64">
      <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 shadow-xl">
        <h2 className="text-white font-bold mb-3 text-base flex items-center gap-2">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Leaderboard
        </h2>
        <div className="space-y-1 max-h-72 overflow-auto">
          {board.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm px-2 py-1.5 rounded-md hover:bg-gray-700/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-5 text-center font-bold text-xs ${
                  i === 0 ? 'text-white' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <div
                  className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white truncate font-medium text-sm">{entry.name}</span>
              </div>
              <span className="text-gray-400 font-mono shrink-0 ml-2 text-xs">{entry.score}</span>
            </div>
          ))}
          {board.length === 0 && (
            <p className="text-gray-500 text-sm px-2 py-4 text-center">No claims yet. Be the first!</p>
          )}
        </div>
      </div>

      {stats && (
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50 shadow-xl">
          <h2 className="text-white font-bold mb-3 text-base flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Grid Stats
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 text-xs">Claimed</span>
              <span className="text-white font-mono text-sm">{stats.claimedCells.toLocaleString()} <span className="text-gray-500 text-xs">/ {stats.totalCells.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-700"
                style={{ width: `${(stats.claimedCells / stats.totalCells) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 text-xs">Players</span>
              <span className="text-white font-mono text-sm">{stats.totalPlayers}</span>
            </div>
            {stats.topPlayer && (
              <div className="pt-2 border-t border-gray-700/50">
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Top Player</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-white/10"
                    style={{ backgroundColor: stats.topPlayer.color }}
                  />
                  <span className="text-sm text-white font-medium truncate">{stats.topPlayer.name}</span>
                  <span className="text-xs text-gray-400 font-mono ml-auto">{stats.topPlayer.score}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
