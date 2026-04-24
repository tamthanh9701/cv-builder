# CV Builder

Xây dựng CV chuyên nghiệp với sự hỗ trợ của AI.

## Tính năng

- **Tạo CV chuyên nghiệp**: Với format theo mẫu itviec, gồm ảnh, thông tin cá nhân, học vấn, kinh nghiệm, kỹ năng, ngôn ngữ, dự án, chứng chỉ
- **AI phân tích CV**: Đối chiếu CV hiện tại với công việc muốn ứng tuyển, AI sẽ phân tích và đề xuất cải thiện
- **Multi-provider AI**: Hỗ trợ OpenAI, Anthropic, OpenRouter, LiteLLM, Google AI, VertexAI
- **Quản lý mẫu CV (Admin)**: Tải lên mẫu CV PDF, AI phân tích và thiết kế lại thành HTML template
- **Lưu trữ theo thiết bị**: CV được lưu theo tài khoản người dùng

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- Supabase (Database + Auth + Storage)
- AI Integration (Multi-provider)

## Setup

### 1. Clone repository

```bash
git clone https://github.com/tamthanh9701/cv-builder.git
cd cv-builder
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo Supabase project

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Chạy SQL migration tại `supabase/migrations/001_schema.sql`
3. Bật Email Auth và Google OAuth trong Supabase Auth settings
4. Tạo storage bucket `cv-templates` (public)

### 4. Cấu hình environment variables

```bash
cp .env.example .env.local
```

Cập nhật các giá trị:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Chạy development server

```bash
npm run dev
```

## Deploy lên Vercel

```bash
npm run build
vercel deploy
```

Hoặc kết nối repository với Vercel tại [vercel.com](https://vercel.com)

## Database Schema

- `profiles`: Thông tin người dùng và role (admin/user)
- `cv_templates`: Mẫu CV do admin upload
- `cvs`: CV của người dùng (lưu data dạng JSON)
- `app_settings`: Cấu hình AI provider

## Phân quyền

- **User**: Tạo, chỉnh sửa, xóa CV của mình
- **Admin**: Quản lý mẫu CV, cấu hình AI settings