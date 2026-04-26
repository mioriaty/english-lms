# Architecture

**Date:** 2026-04-26

## Core Architectural Pattern
The project implements **Clean Architecture** organized with a **Feature-first** (vertical slice) approach.

1. **Domain Layer**: Contains entities and repository interfaces (`core/{feature}/domain`).
2. **Application Layer**: Contains business logic encapsulated in Use Cases (`core/{feature}/application`).
3. **Infrastructure Layer**: Contains implementation of repositories, interacting with databases or external APIs (`containers/{feature}/infrastructure`).
4. **Presentation Layer**: React components and hooks for UI, utilizing TanStack Query for server state management (`containers/{feature}/components`, `hooks`).
5. **Dependency Injection**: Factory functions instantiate and inject dependencies (`core/{feature}/factories`).

## Application Architecture
- **Next.js App Router**: Provides routing and rendering strategies. 
  - Subsystems structured by roles: `/app/student`, `/app/teacher`, `/app/login`.
  - Next.js acts mainly as the delivery mechanism and presentation host.
- **Server Actions / API Routes**: Next.js is used for server-side capabilities, likely acting as a proxy or directly executing Use Cases depending on the specific flow.
- **Data Access Layer (DAL)**: All data access is strictly governed by the Repository pattern, avoiding direct DB calls from the UI or App Router pages directly without going through proper Service/Repository layers.

## Modules / Subsystems
- **LMS (Learning Management System)**: Core domain handling assignments, lectures, submissions, and students.
- **Audio Converter**: Distinct domain for handling media processing (using `ffmpeg`).
- **Auth**: Central authentication logic using `next-auth`.

## Design Constraints & Principles
- **No Inner-to-Outer Dependencies**: Inner layers (domain/application) must not import from outer layers (infrastructure/UI).
- **Component Reusability**: Driven by Shadcn UI and Radix primitives. Custom components should only be built when a Shadcn component does not suffice.
