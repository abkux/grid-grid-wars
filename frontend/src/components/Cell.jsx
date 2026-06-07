import React, { memo, useCallback, useEffect, useState } from 'react';
import { useStore } from '../store';

function formatRelativeTime(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

export const Cell = memo(function Cell({ x, y }) {
  const key = `${x},${y}`;
  const cell = useStore((state) => state.cells.get(key));
  const socket = useStore((state) => state.socket);
  const user = useStore((state) => state.user);
  const isPanning = useStore((state) => state.isPanning);
  const recentClaims = useStore((state) => state.recentClaims);
  const setHoveredCell = useStore((state) => state.setHoveredCell);

  const isMine = cell && user && cell.owner_id === user.id;
  const now = Date.now();
  const isLocked = cell?.locked_until > now;

  // Track claim flash animation
  const [flash, setFlash] = useState(false);
  const claimTime = recentClaims.get(key);

  // Tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (claimTime && now - claimTime < 600) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(timer);
    }
  }, [claimTime, now, key]);

  const handleClick = useCallback(() => {
    if (!socket || isPanning) return;
    socket.emit('block:claim', { x, y });
  }, [socket, isPanning, x, y]);

  const handleMouseEnter = useCallback(() => {
    setHoveredCell({ x, y });
    setShowTooltip(true);
  }, [setHoveredCell, x, y]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setShowTooltip(false);
  }, [setHoveredCell]);

  const tooltipContent = (() => {
    if (!cell) {
      return (
        <div>
          <p className="font-semibold text-white text-xs">Unclaimed</p>
          <p className="text-gray-400 text-[10px]">Click to capture!</p>
        </div>
      );
    }
    const capturedAgo = cell.claimed_at ? formatRelativeTime(now - cell.claimed_at) : 'unknown';
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cell.owner_color }} />
          <span className="font-semibold text-white text-xs truncate max-w-30">{cell.owner_name}</span>
        </div>
        <p className="text-gray-400 text-[10px]">Captured: {capturedAgo}</p>
        {isLocked && (
          <p className="text-gray-300 text-[10px]">Locked for {Math.ceil((cell.locked_until - now) / 1000)}s</p>
        )}
      </div>
    );
  })();

  return (
    <div
      data-cell
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        w-5 h-5 cursor-pointer relative rounded-[2px]
        ${cell ? 'hover:brightness-110 hover:scale-105' : 'hover:bg-white/10'}
        ${isMine ? 'z-10 shadow-[0_0_4px_rgba(255,255,255,0.3)]' : ''}
        ${isLocked ? 'opacity-60' : ''}
      `}
      style={{
        backgroundColor: cell?.owner_color || (flash ? '#ffffff' : 'rgba(255,255,255,0.04)'),
        transition: flash
          ? 'none'
          : 'background-color 0.4s ease, transform 0.15s ease, filter 0.15s ease, opacity 0.3s ease',
        boxShadow: flash
          ? `0 0 12px 2px #ffffff, inset 0 0 4px rgba(255,255,255,0.5)`
          : isMine
          ? `inset 0 0 0 1.5px rgba(255,255,255,0.8)`
          : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
      }}
    >
      {/* Lock indicator */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse" />
        </div>
      )}

      {/* Custom Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900/95 border border-gray-700/60 shadow-xl backdrop-blur-sm z-50 whitespace-nowrap pointer-events-none tooltip-fade-in"
          style={{ minWidth: 100 }}
        >
          {tooltipContent}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-gray-900/95 border-r border-b border-gray-700/60 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
});
