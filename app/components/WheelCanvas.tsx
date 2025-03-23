"use client";

/**
 * WHEEL CANVAS COMPONENT
 *
 * This component renders the wheel on a canvas element.
 *
 * IMPORTANT: Wheel configuration is managed in config.ts.
 * Do NOT modify wheel appearance directly in this component.
 * Instead, update values in defaultConfig in config.ts.
 */

import React, { useRef, useEffect, useState } from "react";
import { WheelConfig } from "../lib/config";
import { renderWheel, resizeCanvas } from "../lib/wheel";

// Set to true to enable dimension debugging
const DEBUG_DIMENSIONS = true;

/**
 * Synchronizes CSS variables with the wheel config values
 * This ensures that both TypeScript and CSS use the same source of truth
 */
function syncConfigWithCSS(config: WheelConfig) {
  if (typeof document !== "undefined") {
    // Update CSS variables to match the config
    document.documentElement.style.setProperty(
      "--wheel-diameter",
      `${config.dimensions.diameter}px`
    );
    document.documentElement.style.setProperty(
      "--wheel-max-diameter",
      `${config.dimensions.maxDiameter}px`
    );
  }
}

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
function DebugDimensions({
  container,
  canvas,
}: {
  container: HTMLDivElement | null;
  canvas: HTMLCanvasElement | null;
}) {
  const [dimensions, setDimensions] = useState<{
    container: { width: number; height: number } | null;
    canvas: {
      style: { width: number; height: number } | null;
      actual: { width: number; height: number } | null;
    } | null;
    pixelRatio: number;
  }>({
    container: null,
    canvas: null,
    pixelRatio: 1,
  });

  useEffect(() => {
    if (!container || !canvas) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();

      setDimensions({
        container: {
          width: rect.width,
          height: rect.height,
        },
        canvas: {
          style: {
            width: parseFloat(canvas.style.width || "0"),
            height: parseFloat(canvas.style.height || "0"),
          },
          actual: {
            width: canvas.width,
            height: canvas.height,
          },
        },
        pixelRatio: window.devicePixelRatio || 1,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [container, canvas]);

  // Don't render if we don't have dimensions yet
  if (
    !dimensions.container ||
    !dimensions.canvas ||
    !dimensions.canvas.style ||
    !dimensions.canvas.actual
  ) {
    return null;
  }

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
        Container: {dimensions.container.width}x{dimensions.container.height}px
      </div>
      <div>
        CSS size: {dimensions.canvas.style.width}x
        {dimensions.canvas.style.height}px
      </div>
      <div>
        Canvas: {dimensions.canvas.actual.width}x
        {dimensions.canvas.actual.height}px
      </div>
      <div>Pixel ratio: {dimensions.pixelRatio}</div>
      <div>
        Config: {dimensions.container.width}x{dimensions.container.height}px
      </div>
    </div>
  );
}

/**
 * Renders a spinning wheel on a canvas element
 *
 * This component:
 * 1. Creates and manages the canvas element
 * 2. Handles resizing the canvas on window changes
 * 3. Delegates wheel rendering to the wheel.ts module
 * 4. Synchronizes config values with CSS variables
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

  // Sync config values with CSS on component mount and config changes
  useEffect(() => {
    syncConfigWithCSS(config);
  }, [config]);

  // Set up and maintain the wheel rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    // Resize the canvas to match its container
    resizeCanvas(canvas, container);

    // Get the 2D rendering context
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Render the wheel with the current angle
    renderWheel(ctx, participants, currentAngle, config);

    // Handle window resize events
    const handleResize = () => {
      resizeCanvas(canvas, container);
      renderWheel(ctx, participants, currentAngle, config);
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [participants, currentAngle, config]);

  // Render the container and canvas
  return (
    <div ref={containerRef} className="wheel-container">
      <canvas ref={canvasRef} className="wheel-canvas" />
      {DEBUG_DIMENSIONS && (
        <DebugDimensions
          container={containerRef.current}
          canvas={canvasRef.current}
        />
      )}
    </div>
  );
}
