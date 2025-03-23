# Name Spin Wheel

A web-based prize wheel application that randomly selects participants' names with a fixed 10-second spin animation.

## Features

- HTML5 Canvas-based rendering with high-DPI support
- Fixed 10-second spin animation with realistic physics and multi-phase easing
- Random selection of winners with visual highlighting effects
- Winner celebration animations and interactive UI elements
- Configurable pointer positions and wheel appearance
- Built with React, Next.js, TypeScript, and GSAP

## Major Challenges Solved

### Canvas Wheel Rendering (3/23/2025)
We solved a persistent issue where the wheel wasn't displaying properly - only showing a portion of the circle rather than the full wheel. After extensive debugging, we discovered this was caused by:

1. Over-engineered dimension management system trying to synchronize between CSS and TypeScript
2. Excessive component nesting creating positioning inconsistencies
3. SSR (Server-Side Rendering) complications with canvas dimensions

**Solution:** We drastically simplified the implementation by:
- Using fixed, explicit dimensions (400×400px) for the canvas
- Consolidating all wheel drawing logic in a single component
- Eliminating the complex dimension synchronization system
- Direct canvas manipulation with straightforward math

### Implementation Enhancements (3/23/2025)
Building on our simplified architecture, we've implemented several improvements:

1. **Visual Enhancements:**
   - High-DPI canvas support for retina displays
   - Winner segment highlighting with gradient effects
   - Improved wheel appearance with configurable colors
   - Enhanced UI elements with animations

2. **Technical Improvements:**
   - Replaced window event listeners with ResizeObserver
   - Created a multi-phase easing function for more realistic motion
   - Added support for different pointer positions
   - Implemented proper angle calculations for different configurations

3. **User Experience:**
   - Interactive button with visual feedback
   - Animated winner display with celebration effects
   - Improved container styling with shadows and proper positioning

## Getting Started

### Prerequisites

- Node.js 14.0 or later
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/namespin.git
cd namespin
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Run the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Animation Specifications

- **Total Spin Duration**: Fixed at 10 seconds exactly
- **Animation Curve**:
  - Phase 1: Quick acceleration (0.5 seconds)
  - Phase 2: Constant velocity (5.5 seconds)
  - Phase 3: Smooth deceleration (4 seconds)

## Wheel Configuration

The wheel's appearance and behavior are controlled through a single configuration file:

### Configuration File

All wheel settings are defined in `app/lib/config.ts`. This is the **single source of truth** for wheel configuration.

### To modify wheel size:

1. Open `app/lib/config.ts`
2. Locate the `dimensions` section in `defaultConfig`:
   ```typescript
   dimensions: {
     diameter: 400,      // Base size of wheel in pixels
     maxDiameter: 800,   // Maximum size on large screens
     mobileScale: 0.8,   // Scale factor for mobile (80% of base size)
   },
   ```
3. Modify the values as needed
4. CSS variables are automatically synchronized with these values

### To modify wheel colors:

1. Open `app/lib/config.ts`
2. Locate the `appearance.colors` array:
   ```typescript
   colors: [
     "#FF6384", // Pink
     "#36A2EB", // Blue
     "#FFCE56", // Yellow
     // etc.
   ],
   ```
3. Add, remove, or change colors as needed

### To modify animation timing:

1. Open `app/lib/config.ts`
2. Locate the `duration` section:
   ```typescript
   duration: {
     total: 10,          // Total spin animation duration
     acceleration: 0.5,  // Initial acceleration phase
     deceleration: 4,    // Final deceleration phase
   },
   ```
3. Adjust timing values as needed

## How the CSS Synchronization Works

The wheel configuration is synchronized between TypeScript and CSS:

1. Values are defined in `app/lib/config.ts`
2. CSS variables in `app/globals.css` reflect these values
3. A sync function in `WheelCanvas.tsx` keeps them in sync at runtime

This ensures a single source of truth for wheel dimensions and appearance.

## Future Enhancements

1. Sound effects during spin and for winner announcement
2. ✅ Customizable wheel appearance (colors, size) - Implemented in config.ts
3. ✅ Celebration effect for winners - Implemented with animations and highlighting
4. Spin history tracking
5. Weighted probability options
6. ✅ Add/edit participants form - Basic implementation complete
7. ✅ Mobile responsiveness improvements - Implemented with high-DPI support
8. Confetti explosion effect for winners
9. Dark mode support
10. Accessibility improvements for screen readers
11. Customizable spin duration and physics
