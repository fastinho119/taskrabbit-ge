import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";
import { TASK_STATUS_LABELS } from "@/types";

interface BadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const label = TASK_STATUS_LABELS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        label.color,
        className
      )}
    >
      {label.ka}
    </span>
  );
}

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning";
}) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
