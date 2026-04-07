import Link from "next/link";
import { signOutAction } from "@/app/actions/auth-actions";
import { Button } from "@/libs/components/ui/button";

interface AppHeaderProps {
  title: string;
  links: { href: string; label: string }[];
}

export function AppHeader({ title, links }: AppHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {title}
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-xl">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {l.label}
            </Link>
          ))}
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
