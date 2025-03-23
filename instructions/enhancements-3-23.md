# Interactive Prize Wheel Architecture & Standards Guide

## Implementation Challenges & Lessons Learned (3/23/2025)

### What Led Us Astray
- **Over-engineered dimension management**: Trying to create a "single source of truth" for dimensions with complex synchronization between CSS variables and TypeScript objects.
- **Component nesting complexity**: Separating wheel logic into too many components (PrizeWheel → WheelCanvas → wheel.ts) created positioning and rendering issues.
- **SSR complications with canvas**: Next.js server-side rendering caused inconsistencies with client-side canvas dimensions.
- **Dynamic sizing and responsiveness**: Attempting to dynamically resize the wheel based on container size caused unpredictable rendering results.
- **Reliance on external libraries**: Depending on animation libraries and frameworks for simple canvas operations added complexity.

### The Core Problem
The wheel consistently failed to display properly because:
1. We were using a complex dimension management system that tried to synchronize between CSS and TypeScript
2. The nested component architecture caused positioning misalignments
3. The canvas was being drawn at inconsistent sizes across different rendering contexts

### The Solution
We simplified the entire approach by:
1. Using fixed, explicit dimensions (400×400px) for the canvas
2. Consolidating all wheel drawing logic in a single component
3. Removing the dimension synchronization system completely
4. Directly manipulating the canvas with straightforward math
5. Eliminating unnecessary abstractions and dependencies

## Enhanced Implementation (3/23/2025 Update)

After establishing the simplified architecture, we've implemented the following enhancements:

### Recent Enhancements
1. **High-DPI Canvas Support**: Added proper scaling for retina displays
   - Applied devicePixelRatio to canvas dimensions
   - Adjusted drawing operations to maintain visual sharpness
   
2. **Modern Performance Optimizations**:
   - Replaced window.addEventListener with ResizeObserver for more efficient resizing
   - Implemented GSAP with custom multi-phase easing functions for smoother animations
   
3. **Visual Improvements**:
   - Added winner highlighting with gradients and glow effects
   - Implemented dynamic pointer positions based on configuration
   - Enhanced container styling with drop shadows and proper positioning
   - Improved WinnerDisplay component with GSAP animations
   - Created a more interactive SpinButton with visual feedback during spinning
   
4. **Code Structure Improvements**:
   - Better integration with the config.ts system
   - Support for different pointer positions through configuration
   - Proper angle calculations based on pointer position
   - Consolidated animation logic with three-phase easing

### Key Functionality Added
- Winner highlighting with visual effects
- Multi-phase wheel animation with proper physics
- Improved button and winner display animations
- Better high-DPI display support
- More consistent animation behavior

All these enhancements maintain the simplified architecture while improving the visual experience, keeping with our principle of "simplicity over complexity" for stable, predictable rendering.

## 1. Overview and Philosophy

The prize wheel should strike a balance between realism and usability, focusing on smooth animations and clear user feedback rather than perfect physical simulation. Our implementation prioritizes:

- Fixed 10-second spin animation for consistency
- Clean visual design with clear segment boundaries
- Predictable user experience over complex physics
- Simple, maintainable code over complex abstractions
- Explicit dimensions and direct canvas manipulation

## 2. Technical Stack

- **Primary Rendering**: HTML5 Canvas via Konva.js
- **Language**: TypeScript for type safety and documentation
- **Animation**: GSAP (GreenSock Animation Platform) or Konva.Animation
- **Build System**: Modern bundler (Webpack/Vite) with TypeScript support

## 3. Core Architecture

### File Structure

```
prize-wheel/
├── src/
│   ├── core/
│   │   ├── dimensions/           # DIMENSION SOURCE OF TRUTH
│   │   │   ├── dimension-provider.ts
│   │   │   └── types.ts
│   │   ├── config/               # Configuration settings
│   │   │   ├── wheel-config.ts
│   │   │   └── animation-config.ts
│   │   └── events/               # Application event system
│   ├── components/
│   │   ├── wheel/                # Wheel rendering and animation
│   │   │   ├── wheel.component.ts
│   │   │   ├── segment.ts
│   │   │   └── pointer.ts
│   │   └── controls/             # UI controls
│   │       ├── participant-list.ts
│   │       └── spin-button.ts
│   ├── services/
│   │   ├── physics.service.ts    # Animation calculations
│   │   ├── participant.service.ts # Participant data management
│   │   └── storage.service.ts    # Optional: data persistence
│   ├── utils/                    # Helper utilities
│   │   ├── angle.utils.ts
│   │   └── canvas.utils.ts
│   └── index.ts                  # Application entry point
├── tests/                        # Test suite
└── docs/                         # Documentation
```

