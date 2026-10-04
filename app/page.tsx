"use client";

import { useState, useEffect, useCallback, useTransition } from "react";

interface ColorColumn {
  id: number;
  hex: string;
  locked: boolean;
}

function getRandomHex(): string {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function Home() {
  const [colors, setColors] = useState<ColorColumn[]>([
    { id: 1, hex: "#6366F1", locked: false },
    { id: 2, hex: "#EC4899", locked: false },
    { id: 3, hex: "#F59E0B", locked: false },
    { id: 4, hex: "#10B981", locked: false },
    { id: 5, hex: "#3B82F6", locked: false },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const generate = useCallback(() => {
    setColors((prev) =>
      prev.map((c) => (c.locked ? c : { ...c, hex: getRandomHex() }))
    );
  }, []);

  useEffect(() => {
    startTransition(() => {
      generate();
    });
  }, [generate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target === document.body || (e.target as HTMLElement).tagName === "MAIN")) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generate]);

  const toggleLock = (id: number) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
    );
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setToast(`Copied ${hex}`);
    setTimeout(() => setToast(null), 1500);
  };

  return (
    <main tabIndex={0} className="min-h-screen bg-fuchsia-50/40 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex items-center justify-center p-4 outline-none">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-fuchsia-100/50 dark:shadow-none border border-fuchsia-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-fuchsia-500" />
            <h1 className="text-xl font-bold tracking-tight">Palette Generator</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Press <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">Spacebar</kbd> to generate
            </span>
            <button
              onClick={generate}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition active:scale-95 shadow-sm shadow-fuchsia-200 dark:shadow-none"
            >
              Generate
            </button>
          </div>
        </div>

        {/* 5 Color Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 h-96 rounded-2xl overflow-hidden">
          {colors.map((col) => {
            const contrast = getContrastColor(col.hex);
            return (
              <div
                key={col.id}
                style={{ backgroundColor: col.hex, color: contrast }}
                className="flex sm:flex-col justify-between items-center p-4 rounded-xl transition-colors duration-300 shadow-inner"
              >
                {/* Lock Toggle */}
                <button
                  onClick={() => toggleLock(col.id)}
                  aria-label={col.locked ? "Unlock color" : "Lock color"}
                  className="p-2 rounded-xl bg-black/15 hover:bg-black/25 active:scale-95 transition text-xs font-semibold backdrop-blur-sm"
                >
                  {col.locked ? "🔒 Locked" : "🔓 Lock"}
                </button>

                {/* Hex Code button */}
                <button
                  onClick={() => copyHex(col.hex)}
                  title="Click to copy HEX code"
                  className="font-mono font-bold text-sm tracking-widest px-3 py-1.5 rounded-xl bg-black/15 hover:bg-black/25 active:scale-95 transition backdrop-blur-sm"
                >
                  {col.hex}
                </button>
              </div>
            );
          })}
        </div>

        {/* Toast notification */}
        <div className="h-6 flex items-center justify-center">
          {toast && (
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md animate-bounce">
              {toast}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
