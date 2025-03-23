"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { defaultConfig } from "../lib/config";
import {
  getDefaultParticipants,
  getRandomWinnerIndex,
  addParticipant,
} from "../lib/participants";
import {
  calculateTargetAngle,
  calculateTotalRotation,
  calculateRotationAtTime,
  normalizeAngle,
  getSegmentAtAngle,
} from "../lib/physics";

// Import our components
import SpinButton from "./SpinButton";
import WinnerDisplay from "./WinnerDisplay";
import ParticipantsList from "./ParticipantsList";

// Simplified direct wheel drawing with no separate components
export default function PrizeWheel() {
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // === STATE ===
  const [participants, setParticipants] = useState<string[]>(getDefaultParticipants());
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);

  // Animation refs
  const currentAngleRef = useRef(0);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // Enhanced wheel drawing function with winner highlighting
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions with high-DPI support
    const size = 400;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Set display size (css pixels)
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    // Set actual size in memory (scaled for HiDPI)
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale context for high-DPI display
    ctx.scale(pixelRatio, pixelRatio);
    
    // Clear canvas (using display size)
    ctx.clearRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    // Get winning segment index for highlighting
    const winnerIndex = winner ? participants.indexOf(winner) : -1;
    
    // Draw segments
    if (participants.length > 0) {
      const segmentAngle = (Math.PI * 2) / participants.length;
      
      participants.forEach((name, index) => {
        // Calculate start and end angles for this segment
        const startAngle = index * segmentAngle + wheelAngle;
        const endAngle = (index + 1) * segmentAngle + wheelAngle;
        
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Use colors from config file
        const colorIndex = index % defaultConfig.appearance.colors.length;
        
        // Apply highlight to winning segment or use normal color
        if (index === winnerIndex && !isSpinning) {
          // Create a gradient highlight for the winner
          const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, radius
          );
          
          // Base color with increasing brightness
          gradient.addColorStop(0, defaultConfig.appearance.colors[colorIndex]);
          gradient.addColorStop(0.7, defaultConfig.appearance.colors[colorIndex]);
          gradient.addColorStop(1, '#ffffff');
          
          ctx.fillStyle = gradient;
          
          // Draw a glow effect
          ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = defaultConfig.appearance.colors[colorIndex];
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        
        // Add a border
        ctx.strokeStyle = defaultConfig.appearance.borderColor;
        ctx.lineWidth = defaultConfig.appearance.borderWidth;
        
        // Make border thicker for winner
        if (index === winnerIndex && !isSpinning) {
          ctx.lineWidth = defaultConfig.appearance.borderWidth * 2;
          ctx.strokeStyle = '#FFD700'; // Gold color for winner
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow for text
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        
        // Emphasize winner text
        if (index === winnerIndex && !isSpinning) {
          ctx.fillStyle = '#000000'; // Black text for winner
          ctx.font = `bold ${defaultConfig.appearance.textConfig.fontSize + 2}px ${defaultConfig.appearance.textConfig.fontFamily}`;
        } else {
          ctx.fillStyle = defaultConfig.appearance.textConfig.color;
          ctx.font = `bold ${defaultConfig.appearance.textConfig.fontSize}px ${defaultConfig.appearance.textConfig.fontFamily}`;
        }
        
        // Position text based on segment size
        const textOffset = Math.min(20, radius * 0.1);
        ctx.fillText(name, radius - textOffset, 6);
        ctx.restore();
      });
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = defaultConfig.appearance.centerColor;
    ctx.fill();
    ctx.strokeStyle = defaultConfig.appearance.borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw pointer based on config position
    const pointerSize = defaultConfig.pointer.size;
    const pointerPosition = defaultConfig.appearance.pointerPosition;
    
    ctx.beginPath();
    
    // Draw pointer based on configured position
    switch (pointerPosition) {
      case "top":
        // Triangle pointer pointing down
        ctx.moveTo(centerX, centerY - radius - 10);
        ctx.lineTo(centerX - pointerSize/2, centerY - radius + 10);
        ctx.lineTo(centerX + pointerSize/2, centerY - radius + 10);
        break;
      case "right":
        // Triangle pointer pointing left
        ctx.moveTo(centerX + radius + 10, centerY);
        ctx.lineTo(centerX + radius - 10, centerY - pointerSize/2);
        ctx.lineTo(centerX + radius - 10, centerY + pointerSize/2);
        break;
      case "bottom":
        // Triangle pointer pointing up
        ctx.moveTo(centerX, centerY + radius + 10);
        ctx.lineTo(centerX - pointerSize/2, centerY + radius - 10);
        ctx.lineTo(centerX + pointerSize/2, centerY + radius - 10);
        break;
      case "left":
        // Triangle pointer pointing right
        ctx.moveTo(centerX - radius - 10, centerY);
        ctx.lineTo(centerX - radius + 10, centerY - pointerSize/2);
        ctx.lineTo(centerX - radius + 10, centerY + pointerSize/2);
        break;
      default:
        // Default to right pointer if config is invalid
        ctx.moveTo(centerX + radius + 10, centerY);
        ctx.lineTo(centerX + radius - 10, centerY - pointerSize/2);
        ctx.lineTo(centerX + radius - 10, centerY + pointerSize/2);
    }
    
    ctx.closePath();
    ctx.fillStyle = defaultConfig.pointer.color;
    ctx.fill();
  };
  
  // Update the wheel when angle or participants change
  useEffect(() => {
    drawWheel();
  }, [wheelAngle, participants]);
  
  // Using ResizeObserver instead of window.resize event
  useEffect(() => {
    const canvasContainer = canvasRef.current?.parentElement;
    if (!canvasContainer) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // Redraw wheel when container size changes
      drawWheel();
    });
    
    // Observe the canvas container
    resizeObserver.observe(canvasContainer);
    
    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Spin function - same as original
  const spinWheel = () => {
    if (isSpinning || participants.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const winnerIndex = getRandomWinnerIndex(participants);
    
    // Adjust target angle calculation for pointer position
    const getTargetAngleWithPointerPosition = (index: number, total: number, current: number) => {
      // Get the base target angle
      const baseTargetAngle = calculateTargetAngle(index, total, current);
      
      // Adjust based on pointer position
      const pointerPosition = defaultConfig.appearance.pointerPosition;
      let adjustment = 0;
      
      switch (pointerPosition) {
        case "top": // Default in physics.ts is bottom pointer, so add π
          adjustment = Math.PI;
          break;
        case "right": // Adjust by 3π/2
          adjustment = 3 * Math.PI / 2;
          break;
        case "bottom": // No adjustment needed
          adjustment = 0;
          break;
        case "left": // Adjust by π/2
          adjustment = Math.PI / 2;
          break;
      }
      
      return normalizeAngle(baseTargetAngle - adjustment);
    };
    
    const targetAngle = getTargetAngleWithPointerPosition(
      winnerIndex,
      participants.length,
      currentAngleRef.current
    );

    const totalRotation = calculateTotalRotation(
      targetAngle,
      currentAngleRef.current,
      defaultConfig
    );

    // Create a multi-phase animation using the approach described in the documentation
    const duration = defaultConfig.duration.total;
    const accelerationPhase = defaultConfig.duration.acceleration;
    const decelerationPhase = defaultConfig.duration.deceleration;
    const constantSpeedPhase = duration - (accelerationPhase + decelerationPhase);
    
    // Phase transition points (as decimal percentage of total duration)
    const p1 = accelerationPhase / duration;
    const p2 = (accelerationPhase + constantSpeedPhase) / duration;
    
    // Create a custom ease function with three phases - use a regular function, not gsap.utils.wrap
    const multiPhaseEase = function(progress: number) {
      if (progress < p1) {
        // Acceleration phase - easeInQuad
        return (progress / p1) * (progress / p1) * 0.15; // Scale to 15% of total rotation
      } else if (progress < p2) {
        // Constant speed phase - linear
        const phaseProgress = (progress - p1) / (p2 - p1);
        return 0.15 + phaseProgress * 0.55; // Scale from 15% to 70% of total rotation
      } else {
        // Deceleration phase - easeOutCubic
        const phaseProgress = (progress - p2) / (1 - p2);
        const easeValue = 1 - Math.pow(1 - phaseProgress, 3);
        return 0.7 + easeValue * 0.3; // Scale from 70% to 100% of total rotation
      }
    };
    
    animationRef.current = gsap.to(
      {},
      {
        duration: duration,
        onUpdate: function () {
          const progress = this.progress();
          const adjustedProgress = multiPhaseEase(progress);
          
          // Calculate rotation based on adjusted progress
          const rotationAmount = adjustedProgress * totalRotation;
          
          // Update wheel angle
          const newAngle = normalizeAngle(
            currentAngleRef.current + rotationAmount
          );
          currentAngleRef.current = newAngle;
          setWheelAngle(newAngle);
        },
        onComplete: function () {
          currentAngleRef.current = targetAngle;
          setWheelAngle(targetAngle);
          setIsSpinning(false);
          setWinner(participants[winnerIndex]);
          animationRef.current = null;
        },
        ease: "none", // We're using our custom easing in onUpdate
      }
    );
  };

  // Event handlers
  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddParticipant = (name: string) => {
    setParticipants((prev) => addParticipant(prev, name));
  };

  // Calculate current segment considering pointer position
  const adjustAngleForPointerPosition = (angle: number): number => {
    // Adjust angle based on pointer position (default calculation assumes top pointer)
    const pointerPosition = defaultConfig.appearance.pointerPosition;
    switch (pointerPosition) {
      case "top": // No adjustment needed for top pointer (0 radians)
        return angle;
      case "right": // Add π/2 (90 degrees) for right pointer
        return angle + Math.PI / 2;
      case "bottom": // Add π (180 degrees) for bottom pointer
        return angle + Math.PI;
      case "left": // Add 3π/2 (270 degrees) for left pointer
        return angle + (3 * Math.PI) / 2;
      default:
        return angle;
    }
  };
  
  // Calculate current segment
  const currentSegmentIndex = participants.length
    ? getSegmentAtAngle(adjustAngleForPointerPosition(wheelAngle), participants.length)
    : -1;

  const currentSegmentName =
    currentSegmentIndex >= 0 && currentSegmentIndex < participants.length
      ? participants[currentSegmentIndex]
      : "";

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-screen-xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Prize Wheel</h1>

      {/* Winner display */}
      <div className="min-h-[60px] flex items-center justify-center mb-4">
        {winner && !isSpinning ? (
          <WinnerDisplay winner={winner} isSpinning={isSpinning} />
        ) : (
          isSpinning &&
          currentSegmentName && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">
              <p className="font-bold">Current: {currentSegmentName}</p>
            </div>
          )
        )}
      </div>

      {/* Enhanced canvas container with shadow and proper positioning */}
      <div className="flex justify-center my-8">
        <div 
          style={{ 
            width: '400px', 
            height: '400px', 
            borderRadius: '50%',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            background: '#f8f9fa'
          }}
        >
          <canvas 
            ref={canvasRef} 
            width="400" 
            height="400" 
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
      </div>

      {/* Spin button */}
      <div className="mb-6">
        <SpinButton
          isSpinning={isSpinning}
          disabled={participants.length < 2}
          onClick={spinWheel}
        />
      </div>

      {/* Participants list */}
      <div className="w-full max-w-lg mx-auto">
        <ParticipantsList
          participants={participants}
          isSpinning={isSpinning}
          onRemove={handleRemoveParticipant}
          onAdd={handleAddParticipant}
        />
      </div>
    </div>
  );
}