### Component Interactions

```
DimensionProvider → Wheel Component → Segments
            ↑                    ↓
            ↑        Physics Service ← Animation Config
   ResizeObserver                ↓
                        Participant Service
                                 ↓
                          UI Components
```

## 4. Dimension Management (SINGLE SOURCE OF TRUTH)

### Central Dimension Provider

```typescript
/**
 * @file src/core/dimensions/dimension-provider.ts
 *
 * @description SINGLE SOURCE OF TRUTH FOR ALL WHEEL DIMENSIONS
 * All component dimensions MUST be derived from this service.
 * Never hardcode dimensions in component files.
 */
export class DimensionProvider {
  // Base dimensions at reference resolution
  private baseRadius = 250;
  private baseBorderWidth = 5;
  private baseTextSize = 16;
  private basePointerSize = 40;

  // Current scale factor based on container size
  private scaleFactor = 1;
  private observers: Array<(dimensions: WheelDimensions) => void> = [];

  // Update method called on resize
  updateScale(containerWidth: number): void {
    this.scaleFactor = containerWidth / 1000; // Reference width
    this.notifyObservers();
  }

  // Subscribe to dimension changes
  subscribe(callback: (dimensions: WheelDimensions) => void): void {
    this.observers.push(callback);
    callback(this.getDimensions()); // Initial call
  }

  // Get computed dimensions
  getDimensions(): WheelDimensions {
    return {
      radius: this.baseRadius * this.scaleFactor,
      borderWidth: this.baseBorderWidth * this.scaleFactor,
      fontSize: this.baseTextSize * this.scaleFactor,
      pointerSize: this.basePointerSize * this.scaleFactor,
      // Other computed dimensions...
    };
  }

  private notifyObservers(): void {
    const dimensions = this.getDimensions();
    this.observers.forEach((callback) => callback(dimensions));
  }
}
```

### Dimension Types

```typescript
/**
 * @file src/core/dimensions/types.ts
 */
export interface WheelDimensions {
  /** Wheel radius in pixels */
  radius: number;

  /** Border thickness in pixels */
  borderWidth: number;

  /** Text size for segment labels */
  fontSize: number;

  /** Pointer size */
  pointerSize: number;

  // Other dimensions...
}
```

## 5. Animation Specification

### Fixed 10-Second Animation

```typescript
/**
 * @file src/core/config/animation-config.ts
 */
export const AnimationConfig = {
  duration: {
    total: 10000, // 10 seconds total
    acceleration: 500, // 0.5 seconds
    constantSpeed: 5500, // 5.5 seconds
    deceleration: 4000, // 4 seconds
  },
  physics: {
    minRotations: 5, // Minimum full rotations
    maxRotations: 8, // Maximum full rotations
  },
};
```

### Animation Implementation

```typescript
/**
 * @file src/services/physics.service.ts
 */
export class PhysicsService {
  /**
   * Creates an animation timeline for spinning the wheel
   * @param winnerIndex The predetermined winner
   * @returns Animation timeline
   */
  createSpinAnimation(winnerIndex: number): Animation {
    // Pre-determine winner
    const targetAngle = this.calculateTargetAngle(winnerIndex);

    // Calculate total rotation
    const rotations = this.calculateRandomRotations();
    const totalRotation = rotations * 2 * Math.PI + targetAngle;

    // Create animation with three phases
    return {
      duration: AnimationConfig.duration.total,
      easing: this.createMultiPhaseEasing(),
      onUpdate: (progress) => {
        // Calculate current angle based on progress
        const currentAngle = progress * totalRotation;
        return currentAngle;
      },
    };
  }

  /**
   * Creates a multi-phase easing function for natural wheel spin
   */
  private createMultiPhaseEasing(): (progress: number) => number {
    const { total, acceleration, constantSpeed, deceleration } =
      AnimationConfig.duration;

    // Phase transition points
    const p1 = acceleration / total;
    const p2 = (acceleration + constantSpeed) / total;

    return (progress: number) => {
      if (progress < p1) {
        // Acceleration phase - easeInQuad
        return (progress / p1) * (progress / p1);
      } else if (progress < p2) {
        // Constant speed phase - linear
        return (progress - p1) / (p2 - p1);
      } else {
        // Deceleration phase - easeOutCubic
        const t = (progress - p2) / (1 - p2);
        return 1 - Math.pow(1 - t, 3);
      }
    };
  }
}
```

