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
  const [tab, setTab] = useState<"teacher" | "student">("teacher");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onTeacherSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    window.location.href = "/teacher";
  }

  async function onStudentSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    window.location.href = "/student";
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Select your role to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "teacher"
                ? "bg-white shadow dark:bg-zinc-950"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
            onClick={() => {
              setTab("teacher");
              setError(null);
            }}
          >
            Teacher
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "student"
                ? "bg-white shadow dark:bg-zinc-950"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
            onClick={() => {
              setTab("student");
              setError(null);
            }}
          >
            Student
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        {tab === "teacher" ? (
          <form className="space-y-4" onSubmit={onTeacherSubmit}>
            <div className="space-y-2">
              <Label htmlFor="tusername">Username</Label>
              <Input
                id="tusername"
                name="username"
                type="text"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpassword">Password</Label>
              <Input
                id="tpassword"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in as Teacher"}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={onStudentSubmit}>
            <div className="space-y-2">
              <Label htmlFor="susername">Username</Label>
              <Input
                id="susername"
                name="username"
                type="text"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spassword">Password</Label>
              <Input
                id="spassword"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in as Student"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
