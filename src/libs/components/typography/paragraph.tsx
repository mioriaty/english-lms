import { cn } from "@/libs/utils/string";

export function TypoP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("leading-7 not-first:mt-6", className)}>{children}</p>
  );
}
