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
      <Link
        href="/"
        className="text-sm text-zinc-600 underline dark:text-zinc-400"
      >
        Home
      </Link>
    </div>
  );
}
