import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForms } from "./login-forms";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.isAdmin) redirect("/teacher");
    redirect("/student");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <LoginForms />
      <p className="text-center text-sm text-zinc-500">
        Lần đầu chạy: tạo tài khoản giáo viên bằng{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">npm run db:seed</code>
      </p>
      <Link href="/" className="text-sm text-zinc-600 underline dark:text-zinc-400">
        Trang chủ
      </Link>
    </div>
  );
}
