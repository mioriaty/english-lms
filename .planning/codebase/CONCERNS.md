# Concerns

**Date:** 2026-04-26

## Overview
Based on an initial scan of the application structure and dependencies:

## Technical Debt & Areas of Concern
- **Testing**: No test frameworks are installed. There is currently no unit testing or E2E testing setup, which is a significant technical debt, especially for a Clean Architecture application which is specifically designed to be highly testable.
- **Audio Processing Scalability**: The usage of local `fluent-ffmpeg` and `ffmpeg-static` in the backend may lead to CPU bottlenecks and scalability issues if a large volume of concurrent media conversions is triggered. Processing should eventually be moved to a background worker queue (e.g., BullMQ) or a serverless task execution environment.
- **Missing Tooling**: The general-rules mention URL state management via `nuqs`, but the library is not yet present in `package.json`, which could indicate partially implemented features or unused guidelines.
- **In-Progress Porting**: `package.json` contains a mix of `@phosphor-icons/react` and `lucide-react`, which implies inconsistent icon usage or an incomplete migration between icon sets.
