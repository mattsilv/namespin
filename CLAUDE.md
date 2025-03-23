# NameSpin Project Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **TypeScript**: Use strict typing with interfaces for component props
- **React**: Use functional components with hooks
- **Formatting**: 2-space indentation, no trailing whitespace
- **Naming**:
  - Components: PascalCase (e.g., `PrizeWheel`)
  - Hooks & functions: camelCase (e.g., `useWheel`, `spinWheel`)
  - Files: Match component names for components, lowercase for utilities
- **Imports**: Group imports by: React, third-party, project modules
- **Error Handling**: Use try/catch blocks for operations that may fail
- **State Management**: Prefer React state and context over global state
- **Documentation**: Include JSDoc comments for functions and components
- **Physics Calculations**: Keep in dedicated modules (physics.ts)
- **Configuration**: Use config.ts as single source of truth for wheel settings

## Canvas Rendering
- All wheel rendering done in WheelCanvas.tsx via wheel.ts
- Do not modify appearance directly; update config.ts instead