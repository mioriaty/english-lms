# Integrations

**Date:** 2026-04-26

## External Systems
- **PostgreSQL**: Primary relational database, connected via Prisma ORM using standard connection string (`DATABASE_URL`).

## External Tools & Binaries
- **FFmpeg**: Integrated locally using `fluent-ffmpeg` and `ffmpeg-static` for backend/server-side media processing (e.g., video conversion/transcoding).

## Potential Future Integrations
- **Cloud Storage (S3 / GCS / R2)**: Likely needed for handling audio/video file uploads processing and serving media streams for the LMS.
- **External Auth Providers**: NextAuth 5 is set up, allowing seamless addition of Google, GitHub, or other OAuth providers if needed.
