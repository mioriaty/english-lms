"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/libs/components/ui/card";

export function LoginForms() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") ?? "");
    const password = String(fd.get("password") ?? "");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setPending(false);

    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }

    // Fetch session to know the role, then redirect
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    window.location.href = session?.user?.isAdmin ? "/teacher" : "/student";
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xl text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
