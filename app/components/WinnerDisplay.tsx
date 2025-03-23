"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface WinnerDisplayProps {
  winner: string | null;
  isSpinning: boolean;
}

export default function WinnerDisplay({
  winner,
  isSpinning,
}: WinnerDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  
  // Animation effect when a winner is determined
  useEffect(() => {
    if (winner && !isSpinning && containerRef.current && textRef.current) {
      // Reset any previous animations
      gsap.set(containerRef.current, { scale: 0.5, opacity: 0 });
      gsap.set(textRef.current, { y: 20, opacity: 0 });
      
      // Create animation timeline
      const tl = gsap.timeline();
      
      // Animate container
      tl.to(containerRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.7)"
      });
      
      // Animate text
      tl.to(textRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.2");
      
      // Add a pulse/bounce effect
      tl.to(containerRef.current, {
        scale: 1.05,
        duration: 0.2,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut"
      }, "+=0.1");
    }
  }, [winner, isSpinning]);

  if (!winner || isSpinning) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400 
                text-green-800 px-6 py-3 rounded-lg mb-4 shadow-md"
      style={{ 
        opacity: 0,
        transform: 'scale(0.5)',
        overflow: 'hidden'
      }}
    >
      <p 
        ref={textRef} 
        className="font-bold text-lg flex items-center justify-center"
        style={{ opacity: 0, transform: 'translateY(20px)' }}
      >
        <span className="mr-2 text-xl">🏆</span>
        Winner: <span className="mx-2 font-extrabold text-green-700">{winner}</span>
        <span className="ml-2 text-xl">🎉</span>
      </p>
    </div>
  );
}
