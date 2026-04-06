import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.isAdmin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Student Portal"
        links={[{ href: "/student", label: "Assignments" }]}
      />
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
