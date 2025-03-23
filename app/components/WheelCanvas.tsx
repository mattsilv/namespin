"use client";

/**
 * WHEEL CANVAS COMPONENT
 *
 * This component renders the wheel on a canvas element.
 *
 * IMPORTANT: Wheel configuration is managed in config.ts.
 * Do NOT modify wheel appearance directly in this component.
 * Instead, update values in defaultConfig in config.ts.
 * 
 * DIMENSIONS: All dimensions are now managed through the
 * dimension provider in dimensions.ts.
 */

import React, { useRef } from "react";
import { WheelConfig } from "../lib/config";
import { drawWheel, resizeCanvas } from "../lib/wheel";
import { useDimensions, syncDimensionsWithCSS, WheelDimensions } from "../lib/dimensions";

// Set to true to enable dimension debugging
const DEBUG_DIMENSIONS = true;

/**
 * Props for the WheelCanvas component
 */
interface WheelCanvasProps {
  // The list of participant names to display on wheel segments
  participants: string[];
  // The current rotation angle of the wheel (changes during animation)
  currentAngle: number;
  // Configuration settings for wheel appearance and behavior
  config: WheelConfig;
}

/**
 * Debug component to show dimension information
 */
function DebugDimensions({ dimensions }: { dimensions: WheelDimensions }) {
  const debugStyle = {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "5px",
    fontSize: "11px",
    zIndex: 1000,
    fontFamily: "monospace",
    borderRadius: "4px",
    pointerEvents: "none",
  } as React.CSSProperties;

  return (
    <div style={debugStyle}>
      <div>
        Container: {dimensions.containerWidth}x{dimensions.containerHeight}px
      </div>
      <div>
        Canvas: {dimensions.canvasWidth}x{dimensions.canvasHeight}px
      </div>
      <div>Radius: {dimensions.radius}px</div>
      <div>Scale factor: {dimensions.scaleFactor.toFixed(2)}</div>
      <div>Pixel ratio: {dimensions.pixelRatio}</div>
    </div>
  );
}

/**
 * Renders a spinning wheel on a canvas element
 *
 * This component:
 * 1. Creates and manages the canvas element
 * 2. Uses dimension provider to handle responsive sizing
 * 3. Delegates wheel rendering to the wheel.ts module
 * 4. Synchronizes dimension values with CSS variables
 *
 * @param participants Array of participant names to display on the wheel
 * @param currentAngle Current wheel rotation angle (in radians)
 * @param config Wheel configuration settings from config.ts
 */
export default function WheelCanvas({
  participants,
  currentAngle,
  config,
}: WheelCanvasProps) {
  // Reference to the canvas DOM element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Reference to the containing div element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get responsive dimensions from our dimension provider
  const dimensions = useDimensions(containerRef);
  
  // Synchronize dimensions with CSS variables
  syncDimensionsWithCSS(dimensions);
  
  // Render the wheel whenever dimensions, participants or angle changes
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    // Resize the canvas using dimensions from our provider
    resizeCanvas(canvas, container, dimensions);

    // Get the 2D rendering context
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Render the wheel with the current angle and dimensions
    drawWheel(ctx, participants, currentAngle, config, { radius: dimensions.radius });
  }, [participants, currentAngle, config, dimensions]);

  // Render the container and canvas
  return (
    <div ref={containerRef} className="wheel-container">
      <canvas ref={canvasRef} className="wheel-canvas" />
      {DEBUG_DIMENSIONS && <DebugDimensions dimensions={dimensions} />}
    </div>
  );
}
