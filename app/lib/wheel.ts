/**
 * WHEEL RENDERING MODULE
 *
 * This module handles rendering the prize wheel on the canvas.
 *
 * IMPORTANT: Configuration values for the wheel are stored in config.ts.
 * Do NOT modify values directly in this file. Instead:
 * 1. Go to config.ts
 * 2. Update values in the defaultConfig object
 * 3. See comments in config.ts for details on each setting
 */

import { WheelConfig } from "./config";
import { normalizeAngle } from "./physics";

/**
 * WHEEL RENDERING PIPELINE
 *
 * The rendering pipeline works as follows:
 * 1. Canvas size is set by resizeCanvas() to match the container dimensions
 * 2. renderWheel() draws the wheel and pointer on the canvas
 * 3. The wheel is drawn centered on the canvas with a radius that fits within the canvas
 * 4. The pointer is positioned relative to the wheel
 *
 * COORDINATE SYSTEM
 * - Origin (0,0) is at the top-left corner of the canvas
 * - Canvas dimensions are determined by the wheel-container CSS
 * - Wheel is centered at (centerX, centerY)
 * - Angles are in radians, with 0 pointing right (3 o'clock)
 */

/**
 * Renders the wheel on the canvas with the given rotation angle.
 *
 * This is the main entry point for wheel rendering, called from the WheelCanvas
 * component each time the wheel angle changes.
 *
 * @param ctx Canvas rendering context
 * @param participants List of participant names to display on segments
 * @param angle Current rotation angle of the wheel in radians
 * @param config Wheel configuration object from config.ts
 * @param dimensions Wheel dimensions from the dimension provider
 */
export function drawWheel(
  ctx: CanvasRenderingContext2D,
  participants: string[],
  angle: number,
  config: WheelConfig,
  dimensions?: { radius: number } // Optional dimension override
): void {
  // Get canvas dimensions
  const { width, height } = ctx.canvas;

  // Clear the entire canvas
  ctx.clearRect(0, 0, width, height);

  // Draw a white background for consistent appearance
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Calculate center of canvas
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  // Calculate wheel radius based on available space
  // If dimensions are provided, use that radius, otherwise calculate based on canvas size
  const radius = dimensions?.radius || Math.min(centerX, centerY) * 0.9;

  // Draw the wheel segments
  drawWheelSegments(ctx, centerX, centerY, radius, participants, angle, config);

  // Draw the center hub
  drawWheelCenter(ctx, centerX, centerY, radius * 0.1, config);

  // Draw the pointer at the specified position
  drawPointer(ctx, centerX, centerY, radius, config);
}

// Export the function with the name that's imported in WheelCanvas.tsx
export const renderWheel = drawWheel;

/**
 * Draws the colored segments of the wheel and participant names
 *
 * @param ctx Canvas rendering context
 * @param centerX X coordinate of wheel center
 * @param centerY Y coordinate of wheel center
 * @param radius Radius of the wheel in pixels
 * @param participants Array of participant names
 * @param angle Current rotation angle in radians
 * @param config Wheel configuration from config.ts
 */
function drawWheelSegments(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  participants: string[],
  angle: number,
  config: WheelConfig
): void {
  // Handle empty wheel case
  if (participants.length === 0) {
    // Draw empty wheel
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#CCCCCC";
    ctx.fill();
    ctx.lineWidth = config.appearance.borderWidth;
    ctx.strokeStyle = config.appearance.borderColor;
    ctx.stroke();

    // Show message to add names
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Add names to spin", centerX, centerY);
    return;
  }

  // Draw outer circle for wheel boundary
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = config.appearance.borderWidth;
  ctx.strokeStyle = config.appearance.borderColor;
  ctx.stroke();

  // Calculate angle size for each segment
  const segmentAngle = (2 * Math.PI) / participants.length;

  // Draw each segment with name
  for (let i = 0; i < participants.length; i++) {
    // Calculate segment angles
    const startAngle = normalizeAngle(angle + i * segmentAngle);
    const endAngle = normalizeAngle(startAngle + segmentAngle);

    // Select color from the config colors array
    const colorIndex = i % config.appearance.colors.length;
    const fillColor = config.appearance.colors[colorIndex];

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Draw border
    ctx.lineWidth = config.appearance.borderWidth;
    ctx.strokeStyle = config.appearance.borderColor;
    ctx.stroke();

    // Draw text in segment
    drawSegmentText(
      ctx,
      centerX,
      centerY,
      radius,
      participants[i],
      startAngle,
      endAngle,
      config
    );
  }
}

/**
 * Draws text on a wheel segment, aligned with the segment's arc
 */
