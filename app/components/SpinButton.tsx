"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Add hover animation effect
  useEffect(() => {
    if (buttonRef.current && !disabled && !isSpinning) {
      // Mouse enter animation
      const handleMouseEnter = () => {
        gsap.to(buttonRef.current, {
          scale: 1.05,
          duration: 0.2,
          ease: "power1.out"
        });
      };
      
      // Mouse leave animation
      const handleMouseLeave = () => {
        gsap.to(buttonRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power1.in"
        });
      };
      
      // Add event listeners
      const button = buttonRef.current;
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
      
      // Cleanup
      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [disabled, isSpinning]);
  
  // Add spinning animation
  useEffect(() => {
    if (buttonRef.current) {
      if (isSpinning) {
        // Pulsing animation during spin
        gsap.to(buttonRef.current, {
          scale: 1.03,
          repeat: -1,
          yoyo: true,
          duration: 0.5,
          ease: "sine.inOut"
        });
      } else {
        // Stop all animations when not spinning
        gsap.killTweensOf(buttonRef.current);
        gsap.to(buttonRef.current, {
          scale: 1,
          duration: 0.2
        });
      }
    }
  }, [isSpinning]);
  
  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden px-6 py-3 rounded-full font-bold text-lg shadow-lg transform transition-transform 
                ${isSpinning ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white' : 
                  disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                  'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-xl'}`}
      disabled={disabled || isSpinning}
      onClick={onClick}
      style={{ transform: 'scale(1)' }}
    >
      <span className="relative z-10 flex items-center justify-center">
        {isSpinning ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Spinning...
          </>
        ) : (
          <>
            Spin the Wheel! 🎡
          </>
        )}
      </span>
      
      {/* Add animated background effect for non-disabled buttons */}
      {!disabled && !isSpinning && (
        <span className="absolute top-0 left-0 w-full h-full bg-white opacity-10 
                        transform -translate-x-full animate-pulse"></span>
      )}
    </button>
  );
}
