# Phase 1 — English LMS

## Tổng quan

Xây dựng một hệ thống LMS (Learning Management System) cho giáo viên tiếng Anh solo, bao gồm:

- Quản lý bài tập (Assignment) với nhiều loại câu hỏi
- Chấm điểm tự động
- Quản lý bài giảng (Lecture) với rich text
- Quản lý học sinh
- Phân quyền Teacher / Student

---

## Tech Stack

| Layer           | Công nghệ                                                    |
| --------------- | ------------------------------------------------------------ |
| Framework       | Next.js 16.2 (App Router, Server Components, Server Actions) |
| Language        | TypeScript 5.8                                               |
| UI              | shadcn/ui + Radix UI + Tailwind CSS 4                        |
| Database        | PostgreSQL + Prisma 6.6 ORM                                  |
| Auth            | NextAuth v5 (beta) — JWT strategy, Credentials provider      |
| Forms           | React Hook Form 7 + Zod 3                                    |
| Rich Text       | TipTap 3                                                     |
| Drag & Drop     | @dnd-kit                                                     |
| Tables          | @tanstack/react-table 8                                      |
| Toast           | Sonner                                                       |
| Icons           | Lucide React + Phosphor Icons                                |
| Dev server port | 1112                                                         |
| Process manager | PM2                                                          |

---

## Architecture

Áp dụng **Clean Architecture** theo kiểu Feature-first:

```
src/
├── core/                    # Business logic thuần (domain + application + factories)
│   └── lms/
│       ├── domain/
│       │   └── question.types.ts     # Type definitions
│       └── application/
│           └── grade-submission.ts   # Grading engine
│
├── app/                     # Next.js App Router (pages + server actions + API routes)
│   ├── actions/             # Server Actions
│   ├── api/                 # API Routes (upload, auth)
│   ├── teacher/             # Teacher routes (protected, isAdmin=true)
│   ├── student/             # Student routes (protected)
│   └── login/               # Public auth page
│
└── libs/                    # Shared utilities và components
    ├── components/ui/       # shadcn/ui components
    ├── components/          # App-level shared components
    └── utils/               # db.ts, file-storage.ts, string.ts
```

---

## Database Schema (Prisma)

### User

| Field        | Type          | Ghi chú                             |
| ------------ | ------------- | ----------------------------------- |
| id           | String (cuid) | PK                                  |
| username     | String        | Unique                              |
| passwordHash | String        | bcryptjs                            |
| isAdmin      | Boolean       | `true` = Teacher, `false` = Student |
| createdAt    | DateTime      |                                     |
| submissions  | Submission[]  |                                     |

### Assignment

| Field            | Type          | Ghi chú                              |
| ---------------- | ------------- | ------------------------------------ |
| id               | String (cuid) | PK                                   |
| title            | String        |                                      |
| description      | String?       |                                      |
| image            | String?       | URL ảnh cover                        |
| content          | Json          | Mảng Question[] (xem Question Model) |
| isActive         | Boolean       | Bật/tắt bài tập                      |
| timeLimitSeconds | Int?          | Null = không giới hạn thời gian      |

### Lecture

| Field       | Type          | Ghi chú              |
| ----------- | ------------- | -------------------- |
| id          | String (cuid) | PK                   |
| title       | String        |                      |
| content     | String        | HTML (TipTap output) |
| isPublished | Boolean       | Ẩn/hiện với học sinh |

### Submission

| Field        | Type          | Ghi chú            |
| ------------ | ------------- | ------------------ |
| id           | String (cuid) | PK                 |
| score        | Float         | 0–100              |
| details      | Json          | GradingDetailRow[] |
| submittedAt  | DateTime      |                    |
| studentId    | String        | FK → User          |
| assignmentId | String        | FK → Assignment    |

---

## Question Model (JSON trong Assignment.content)

Ba loại câu hỏi, lưu dạng JSON array:

```typescript
// Câu hỏi trắc nghiệm
MultipleChoiceQuestion {
  id: string
  type: "MULTIPLE_CHOICE"
  question: { text, audio, image, description }
  options: string[]    // Các lựa chọn
  correct: string[]    // Đáp án đúng (hỗ trợ multi-select)
  explain?: string
}

// Câu hỏi điền vào chỗ trống
FillInTheBlankQuestion {
  id: string
  type: "FILL_IN_THE_BLANK"
  question: { text, audio, image, description }
  correct: string[][]  // correct[i] = các đáp án chấp nhận cho blank thứ i
  explain?: string
}

// Nhóm câu hỏi (có đoạn văn/audio chung)
GroupQuestion {
  id: string
  type: "GROUP"
  question: { text, audio, image, description }
  subQuestions: (MultipleChoiceQuestion | FillInTheBlankQuestion)[]
}
```

---

