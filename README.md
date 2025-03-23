# Name Spin Wheel

A web-based prize wheel application that randomly selects participants' names with a fixed 10-second spin animation.

## Features

- HTML5 Canvas-based rendering
- Fixed 10-second spin animation with realistic physics
- Random selection of winners
- Built with React, Next.js, TypeScript, and GSAP

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
2. Customizable wheel appearance (colors, size)
3. Confetti/celebration effect for winners
4. Spin history tracking
5. Weighted probability options
6. Add/edit participants form
7. Mobile responsiveness improvements
