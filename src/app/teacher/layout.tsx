import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Khu vực giáo viên"
        links={[
          { href: "/teacher", label: "Tổng quan" },
          { href: "/teacher/assignments", label: "Bài tập" },
          { href: "/teacher/students", label: "Học sinh" },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
