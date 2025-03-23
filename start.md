# Prize Wheel Implementation Specification

## Overview

This document outlines the implementation plan for a web-based prize wheel that randomly selects participants' names with a fixed 10-second spin animation.

## Core Technical Approach

### Technology Stack

- **Primary Rendering**: HTML5 Canvas
- **Language**: TypeScript for type safety
- **Animation**: GSAP (GreenSock Animation Platform)
- **Optional Supporting Library**: Konva.js for canvas management

## Animation Specifications

### Spin Mechanics

- **Total Spin Duration**: Fixed at 10 seconds exactly
- **Animation Curve**:
  - Phase 1: Quick acceleration (0.5 seconds)
  - Phase 2: Constant velocity (5.5 seconds)
  - Phase 3: Smooth deceleration (4 seconds)
- **Rotation Amount**:
  - Minimum 5 full rotations
  - Maximum 8 full rotations
  - Plus the additional angle needed to land on the selected winner

### Timing Breakdown

```
0.0s - 0.5s: Acceleration (easeInQuad)
0.5s - 6.0s: Constant speed
6.0s - 10.0s: Deceleration (easeOutCubic)
10.0s: Complete stop exactly on selected segment
```

## Component Architecture

### 1. Configuration Module (`config.ts`)

```typescript
interface WheelConfig {
  duration: {
    total: number; // 10 seconds
    acceleration: number; // 0.5 seconds
    deceleration: number; // 4 seconds
  };
  appearance: {
    radius: number;
    colors: string[];
    borderWidth: number;
    textConfig: TextConfig;
  };
  physics: {
    minRotations: number;
    maxRotations: number;
  };
  pointer: PointerConfig;
}
```

### 2. Wheel Rendering Module (`wheel.ts`)

- Handles segment drawing and text placement
- Uses Canvas context to draw arcs and text
- Implements rotation animation

### 3. Physics Module (`physics.ts`)

- Calculates precise angles for predetermined outcomes
- Implements the three-phase animation curve
- Ensures smooth transition between phases

### 4. Participant Module (`participants.ts`)

- Manages list of participant names
- Handles addition/removal of participants
- Provides random selection functionality

### 5. UI Controller (`ui-controller.ts`)

- Manages user interaction
- Handles spin button state
- Displays winner announcement

## Implementation Details

### Winner Selection Logic

```typescript
function spinToWinner(participants: string[]): void {
  // 1. Pre-determine winner
  const winnerIndex = Math.floor(Math.random() * participants.length);

  // 2. Calculate target rotation (in radians)
  const segmentAngle = (2 * Math.PI) / participants.length;
  const targetAngle =
    (3 * Math.PI) / 2 - winnerIndex * segmentAngle - segmentAngle / 2;

  // 3. Calculate total rotation needed
  const rotations =
    config.physics.minRotations +
    Math.random() * (config.physics.maxRotations - config.physics.minRotations);
  const totalRotation = rotations * 2 * Math.PI + targetAngle - currentAngle;

  // 4. Start animation sequence with fixed 10-second duration
  animateWheel(totalRotation, 10000, winnerIndex);
}
```

### Animation Implementation

```typescript
function animateWheel(
  totalRotation: number,
  duration: number,
  winnerIndex: number
): void {
  const start = performance.now();
  const accelerationPhase = config.duration.acceleration * 1000;
  const decelerationStart = duration - config.duration.deceleration * 1000;

  function animate(timestamp: number) {
    const elapsed = timestamp - start;
    let progress = elapsed / duration;

    if (progress >= 1) {
      // Animation complete
      progress = 1;
      currentAngle = calculateFinalAngle(winnerIndex);
      renderWheel(currentAngle);
      announceWinner(winnerIndex);
      return;
    }

    // Calculate rotation based on animation phase
    if (elapsed < accelerationPhase) {
      // Acceleration phase
      const phaseProgress = elapsed / accelerationPhase;
      currentAngle += totalRotation * (easeInQuad(phaseProgress) * 0.15);
    } else if (elapsed < decelerationStart) {
      // Constant speed phase
      currentAngle += totalRotation * ((0.15 / duration) * 16.67); // Adjusted for 60fps
    } else {
      // Deceleration phase
      const phaseProgress =
        (elapsed - decelerationStart) / (config.duration.deceleration * 1000);
      currentAngle +=
        totalRotation * (0.15 * (1 - easeOutCubic(phaseProgress)));
    }

    renderWheel(currentAngle);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
```

## User Interface Elements

### Wheel Canvas

- Circular canvas, responsive to container size
- Segments colored in alternating high-contrast colors
- Text centered within segments, scaled appropriately

### Pointer Indicator

- Fixed triangle at top of wheel
- Contrasting color (e.g., bright red)
- No interaction with the wheel itself

### Spin Button

- Large, prominent button below the wheel
- Disabled during spin animation
- Re-enabled after winner announcement

### Participant Management

- Input field for adding new names
- List view showing all current participants
- Remove buttons for each participant

## Testing Requirements

### Visual Testing

- Verify smooth animation across all phases
- Ensure text remains readable during spin
- Confirm proper segment alignment with pointer

### Functional Testing

- Verify exact 10-second spin duration
- Test with varying numbers of participants (2-50)
- Ensure random distribution of winners over many spins

### Cross-Browser/Device Testing

- Test on Chrome, Firefox, Safari, Edge
- Verify performance on mobile devices
- Test on low-end devices to ensure animation remains smooth

## MVP Features & Future Enhancements

### MVP Requirements

- Wheel with dynamic segments based on participant list
- Fixed 10-second spin animation
- Clear winner indication
- Basic participant management
- Responsive design

### Future Enhancements

1. Sound effects during spin and for winner announcement
2. Customizable wheel appearance (colors, size)
3. Confetti/celebration effect for winners
4. Spin history tracking
5. Weighted probability options
6. Adjustable spin duration settings
7. "Realistic" physics options (clickable toggle)
8. Touch/swipe to spin for mobile
9. Multiple wheel templates/themes
10. Export/import participant lists

## Implementation Timeline Suggestion

1. **Week 1**: Core wheel rendering and basic animation
2. **Week 2**: Participant management and winner selection
3. **Week 3**: UI polishing and animation refinement
4. **Week 4**: Testing and performance optimization

This specification provides a balanced approach focusing on user experience rather than perfect physical simulation, with a fixed 10-second spin time as requested.
