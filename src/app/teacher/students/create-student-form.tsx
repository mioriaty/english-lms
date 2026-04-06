"use client";

import { useState } from "react";
import { createStudent } from "@/app/actions/student-actions";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";

export function CreateStudentForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createStudent(fd);
      (e.target as HTMLFormElement).reset();
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">Add Student</h2>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {ok ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Student created successfully.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            required
            placeholder="e.g. anna-01"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password (min. 4 characters)</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={4}
            autoComplete="new-password"
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create Student"}
      </Button>
    </form>
  );
}
