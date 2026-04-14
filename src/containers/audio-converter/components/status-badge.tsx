import { Badge } from "@/libs/components/ui/badge";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { ConversionJob } from "@/core/audio-converter/domain/repositories/audio-converter.repository";

interface StatusBadgeProps {
  status: ConversionJob["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
    processing: {
      label: "Processing",
      variant: "default" as const,
      icon: Loader2,
    },
    completed: {
      label: "Completed",
      variant: "default" as const,
      icon: CheckCircle2,
    },
    failed: {
      label: "Failed",
      variant: "destructive" as const,
      icon: XCircle,
    },
  };
  
  const { label, variant, icon: Icon } = map[status];
  
  return (
    <Badge
      variant={variant}
      className={
        status === "completed"
          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
          : ""
      }
    >
      <Icon
        className={`mr-1 size-3 ${status === "processing" ? "animate-spin" : ""}`}
      />
      {label}
    </Badge>
  );
}