function drawSegmentText(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  text: string,
  startAngle: number,
  endAngle: number,
  config: WheelConfig
): void {
  // Calculate middle angle of the segment
  const middleAngle = (startAngle + endAngle) / 2;

  // Calculate segment size in radians
  const segmentAngle = endAngle - startAngle;

  // Position text at 65% of radius from center
  const textRadius = radius * 0.65;

  // Save current canvas state
  ctx.save();

  // Move to center and rotate
  ctx.translate(centerX, centerY);
  ctx.rotate(middleAngle + Math.PI / 2);

  // Set text styling from config
  ctx.font = `${config.appearance.textConfig.fontSize}px ${config.appearance.textConfig.fontFamily}`;
  ctx.fillStyle = config.appearance.textConfig.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Calculate max text width
  const maxWidth = Math.min(300, textRadius * segmentAngle * 0.7);

  // Measure and truncate text if needed
  let displayText = text;
  let textWidth = ctx.measureText(text).width;

  if (textWidth > maxWidth) {
    let truncated = true;
    let length = text.length;

    while (truncated && length > 0) {
      length--;
      displayText = text.substring(0, length) + "...";
      textWidth = ctx.measureText(displayText).width;

      if (textWidth <= maxWidth) {
        truncated = false;
      }
    }
  }

  // Draw the text
  ctx.fillText(displayText, 0, -textRadius, maxWidth);

  // Restore canvas state
  ctx.restore();
}

/**
 * Draws the center hub of the wheel
 */
function drawWheelCenter(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelConfig
): void {
  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = config.appearance.centerColor;
  ctx.fill();

  // Draw border
  ctx.lineWidth = config.appearance.borderWidth;
  ctx.strokeStyle = config.appearance.borderColor;
  ctx.stroke();
}

/**
 * Draws the pointer that indicates the winning segment
 *
 * Position is determined by the config.appearance.pointerPosition value
 * from config.ts
 */
function drawPointer(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelConfig
): void {
  const size = config.pointer.size;
  let pointerX, pointerY;
  let direction: "up" | "right" | "down" | "left";

  // Position pointer based on config setting
  switch (config.appearance.pointerPosition) {
    case "top":
      pointerX = centerX;
      pointerY = centerY - radius - 5;
      direction = "down";
      break;
    case "right":
      pointerX = centerX + radius + 5;
      pointerY = centerY;
      direction = "left";
      break;
    case "bottom":
      pointerX = centerX;
      pointerY = centerY + radius + 5;
      direction = "up";
      break;
    case "left":
      pointerX = centerX - radius - 5;
      pointerY = centerY;
      direction = "right";
      break;
    default:
      pointerX = centerX;
      pointerY = centerY - radius - 5;
      direction = "down";
  }

  // Draw triangle pointer
  ctx.beginPath();

  // Shape depends on direction
  if (direction === "down") {
    ctx.moveTo(pointerX, pointerY + size);
    ctx.lineTo(pointerX - size, pointerY);
    ctx.lineTo(pointerX + size, pointerY);
  } else if (direction === "up") {
    ctx.moveTo(pointerX, pointerY - size);
    ctx.lineTo(pointerX - size, pointerY);
    ctx.lineTo(pointerX + size, pointerY);
  } else if (direction === "left") {
    ctx.moveTo(pointerX - size, pointerY);
    ctx.lineTo(pointerX, pointerY - size);
    ctx.lineTo(pointerX, pointerY + size);
  } else {
    // right
    ctx.moveTo(pointerX + size, pointerY);
    ctx.lineTo(pointerX, pointerY - size);
    ctx.lineTo(pointerX, pointerY + size);
  }

  ctx.closePath();

  // Fill and stroke
  ctx.fillStyle = config.pointer.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  ctx.stroke();
}

/**
 * Resizes the canvas to match its container dimensions
 *
 * CRITICAL: This function establishes the connection between
 * the DOM element dimensions and the canvas rendering dimensions.
 * 
 * @param canvas The canvas element to resize
 * @param container The container element that holds the canvas
 * @param dimensions Optional dimensions from the dimension provider
 */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  dimensions?: {
    containerWidth: number;
    containerHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    pixelRatio: number;
  }
): void {
  if (dimensions) {
    // If dimensions are provided, use them directly
    canvas.style.width = `${dimensions.containerWidth}px`;
    canvas.style.height = `${dimensions.containerHeight}px`;
    canvas.width = Math.floor(dimensions.canvasWidth);
    canvas.height = Math.floor(dimensions.canvasHeight);

    // Set the scale for high-DPI displays
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(dimensions.pixelRatio, dimensions.pixelRatio);
    }
  } else {
    // Legacy approach if dimensions aren't provided
    // Get container dimensions
    const rect = container.getBoundingClientRect();

    // Adjust for device pixel ratio for crisp rendering
    const pixelRatio = window.devicePixelRatio || 1;

    // Ensure we have a square canvas based on the smallest dimension
    const size = Math.min(rect.width, rect.height);

    // Set CSS dimensions
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Set internal canvas dimensions (scaled by pixel ratio)
    canvas.width = Math.floor(size * pixelRatio);
    canvas.height = Math.floor(size * pixelRatio);

    // Set the scale for high-DPI displays
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(pixelRatio, pixelRatio);
    }
  }
}
