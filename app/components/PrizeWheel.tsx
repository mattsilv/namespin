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

// Import our new components
import WheelCanvas from "./WheelCanvas";
import SpinButton from "./SpinButton";
import WinnerDisplay from "./WinnerDisplay";
import ParticipantsList from "./ParticipantsList";

/**
 * PrizeWheel Component
 *
 * This is the main orchestrator component that:
 * 1. Maintains state for participants, wheel angle, and spinning status
 * 2. Handles the wheel animation using GSAP
 * 3. Coordinates between physics calculations and visual rendering
 * 4. Manages user interactions like spinning and adding/removing participants
 *
 * COMPONENT ARCHITECTURE:
 * - PrizeWheel (this component): Main coordinator, manages state and animation
 *   ├─ WheelCanvas: Renders the wheel on canvas
 *   ├─ SpinButton: Triggers the spin animation
 *   ├─ WinnerDisplay: Shows the winner when spinning stops
 *   └─ ParticipantsList: Displays and manages participants
 *
 * DATA FLOW:
 * 1. User clicks Spin Button → calls spinWheel()
 * 2. Animation updates wheelAngle → passed to WheelCanvas
 * 3. WheelCanvas calls wheel.ts to render with new angle
 * 4. When spin completes, winner is displayed
 */
export default function PrizeWheel() {
  // ===== STATE =====
  // Participants list - names displayed on wheel segments
  const [participants, setParticipants] = useState<string[]>(
    getDefaultParticipants()
  );
  // Animation state - tracks if wheel is currently spinning
  const [isSpinning, setIsSpinning] = useState(false);
  // Winner state - set when spin animation completes
  const [winner, setWinner] = useState<string | null>(null);
  // Current wheel angle - passed to WheelCanvas for rendering
  const [wheelAngle, setWheelAngle] = useState(0);

  // ===== REFS =====
  // Refs persist between renders and don't trigger re-renders when changed
  // Current angle ref - used for animation calculations
  const currentAngleRef = useRef(0);
  // Animation ref - holds reference to the GSAP animation
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // ===== MAIN SPIN FUNCTION =====
  // This is the core function that handles the wheel spin animation
  const spinWheel = () => {
    // Don't allow spinning if already spinning or not enough participants
    if (isSpinning || participants.length < 2) return;

    // Update state to show spinning has started
    setIsSpinning(true);
    setWinner(null);

    // STEP 1: Pre-determine the winner randomly
    const winnerIndex = getRandomWinnerIndex(participants);

    // STEP 2: Calculate target angle to land on the winner
    // (This uses the physics.ts module)
    const targetAngle = calculateTargetAngle(
      winnerIndex,
      participants.length,
      currentAngleRef.current
    );

    // STEP 3: Calculate total rotation needed
    // (This includes random full rotations plus the angle to the target)
    const totalRotation = calculateTotalRotation(
      targetAngle,
      currentAngleRef.current,
      defaultConfig
    );

    // STEP 4: Set up GSAP animation for smooth 10-second spin
    animationRef.current = gsap.to(
      {},
      {
        duration: defaultConfig.duration.total, // 10 seconds
        onUpdate: function () {
          // Calculate progress of animation (0-1)
          const progress = this.progress();
          const elapsed = progress * defaultConfig.duration.total * 1000;

          // Calculate rotation at current time using physics.ts
          const rotationAmount = calculateRotationAtTime(
            elapsed,
            defaultConfig.duration.total * 1000,
            totalRotation,
            defaultConfig
          );

          // Update the wheel angle for this frame
          const newAngle = normalizeAngle(
            currentAngleRef.current + rotationAmount
          );
          currentAngleRef.current = newAngle;

          // Update state to trigger wheel re-rendering
          setWheelAngle(newAngle);
        },
        onComplete: function () {
          // Animation has finished

          // Set final position exactly on target
          currentAngleRef.current = targetAngle;
          setWheelAngle(targetAngle);

          // Update UI state
          setIsSpinning(false);
          setWinner(participants[winnerIndex]);

          // Clean up animation reference
          animationRef.current = null;
        },
        ease: "none", // We handle easing in our calculateRotationAtTime function
      }
    );
  };

  // ===== EVENT HANDLERS =====
  // Handler for removing a participant
  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler for adding a new participant
  const handleAddParticipant = (name: string) => {
    setParticipants((prev) => addParticipant(prev, name));
  };

  // ===== DERIVED DATA =====
  // Calculate which segment is currently at the pointer position
  const currentSegmentIndex = participants.length
    ? getSegmentAtAngle(wheelAngle, participants.length)
    : -1;

  // Get the name of the current segment for display during spinning
  const currentSegmentName =
    currentSegmentIndex >= 0 && currentSegmentIndex < participants.length
      ? participants[currentSegmentIndex]
      : "";

  // ===== CLEANUP =====
  // Clean up the animation when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  // ===== RENDER =====
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-4">Prize Wheel</h1>

      {/* Winner announcement or current segment */}
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

      {/* Full-width container for wheel with proper spacing */}
      <div className="w-full flex flex-col items-center justify-center">
        {/* Wheel canvas with fixed dimensions */}
        <div className="flex justify-center items-center w-full">
          <WheelCanvas
            participants={participants}
            currentAngle={wheelAngle}
            config={defaultConfig}
          />
        </div>

        {/* Spin button with margin */}
        <div className="mt-8 mb-8">
          <SpinButton
            isSpinning={isSpinning}
            disabled={participants.length < 2}
            onClick={spinWheel}
          />
        </div>
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
