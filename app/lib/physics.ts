/**
 * PHYSICS MODULE FOR WHEEL ANIMATION
 *
 * This module handles all mathematical calculations for the wheel's motion.
 *
 * IMPORTANT: Wheel configuration is managed in config.ts.
 * Do NOT modify wheel settings directly in this file.
 * Instead, update values in defaultConfig in config.ts.
 */

import { WheelConfig, easing } from "./config";

/**
 * Normalizes an angle to the range [0, 2π)
 *
 * This ensures angle values remain within a consistent range regardless of
 * how many rotations have occurred.
 *
 * @param angle Angle in radians to normalize
 * @returns Normalized angle in range [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Calculates the target angle for a specific winner
 *
 * The target angle positions the winning segment at the pointer location,
 * taking into account the current wheel rotation.
 *
 * @param winnerIndex Index of the winning participant
 * @param totalSegments Total number of segments on the wheel
 * @param currentAngle Current wheel rotation angle
 * @returns Target angle in radians
 */
export function calculateTargetAngle(
  winnerIndex: number,
  totalSegments: number,
  currentAngle: number
): number {
  // Get size of each segment
  const segmentSize = (2 * Math.PI) / totalSegments;

  // Calculate target angle based on pointer position
  // This uses Math.PI for bottom pointer (π radians = 6 o'clock)
  const rawTargetAngle = Math.PI + segmentSize * winnerIndex;

  // Normalize angle to [0, 2π)
  return normalizeAngle(rawTargetAngle);
}

/**
 * Calculates total rotation needed for the wheel to land on target
 *
 * This includes:
 * 1. A random number of full rotations
 * 2. Plus the additional rotation to reach the target angle
 *
 * @param targetAngle Target angle where wheel should stop
 * @param currentAngle Current wheel rotation angle
 * @param config Wheel configuration
 * @returns Total rotation amount in radians
 */
export function calculateTotalRotation(
  targetAngle: number,
  currentAngle: number,
  config: WheelConfig
): number {
  // Normalize current angle to [0, 2π)
  const normalizedCurrent = normalizeAngle(currentAngle);

  // Calculate minimum rotation to reach target from current position
  let minRotation = targetAngle - normalizedCurrent;

  // Add 2π if result is negative to ensure we always rotate forward
  if (minRotation <= 0) {
    minRotation += 2 * Math.PI;
  }

  // Get random number of full rotations between min and max
  const minRotations = config.physics.minRotations;
  const maxRotations = config.physics.maxRotations;
  const randomRotations =
    minRotations + Math.random() * (maxRotations - minRotations);

  // Convert random rotations to radians
  const fullRotations = randomRotations * 2 * Math.PI;

  // Return total rotation (full rotations + adjustment to target)
  return fullRotations + minRotation;
}

/**
 * Calculates the wheel rotation at a specific point in the animation
 *
 * This implements the 3-phase animation curve:
 * 1. Acceleration phase (0 to acceleration time)
 * 2. Constant speed phase (acceleration to deceleration start)
 * 3. Deceleration phase (deceleration start to end)
 *
 * @param elapsed Time elapsed since animation start (ms)
 * @param totalDuration Total animation duration (ms)
 * @param totalRotation Total rotation to complete (radians)
 * @param config Wheel configuration
 * @returns Rotation amount at the current time
 */
export function calculateRotationAtTime(
  elapsed: number,
  totalDuration: number,
  totalRotation: number,
  config: WheelConfig
): number {
  // Convert config times from seconds to milliseconds
  const accelerationPhase = config.duration.acceleration * 1000;
  const decelerationStart = totalDuration - config.duration.deceleration * 1000;

  // Cap at 100% progress
  if (elapsed >= totalDuration) {
    return totalRotation;
  }

  // Calculate rotation based on which phase we're in
  if (elapsed < accelerationPhase) {
    // Phase 1: Acceleration (0% to 15% of rotation)
    const phaseProgress = elapsed / accelerationPhase;
    return totalRotation * (easing.easeInQuad(phaseProgress) * 0.15);
  } else if (elapsed < decelerationStart) {
    // Phase 2: Constant speed (15% to 70% of rotation)
    const constantPhaseTotal = decelerationStart - accelerationPhase;
    const constantPhaseElapsed = elapsed - accelerationPhase;
    const constantPhaseProgress = constantPhaseElapsed / constantPhaseTotal;

    // Scale from 15% to 70% of total rotation
    return totalRotation * (0.15 + constantPhaseProgress * 0.55);
  } else {
    // Phase 3: Deceleration (70% to 100% of rotation)
    const decelerationPhaseTotal = config.duration.deceleration * 1000;
    const decelerationPhaseElapsed = elapsed - decelerationStart;
    const decelerationPhaseProgress =
      decelerationPhaseElapsed / decelerationPhaseTotal;

    // Scale from 70% to 100% with easing
    return (
      totalRotation *
      (0.7 + 0.3 * easing.easeOutCubic(decelerationPhaseProgress))
    );
  }
}

/**
 * Determines which segment is currently at the pointer position
 *
 * Used during animation to display the current segment name and
 * at the end to verify the correct winner.
 *
 * @param currentAngle Current wheel rotation angle
 * @param totalSegments Number of segments on the wheel
 * @returns Index of the segment at the pointer
 */
export function getSegmentAtAngle(
  currentAngle: number,
  totalSegments: number
): number {
  // Size of each segment
  const segmentSize = (2 * Math.PI) / totalSegments;

  // Calculate which segment is at the pointer (bottom = π radians)
  // We add π to adjust since our wheel has pointer at the bottom
  const adjustedAngle = normalizeAngle(currentAngle + Math.PI);

  // Find segment index
  return Math.floor(adjustedAngle / segmentSize) % totalSegments;
}

/**
 * Legacy function for backward compatibility
 *
 * @deprecated Use calculateTargetAngle instead
 */
export function calculateFinalAngle(
  winnerIndex: number,
  totalSegments: number
): number {
  const segmentAngle = (2 * Math.PI) / totalSegments;
  // This calculates for a top pointer (3π/2)
  return (3 * Math.PI) / 2 - winnerIndex * segmentAngle - segmentAngle / 2;
}
