import { Badge } from "@/components/ui/badge";
import { WorkflowStatus, STATUS_CONFIG } from "@/types/deathCase";
import { cn } from "@/lib/utils";
import {
  FileText,
  Edit,
  Clock,
  CheckCircle,
  Package,
  PackageCheck,
  Eye,
  AlertCircle,
  CheckCircle2,
  Archive,
} from "lucide-react";

interface CaseStatusBadgeProps {
  status: WorkflowStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const iconMap = {
  FileText,
  Edit,
  Clock,
  CheckCircle,
  Package,
  PackageCheck,
  Eye,
  AlertCircle,
  CheckCircle2,
  Archive,
};

export function CaseStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size],
        "font-medium inline-flex items-center gap-1.5",
        className
      )}
    >
      {showIcon && Icon && <Icon size={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
