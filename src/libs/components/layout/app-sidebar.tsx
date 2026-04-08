"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LucideIcon,
  Users,
  NotebookText,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/libs/components/ui/sidebar";
import { signOutAction } from "@/app/actions/auth-actions";
import { Button } from "@/libs/components/ui/button";
import { Avatar, AvatarFallback } from "@/libs/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Use exact match for active state (default: prefix match) */
  exact?: boolean;
}

interface SidebarConfig {
  title: string;
  subtitle: string;
  role: string;
  navItems: NavItem[];
}

const SIDEBAR_CONFIGS: Record<"teacher" | "student", SidebarConfig> = {
  teacher: {
    title: "Teacher Portal",
    subtitle: "Admin Dashboard",
    role: "Administrator",
    navItems: [
      {
        label: "Overview",
        href: "/teacher",
        icon: LayoutDashboard,
        exact: true,
      },
      { label: "Lectures", href: "/teacher/lectures", icon: NotebookText },
      { label: "Assignments", href: "/teacher/assignments", icon: BookOpen },
      { label: "Students", href: "/teacher/students", icon: Users },
    ],
  },
  student: {
    title: "Student Portal",
    subtitle: "Learning Dashboard",
    role: "Student",
    navItems: [
      { label: "Lectures", href: "/student/lectures", icon: NotebookText },
      { label: "Assignments", href: "/student", icon: BookOpen, exact: true },
      { label: "Submissions", href: "/student/submissions", icon: ClipboardList },
    ],
  },
};

interface AppSidebarProps {
  variant: "teacher" | "student";
  username?: string;
}

export function AppSidebar({ variant, username }: AppSidebarProps) {
  const pathname = usePathname();
  const config = SIDEBAR_CONFIGS[variant];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-xl">{config.title}</span>
            <span className="text-xs text-muted-foreground">
              {config.subtitle}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {config.navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="text-xs bg-muted">
              {username?.[0]?.toUpperCase() ?? config.role[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xs font-medium">
              {username ?? config.role}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {config.role}
            </span>
          </div>
          <form
            action={signOutAction}
            className="group-data-[collapsible=icon]:hidden"
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
            >
              Sign out
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
