/**
 * WHEEL CONFIGURATION - SINGLE SOURCE OF TRUTH
 *
 * This file defines ALL configuration for the wheel.
 * If you need to modify ANY aspect of the wheel, do it here.
 * Do NOT modify values directly in other files.
 *
 * IMPORTANT: This is the only file you should edit to:
 * - Change wheel size
 * - Adjust colors
 * - Modify animation timing
 * - Change text styling
 * - Alter physics behavior
 *
 * CSS SYNCHRONIZATION:
 * When you change wheel dimensions here, the CSS variables will be
 * automatically updated through the syncConfigWithCSS function in WheelCanvas.tsx.
 * This ensures both the JavaScript code and CSS use the same values.
 */

/**
 * Main configuration interface for the Prize Wheel
 * All properties are divided into logical categories.
 */
export interface WheelConfig {
  // Visual dimensions
  dimensions: {
    // Base diameter in pixels for the wheel (canvas is sized relative to this)
    // This value is synchronized with the CSS variable --wheel-diameter
    diameter: number;
    // Maximum diameter on larger screens
    // This value is synchronized with the CSS variable --wheel-max-diameter
    maxDiameter: number;
    // Scale factor for mobile devices (applied to diameter)
    // This value is used in the CSS media query for small screens
    mobileScale: number;
  };

  // Appearance settings
  appearance: {
    // Colors for wheel segments (rotated through for each participant)
    colors: string[];
    // Border styling
    borderWidth: number;
    borderColor: string;
    // Center hub color
    centerColor: string;
    // Text styling
    textConfig: {
      fontSize: number;
      fontFamily: string;
      color: string;
    };
    // Position of the pointer ("top", "right", "bottom", "left")
    pointerPosition: "top" | "right" | "bottom" | "left";
  };

  // Pointer styling
  pointer: {
    size: number;
    color: string;
  };

  // Animation timing (in seconds)
  duration: {
    total: number; // Total animation time
    acceleration: number; // Initial speed-up phase
    deceleration: number; // Final slow-down phase
    // This is not directly used but derived from total - (acceleration + deceleration)
    constant?: number; // Middle constant-speed phase
  };

  // Physics parameters for wheel rotation
  physics: {
    minRotations: number; // Minimum full rotations
    maxRotations: number; // Maximum full rotations
  };
}

/**
 * Default configuration settings
 *
 * MODIFY THESE VALUES to adjust the wheel behavior and appearance.
 * This is the ONLY place you should change wheel configuration values.
 *
 * SIZE CHANGES:
 * When changing dimensions here, the CSS will be automatically updated, but
 * you should verify that the wheel displays correctly at different screen sizes.
 */
export const defaultConfig: WheelConfig = {
  // SIZE CONFIGURATION - Adjust these to change wheel dimensions
  dimensions: {
    diameter: 400, // Base size of wheel in pixels
    maxDiameter: 800, // Maximum size on large screens
    mobileScale: 0.8, // Scale factor for mobile (80% of base size)
  },

  // APPEARANCE CONFIGURATION - Colors and visual styling
  appearance: {
    // Segment colors - add/remove colors as needed
    colors: [
      "#FF6384", // Pink
      "#36A2EB", // Blue
      "#FFCE56", // Yellow
      "#4BC0C0", // Teal
      "#9966FF", // Purple
      "#FF9F40", // Orange
      "#7BC043", // Green
      "#F37735", // Coral
    ],

    // Border styling - width in pixels, color as hex
    borderWidth: 2,
    borderColor: "#333333",

    // Center hub color
    centerColor: "#FFFFFF",

    // Text styling
    textConfig: {
      fontSize: 16, // Text size in pixels
      fontFamily: "var(--font-montagu-slab), serif",
      color: "#FFFFFF", // Text color
    },

    // Pointer position
    pointerPosition: "top", // Where the wheel indicator is
  },

  // POINTER CONFIGURATION
  pointer: {
    size: 20, // Size in pixels
    color: "#E63946", // Pointer color
  },

  // ANIMATION TIMING - All values in seconds
  duration: {
    total: 10, // Total spin animation duration
    acceleration: 0.5, // Initial acceleration phase
    deceleration: 4, // Final deceleration phase
    // constant is calculated automatically (10 - 0.5 - 4 = 5.5)
  },

  // PHYSICS CONFIGURATION
  physics: {
    minRotations: 5, // Minimum number of full rotations
    maxRotations: 8, // Maximum number of full rotations
  },
};

/**
 * Easing functions for animation
 * These control how the wheel accelerates and decelerates.
 */
export const easing = {
  // Acceleration phase - quadratic ease-in
  easeInQuad: (t: number): number => t * t,

  // Deceleration phase - cubic ease-out
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

  // Linear ease (constant speed)
  linear: (t: number): number => t,
};

/**
 * Default participants for testing
 * You can modify this list or replace it with your own.
 */
export const defaultParticipants = [
  "Alice",
  "Bob",
  "Charlie",
  "Dave",
  "Eva",
  "Frank",
];
