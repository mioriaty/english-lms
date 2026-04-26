# Testing

**Date:** 2026-04-26

## Overview
Currently, the codebase does not explicitly configure a testing framework in its dependencies (e.g., Jest, Vitest, or Cypress are absent from `package.json`).

## Planned / Standard Testing Conventions
- **Framework**: Expected to use standard tools like Vitest or Jest if integrated later.
- **Unit Testing**: 
  - Mock repositories to test domain Use Cases independently.
  - Due to Clean Architecture, business logic in `core/{feature}/application` is highly isolated and mockable.
- **UI Testing**: React Testing Library would likely be used to test components in the `containers` layer.
- **Coverage**: No coverage scripts are currently setup.
