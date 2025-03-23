/**
 * WHEEL DIMENSION PROVIDER
 * 
 * SINGLE SOURCE OF TRUTH for all wheel dimensions.
 * All component dimensions MUST be derived from this service.
 * Never hardcode dimensions in component files.
 */

import { useEffect, useState } from 'react';

export interface WheelDimensions {
  /** Wheel radius in pixels */
  radius: number;

  /** Border thickness in pixels */
  borderWidth: number;

  /** Text size for segment labels */
  fontSize: number;

  /** Pointer size */
  pointerSize: number;
  
  /** Wheel container width */
  containerWidth: number;
  
  /** Wheel container height */
  containerHeight: number;
  
  /** Canvas width (may be different due to pixel ratio) */
  canvasWidth: number;
  
  /** Canvas height (may be different due to pixel ratio) */
  canvasHeight: number;
  
  /** Current scale factor */
  scaleFactor: number;
  
  /** Device pixel ratio for high-DPI displays */
  pixelRatio: number;
}

/**
 * Default base dimensions at reference resolution
 */
const BASE_DIMENSIONS = {
  // Base dimensions - container will be sized to match these
  baseContainerSize: 400,
  maxContainerSize: 800,
  mobileScale: 0.8,
  
  // Wheel parts - relative to container size
  baseRadius: 0.9, // 90% of container width
  baseBorderWidth: 2,
  baseFontSize: 16,
  basePointerSize: 20,
  
  // Reference width for scaling calculations
  referenceWidth: 1000,
};

/**
 * Custom hook to provide responsive wheel dimensions
 * 
 * This is used to calculate all dimensions based on container size
 * and ensure consistent scaling across the application.
 */
export function useDimensions(containerRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState<WheelDimensions>({
    radius: BASE_DIMENSIONS.baseContainerSize / 2 * BASE_DIMENSIONS.baseRadius,
    borderWidth: BASE_DIMENSIONS.baseBorderWidth,
    fontSize: BASE_DIMENSIONS.baseFontSize, 
    pointerSize: BASE_DIMENSIONS.basePointerSize,
    containerWidth: BASE_DIMENSIONS.baseContainerSize,
    containerHeight: BASE_DIMENSIONS.baseContainerSize,
    canvasWidth: BASE_DIMENSIONS.baseContainerSize,
    canvasHeight: BASE_DIMENSIONS.baseContainerSize,
    scaleFactor: 1,
    pixelRatio: 1,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Get the smaller of width/height to ensure a square
      const containerSize = Math.min(rect.width, rect.height);
      
      // Calculate scale factor based on container size
      const scaleFactor = containerSize / BASE_DIMENSIONS.baseContainerSize;
      
      // Update dimensions with new scale factor
      setDimensions({
        radius: containerSize / 2 * BASE_DIMENSIONS.baseRadius,
        borderWidth: BASE_DIMENSIONS.baseBorderWidth * scaleFactor,
        fontSize: BASE_DIMENSIONS.baseFontSize * scaleFactor,
        pointerSize: BASE_DIMENSIONS.basePointerSize * scaleFactor,
        containerWidth: containerSize,
        containerHeight: containerSize,
        canvasWidth: containerSize * pixelRatio,
        canvasHeight: containerSize * pixelRatio,
        scaleFactor,
        pixelRatio,
      });
    };

    // Initial update
    updateDimensions();
    
    // Create a ResizeObserver for reliable size tracking
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    // Start observing the container
    resizeObserver.observe(containerRef.current);
    
    // Also handle window resize events
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef]);

  return dimensions;
}

/**
 * Helper function to synchronize dimensions with CSS variables
 */
export function syncDimensionsWithCSS(dimensions: WheelDimensions) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(
      '--wheel-container-width',
      `${dimensions.containerWidth}px`
    );
    document.documentElement.style.setProperty(
      '--wheel-container-height', 
      `${dimensions.containerHeight}px`
    );
    document.documentElement.style.setProperty(
      '--wheel-radius',
      `${dimensions.radius}px`
    );
    document.documentElement.style.setProperty(
      '--wheel-border-width',
      `${dimensions.borderWidth}px`
    );
    document.documentElement.style.setProperty(
      '--wheel-font-size',
      `${dimensions.fontSize}px`
    );
    document.documentElement.style.setProperty(
      '--wheel-pointer-size',
      `${dimensions.pointerSize}px`
    );
  }
}

/**
 * Base configuration settings
 * These values are the starting point for dimension calculations
 */
export const BASE_CONFIG = BASE_DIMENSIONS;