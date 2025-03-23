"use client";

import React from "react";

interface WinnerDisplayProps {
  winner: string | null;
  isSpinning: boolean;
}

export default function WinnerDisplay({
  winner,
  isSpinning,
}: WinnerDisplayProps) {
  if (!winner || isSpinning) {
    return null;
  }

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
      <p className="font-bold">Winner: {winner}! 🎉</p>
    </div>
  );
}
