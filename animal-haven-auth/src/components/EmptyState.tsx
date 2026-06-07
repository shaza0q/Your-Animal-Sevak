import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (action?.to) {
      navigate(action.to);
    } else {
      action?.onClick?.();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center px-4",
        className,
      )}
    >
      <div className="rounded-full bg-muted/60 p-4 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground/70 max-w-xs">{description}</p>
      {action && (
        <Button
          variant={action.to ? "default" : "outline"}
          size="sm"
          onClick={handleAction}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
