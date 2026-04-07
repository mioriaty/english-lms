import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/libs/components/ui/sidebar";
import { TooltipProvider } from "@/libs/components/ui/tooltip";
import { Separator } from "@/libs/components/ui/separator";
import { AppSidebar } from "@/libs/components/layout/app-sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.isAdmin) {
    redirect("/login");
  }

  const username = session.user.name ?? session.user.email ?? "Student";

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar variant="student" username={username} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-full" />
            <span className="text-xl font-medium text-muted-foreground">
              Student Portal
            </span>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
