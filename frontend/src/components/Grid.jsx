import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { useStore } from '../store';
import { Cell } from './Cell';

export function Grid() {
  const gridSize = useStore((state) => state.gridSize);
  const zoom = useStore((state) => state.zoom);
  const pan = useStore((state) => state.pan);
  const setZoom = useStore((state) => state.setZoom);
  const setPan = useStore((state) => state.setPan);
  const setIsPanning = useStore((state) => state.setIsPanning);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const cellElements = useMemo(() => {
    const arr = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        arr.push(<Cell key={`${x},${y}`} x={x} y={y} />);
      }
    }
    return arr;
  }, [gridSize]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.3), 3);
      return Math.round(next * 100) / 100;
    });
  }, [setZoom]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (e.target.closest('[data-cell]')) return;
    setDragging(true);
    setIsPanning(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan, setIsPanning]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }, [dragging, setPan]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setIsPanning(false);
  }, [setIsPanning]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative rounded-xl border border-gray-800 overflow-hidden bg-[#050505] select-none"
      style={{ width: 'min(85vw, 85vh)', height: 'min(85vw, 85vh)', maxWidth: 800, maxHeight: 800 }}
    >
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <div
          className="grid gap-px bg-gray-800/30 origin-top-left"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {cellElements}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          onClick={() => {
            const next = Math.min(Math.round((zoom + 0.2) * 100) / 100, 3);
            setZoom(next);
          }}
          className="w-8 h-8 rounded-lg bg-black border border-white/20 text-white text-lg font-bold hover:bg-white/10 active:bg-white/20 transition-colors shadow flex items-center justify-center cursor-pointer"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            const next = Math.max(Math.round((zoom - 0.2) * 100) / 100, 0.3);
            setZoom(next);
          }}
          className="w-8 h-8 rounded-lg bg-black border border-white/20 text-white text-lg font-bold hover:bg-white/10 active:bg-white/20 transition-colors shadow flex items-center justify-center cursor-pointer"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="w-8 h-8 rounded-lg bg-black border border-white/20 text-white text-xs font-bold hover:bg-white/10 active:bg-white/20 transition-colors shadow flex items-center justify-center cursor-pointer"
          title="Reset view"
        >
          ⌖
        </button>
      </div>

      {/* Zoom Level */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black border border-white/20 text-xs text-gray-300 backdrop-blur-sm font-mono">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
