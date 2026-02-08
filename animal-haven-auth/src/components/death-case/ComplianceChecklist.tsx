import { cn } from "@/lib/utils";
import { ComplianceCheckItem } from "@/types/deathCase";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface ComplianceChecklistProps {
  items: ComplianceCheckItem[];
  readOnly?: boolean;
  onToggle?: (itemId: string, completed: boolean) => void;
  className?: string;
}

export function ComplianceChecklist({
  items,
  readOnly = false,
  onToggle,
  className,
}: ComplianceChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const requiredItems = items.filter((item) => item.required);
  const requiredCompleted = requiredItems.filter((item) => item.completed).length;
  const allRequiredComplete = requiredCompleted === requiredItems.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allRequiredComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          )}
          <span className="font-medium text-sm">
            Compliance Status
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            allRequiredComplete
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
          )}
        >
          {completedCount}/{items.length} Complete
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            allRequiredComplete ? "bg-emerald-500" : "bg-amber-500"
          )}
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              item.completed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : item.required
                ? "bg-amber-500/5 border-amber-500/20"
                : "bg-muted/30 border-border"
            )}
          >
            {/* Checkbox or status icon */}
            {readOnly ? (
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            ) : (
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={(checked) =>
                  onToggle?.(item.id, checked as boolean)
                }
                className="mt-0.5"
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <label
                  htmlFor={readOnly ? undefined : item.id}
                  className={cn(
                    "text-sm font-medium",
                    !readOnly && "cursor-pointer",
                    item.completed && "text-muted-foreground"
                  )}
                >
                  {item.label}
                </label>
                {item.required && !item.completed && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    Required
                  </Badge>
                )}
              </div>

              {/* Completion info */}
              {item.completed && item.completedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completed by {item.completedBy || "Unknown"}{" "}
                  {formatDistanceToNow(new Date(item.completedAt), {
                    addSuffix: true,
                  })}
                </p>
              )}

              {/* Notes */}
              {item.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
