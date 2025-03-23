"use client";

import React from "react";

interface SpinButtonProps {
  isSpinning: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function SpinButton({
  isSpinning,
  disabled,
  onClick,
}: SpinButtonProps) {
  return (
    <button
      className="spin-button"
      disabled={disabled || isSpinning}
      onClick={onClick}
    >
      {isSpinning ? "Spinning..." : "Spin the Wheel!"}
    </button>
  );
}