## 6. Konva.js Implementation

### High-DPI Canvas Setup

```typescript
/**
 * Configures canvas for high-DPI displays using Konva
 */
function setupHiDPICanvas(container: string): Konva.Stage {
  // Get container element
  const containerEl = document.getElementById(container);
  const width = containerEl.clientWidth;
  const height = width; // Keep it square

  // Create stage
  const stage = new Konva.Stage({
    container: container,
    width: width,
    height: height,
  });

  // Handle high DPI displays
  const pixelRatio = window.devicePixelRatio || 1;
  stage.scale({ x: pixelRatio, y: pixelRatio });

  // Adjust for device pixel ratio
  stage.width(width * pixelRatio);
  stage.height(height * pixelRatio);
  stage.scale({ x: pixelRatio, y: pixelRatio });
  containerEl.style.width = `${width}px`;
  containerEl.style.height = `${height}px`;

  return stage;
}
```

### Wheel Component with Konva

```typescript
/**
 * @file src/components/wheel/wheel.component.ts
 *
 * @dimension-consumer
 * This component consumes dimensions from DimensionProvider.
 * NEVER define dimensions here - use dimensionProvider.getDimensions() only.
 */
export class WheelComponent {
  private stage: Konva.Stage;
  private wheelLayer: Konva.Layer;
  private staticLayer: Konva.Layer;
  private segments: Konva.Group;
  private pointer: Konva.Group;

  constructor(
    private container: string,
    private dimensionProvider: DimensionProvider,
    private physicsService: PhysicsService,
    private participantService: ParticipantService
  ) {
    this.stage = setupHiDPICanvas(container);
    this.initLayers();

    // Subscribe to dimension changes
    this.dimensionProvider.subscribe(this.updateDimensions.bind(this));

    // Subscribe to participant changes
    this.participantService.subscribe(this.updateSegments.bind(this));

    // Set up resize observer
    this.setupResizeHandler();
  }

  /**
   * Updates wheel based on dimension changes
   * @param dimensions Current dimensions
   */
  private updateDimensions(dimensions: WheelDimensions): void {
    // Update wheel size
    // Never use hardcoded values here!
    const { radius } = dimensions;

    // Update components with new dimensions
    this.updateWheelSize(radius);
    this.updatePointerSize(dimensions);
    this.updateSegments(this.participantService.getParticipants());

    // Redraw all layers
    this.stage.batchDraw();
  }

  /**
   * Spins the wheel to a randomly selected winner
   */
  spin(): Promise<string> {
    return new Promise((resolve) => {
      // Select random winner
      const participants = this.participantService.getParticipants();
      const winnerIndex = Math.floor(Math.random() * participants.length);

      // Create animation
      const animation = this.physicsService.createSpinAnimation(winnerIndex);

      // Execute animation
      const konvaAnim = new Konva.Animation((frame) => {
        const elapsed = frame.time;
        const progress = Math.min(elapsed / animation.duration, 1);

        // Get current angle from animation
        const angle = animation.onUpdate(animation.easing(progress));

        // Apply rotation
        this.segments.rotation(angle * (180 / Math.PI));

        // Check if animation is complete
        if (progress >= 1) {
          konvaAnim.stop();
          resolve(participants[winnerIndex]);
        }
      }, this.wheelLayer);

      // Start animation
      konvaAnim.start();
    });
  }

  // Other methods...
}
```

## 7. Responsive Design

### ResizeObserver Implementation

```typescript
/**
 * Sets up responsive resizing for the wheel
 */
private setupResizeHandler(): void {
  const containerEl = document.getElementById(this.container);

  // Use ResizeObserver for reliable size tracking
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const width = entry.contentRect.width;
      const height = width; // Keep it square

      // Update stage size
      this.stage.width(width);
      this.stage.height(height);

      // Update dimensions
      this.dimensionProvider.updateScale(width);
    }
  });

  resizeObserver.observe(containerEl);
}
```

## 8. Documentation Standards

### Component Documentation

````typescript
/**
 * @component SpinButton
 *
 * @description
 * Button that triggers the wheel spinning animation.
 *
 * @dimension-consumer
 * Consumes button dimensions from DimensionProvider.
 *
 * @responsibilities
 * - Trigger wheel spin animation
 * - Disable during spinning
 * - Re-enable after spin completion
 *
 * @example
 * ```
 * const spinButton = new SpinButton(
 *   'spin-button',
 *   dimensionProvider,
 *   () => wheel.spin()
 * );
 * ```
 */
````

