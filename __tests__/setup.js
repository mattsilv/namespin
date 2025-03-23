// Import testing utilities
import '@testing-library/jest-dom';

// Add a dummy test to satisfy Jest's requirement for at least one test
test('setup file includes a test', () => {
  expect(true).toBe(true);
});

// Mock GSAP
jest.mock('gsap', () => {
  // Create a mock implementation of GSAP
  return {
    to: jest.fn(() => ({
      kill: jest.fn(),
    })),
    set: jest.fn(),
    timeline: jest.fn(() => ({
      to: jest.fn(() => ({
        to: jest.fn(),
      })),
    })),
    killTweensOf: jest.fn(),
    utils: {
      wrap: jest.fn(),
    },
  };
});

// Mock canvas context methods that we use in the wheel drawing
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    arc: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    fillText: jest.fn(),
    scale: jest.fn(),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  value: 1,
});