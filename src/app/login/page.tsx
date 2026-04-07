import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
    </div>
  );
}
