# Directory Structure

**Date:** 2026-04-26

## Overview

The repository adopts a Clean Architecture and Feature-first design logic.

```
/
├── prisma/               # Database schema and seed scripts
│   ├── schema.prisma     # Prisma configuration and models
│   └── seed.ts           # DB Seed script
├── src/
│   ├── app/              # Next.js App Router Entry Points
│   │   ├── login/        # Authentication pages
│   │   ├── student/      # Student portal routes
│   │   └── teacher/      # Teacher dashboard routes
│   │       ├── assignments/
│   │       ├── audio-converter/
│   │       ├── lectures/
│   │       └── students/
│   ├── containers/       # UI and Infrastructure Layers (Feature-first)
│   │   ├── audio-converter/
│   │   └── {feature-name}/
│   │       ├── infrastructure/
│   │       ├── components/
│   │       └── hooks/
│   ├── core/             # Business Logic - Pure Domain and Application Layers (Feature-first)
│   │   ├── lms/
│   │   │   ├── domain/
│   │   │   └── application/
│   │   └── audio-converter/
│   ├── libs/             # Shared libraries and configurations
│   └── types/            # Global shared types
```

## Key Locations
- **Routing & Pages**: `src/app/`
- **UI Components & Features hooks**: `src/containers/`
- **Business Logic & Abstractions**: `src/core/`
- **Database schema**: `prisma/schema.prisma`
- **Auth Configuration**: `src/auth.ts`