### Dimension Documentation

```typescript
/**
 * DIMENSION MANAGEMENT RULES:
 *
 * 1. ✅ ALWAYS use DimensionProvider for any size/position
 * 2. ❌ NEVER hardcode pixel values in components
 * 3. ✅ ALL component sizing must be reactive to dimension changes
 * 4. ❌ NEVER create separate scaling logic outside DimensionProvider
 *
 * @example
 * // CORRECT:
 * const radius = dimensionProvider.getDimensions().radius;
 *
 * // INCORRECT:
 * const radius = 250; // Hardcoded value
 */
```

## 9. Cursor Rules for Code Quality

Creating a `.cursorrules` file for your IDE or editor will help maintain consistency. Here's a recommended configuration:

```json
{
  "rules": [
    {
      "name": "No hardcoded dimensions",
      "pattern": "\\b(width|height|radius|size|margin|padding)\\s*=\\s*\\d+",
      "severity": "error",
      "message": "Do not hardcode dimensions. Use DimensionProvider instead."
    },
    {
      "name": "Use DimensionProvider",
      "pattern": "new\\s+Konva\\.(Circle|Rect|Group|Shape|Text)\\(\\{[^}]*?\\b(width|height|radius)\\s*:\\s*\\d+",
      "severity": "error",
      "message": "Konva shapes must use DimensionProvider for dimensions."
    },
    {
      "name": "Enforce typed animations",
      "pattern": "new\\s+Konva\\.Animation\\([^,]+,\\s*[^,]+\\)",
      "severity": "warning",
      "message": "Animation should use strongly typed factories from PhysicsService."
    },
    {
      "name": "Direct DOM manipulation",
      "pattern": "document\\.getElementById\\([^)]+\\)\\.style",
      "severity": "warning",
      "message": "Prefer Konva methods over direct DOM manipulation."
    },
    {
      "name": "Usage of setTimeout for animations",
      "pattern": "setTimeout\\(\\s*[^,]+,\\s*\\d+\\s*\\)",
      "severity": "error",
      "message": "Use Konva.Animation or GSAP instead of setTimeout for animations."
    },
    {
      "name": "Magic numbers in calculations",
      "pattern": "\\*\\s*\\d+\\.\\d+|\\/\\s*\\d+\\.\\d+",
      "severity": "warning",
      "message": "Avoid magic numbers. Use named constants or config values."
    },
    {
      "name": "Wheel specific: Segment angle calculation",
      "pattern": "2\\s*\\*\\s*Math\\.PI\\s*\\/\\s*[^;.]+",
      "severity": "info",
      "message": "Consider using a precomputed segmentAngle from Wheel component."
    },
    {
      "name": "Dimension updates on resize",
      "pattern": "window\\.addEventListener\\(\\s*['\"]resize['\"]",
      "severity": "warning",
      "message": "Use ResizeObserver instead of window.resize event."
    }
  ],
  "ignore": ["**/node_modules/**", "**/dist/**", "**/tests/**"]
}
```

## 10. Progressive Enhancement Strategy

Start with a minimal viable implementation and improve incrementally:

1. **Base Implementation (MVP)**

   - Fixed 10-second spin animation
   - Static pointer at top
   - Basic participant management
   - Plain colors for segments

2. **First Enhancements**

   - Smooth transitions between states
   - Basic sound effects
   - Winner highlighting
   - Responsive resizing

3. **Extended Features**

   - Custom colors and themes
   - Confetti/celebration effects
   - Multiple wheel templates
   - History of spins

4. **Advanced Options**
   - Weighted probability
   - Adjustable spin time
   - Custom pointer styles
   - Touch/swipe to spin

Always maintain backward compatibility when enhancing features. Each new feature should be built as a modular addition that doesn't break existing functionality.

## 11. Testing Recommendations

1. **Visual Testing**

   - Test wheel appearance with different participant counts
   - Verify text readability during spinning
   - Confirm proper alignment of pointer with segments
   - Test on various screen sizes and pixel densities

2. **Functional Testing**

   - Verify 10-second spin duration is consistent
   - Test with varying numbers of participants (2-50)
   - Ensure random distribution of winners over many spins
   - Test all user interactions (add/remove participants, spin)

3. **Performance Testing**

   - Measure frame rate during animation
   - Test on low-end devices
   - Verify smooth animation with many segments
   - Check memory usage during long sessions

4. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Verify mobile browser compatibility
   - Test touch interactions on mobile devices
   - Check high-DPI display rendering

Create automated tests where possible, especially for dimension calculations and animation physics.