## Grading Engine (`src/core/lms/application/grade-submission.ts`)

- Flatten GROUP → leaf questions trước khi chấm
- **Multiple choice**: So sánh mảng đáp án sau normalize (trim + lowercase)
- **Fill in the blank**: Mỗi blank chấm riêng, tất cả blank đúng mới tính câu đúng
- **Score**: `(correctCount / total) * 100`
- Trả về `{ score, details: GradingDetailRow[] }` lưu vào `Submission.details`

---

## Features Đã Hoàn Thiện

### Teacher

#### Assignment Management

- Xem danh sách bài tập (data table, toggle active/inactive, xóa)
- Tạo bài tập mới với Question Builder
- Chỉnh sửa bài tập
- Question Builder hỗ trợ:
  - Thêm/xóa/sắp xếp câu hỏi (drag & drop via @dnd-kit)
  - Loại: Trắc nghiệm, Điền từ, Nhóm câu hỏi
  - Upload audio (MP3, max 20MB)
  - Upload ảnh cho câu hỏi
  - Nhập nhiều đáp án chấp nhận cho fill-in-the-blank

#### Lecture Management

- Xem danh sách bài giảng
- Tạo/chỉnh sửa bài giảng với TipTap rich text editor
- Toggle published/unpublished

#### Student Management

- Xem danh sách học sinh (data table)
- Tạo tài khoản học sinh mới
- Chỉnh sửa thông tin học sinh
- Xóa học sinh
- Xem chi tiết học sinh + lịch sử nộp bài

#### Dashboard

- Trang dashboard giáo viên

### Student

#### Assignment Taking

- Xem danh sách bài tập đang active
- Làm bài tập với:
  - Countdown timer (nếu có giới hạn thời gian)
  - Trả lời câu hỏi trắc nghiệm (single/multi-select)
  - Điền vào chỗ trống (inline)
  - Xem ảnh zoom
  - Nghe audio
- Nộp bài → chấm tự động → hiển thị kết quả ngay
- Xem kết quả chi tiết từng câu (đúng/sai + đáp án đúng + giải thích)

#### Lectures

- Xem danh sách bài giảng đã published
- Đọc nội dung bài giảng (rich text render)

---

## Routes

### Public

- `/login` — Đăng nhập

### Student (đăng nhập, isAdmin=false)

- `/student` — Dashboard
- `/student/assignments/[id]` — Làm bài tập
- `/student/lectures` — Danh sách bài giảng
- `/student/lectures/[id]` — Đọc bài giảng

### Teacher (đăng nhập, isAdmin=true)

- `/teacher` — Dashboard
- `/teacher/assignments` — Quản lý bài tập
- `/teacher/assignments/new` — Tạo bài tập
- `/teacher/assignments/[id]/edit` — Chỉnh sửa bài tập
- `/teacher/lectures` — Quản lý bài giảng
- `/teacher/lectures/new` — Tạo bài giảng
- `/teacher/lectures/[id]/edit` — Chỉnh sửa bài giảng
- `/teacher/students` — Quản lý học sinh
- `/teacher/students/[id]` — Chi tiết học sinh

### API

- `POST /api/upload` — Upload file (audio/image)
- `DELETE /api/upload` — Xóa file
- `/api/auth/[...nextauth]` — NextAuth endpoints

---

## File Storage

- Lưu local tại `/public/uploads/`
- Audio: MP3, max 20MB
- Image: JPEG/PNG/WebP/GIF, max 5MB
- API endpoint xử lý upload + delete + cleanup file cũ khi replace

---

## Authentication & Authorization

- NextAuth v5 với Credentials provider
- Session strategy: JWT
- `isAdmin = true` → Teacher (access `/teacher/*`)
- `isAdmin = false` → Student (access `/student/*`)
- Middleware redirect về `/login` nếu chưa đăng nhập
- Home `/` redirect đến `/teacher` hoặc `/student` tùy role

---

## Những điểm kỹ thuật đáng chú ý

1. **Question Builder** dùng `@dnd-kit` cho drag & drop reorder câu hỏi, bao gồm cả sub-questions trong group
2. **Grading engine** normalize answer (trim + lowercase) trước khi so sánh — tránh sai vì khoảng trắng/hoa thường
3. **Fill-in-the-blank** hỗ trợ nhiều variants đáp án chấp nhận cho mỗi blank (ví dụ: "don't" và "do not" đều đúng)
4. **GroupQuestion** cho phép một đoạn văn/audio làm context chung cho nhiều câu con
5. **Submission.details** lưu đủ thông tin để hiển thị review sau khi nộp bài mà không cần re-fetch câu hỏi
6. **Server Actions** được dùng cho tất cả mutations (create/update/delete) thay vì API routes riêng
7. **Countdown timer** tự động submit khi hết giờ
