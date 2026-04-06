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
        title="Teacher Portal"
        links={[
          { href: "/teacher", label: "Overview" },
          { href: "/teacher/assignments", label: "Assignments" },
          { href: "/teacher/students", label: "Students" },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
