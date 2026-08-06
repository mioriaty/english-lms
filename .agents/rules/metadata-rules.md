---
trigger: always_on
---

# Metadata Rules - Next.js 15

> Loaded when working with Next.js 15 pages, layouts, and metadata generation.

---

## 🚀 Sync Dynamic APIs (MANDATORY)

- Đối với những page, layout, hoặc file có props là `params`, `searchParams` (ví dụ như `generateMetadata`), bắt buộc phải bọc thêm Promise và dùng `await` để unwrap trước khi truy cập các thuộc tính (ví dụ: `const { locale } = await params;`).
