# 📘 Project Plan: Solo Teacher English LMS (Phase 1)

**Version:** 1.0
**Role:** Senior Engineer / Solo Teacher
**Environment:** Antigravity VPS (2GB RAM, 25GB SSD)

---

## 1. Tổng quan Dự án (Project Overview)

Xây dựng nền tảng học Tiếng Anh khép kín, nơi giáo viên (Admin) toàn quyền quản lý nội dung bài tập và học sinh. Hệ thống hỗ trợ tự động chấm điểm bài tập Trắc nghiệm và Điền từ.

---

## 2. Kiến trúc Hệ thống (System Architecture)

- **Framework:** Next.js 14+ (App Router).
- **Database:** PostgreSQL (Chạy Docker container trên VPS).
- **ORM:** Prisma (Quản lý Schema và Type-safety).
- **Authentication:** Auth.js (Credentials Provider - Giáo viên cấp tài khoản).
- **Web Server:** Nginx (Reverse Proxy & SSL Certbot).

---

## 3. Cấu trúc Dữ liệu (Database Schema)

### 👤 User

- `id`: String (CUID)
- `username`: String (Unique)
- `password`: String (Hashed)
- `isAdmin`: Boolean (Default: false)

### 📝 Assignment (Bài kiểm tra)

- `id`: String (CUID)
- `title`: String
- `content`: JSONB (Mảng các câu hỏi)
- `isActive`: Boolean (Đóng/mở bài tập)
- `createdAt`: DateTime

**Cấu trúc Object trong `content`:**

```json
{
  "id": "q1",
  "type": "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK",
  "question": { "text": "...", "audio": null },
  "options": ["A", "B", "C", "D"],
  "correct": ["Đáp án 1", "Đáp án 2"],
  "explain": "Giải thích tại sao đúng"
}
```

## 4. Dữ liệu mẫu

```json
[
  {
    "id": "q1",
    "type": "MULTIPLE_CHOICE",
    "question": { "text": "What is the capital of France?", "audio": null },
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correct": ["Paris"],
    "explain": "Paris is the capital and most populous city of France."
  },
  {
    "id": "q2",
    "type": "FILL_IN_THE_BLANK",
    "question": { "text": "I ___ (be) a teacher.", "audio": null },
    "correct": ["am", "'m"],
    "explain": "With the pronoun 'I', we use the verb 'to be' as 'am'."
  }
]
```
