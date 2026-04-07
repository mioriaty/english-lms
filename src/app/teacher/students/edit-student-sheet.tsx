"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilSimple } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/libs/components/ui/sheet";
import { Button } from "@/libs/components/ui/button";
import { Input } from "@/libs/components/ui/input";
import { Label } from "@/libs/components/ui/label";
import { updateStudent } from "@/app/actions/student-actions";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Min. 4 characters").or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface EditStudentSheetProps {
  student: { id: string; username: string };
}

export function EditStudentSheet({ student }: EditStudentSheetProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: student.username, password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await updateStudent(student.id, {
        username: values.username !== student.username ? values.username : undefined,
        password: values.password || undefined,
      });
      setOpen(false);
      reset({ username: values.username, password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student.");
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          reset({ username: student.username, password: "" });
          setError(null);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilSimple />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Student</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              autoComplete="off"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">New Password</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
