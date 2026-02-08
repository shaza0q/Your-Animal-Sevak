import { cn } from "@/lib/utils";
import { AuditEntry, ROLE_CONFIG } from "@/types/deathCase";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import {
  FileText,
  Edit,
  Send,
  CheckCircle,
  AlertCircle,
  Paperclip,
  User,
} from "lucide-react";

interface AuditTimelineProps {
  entries: AuditEntry[];
  className?: string;
  maxEntries?: number;
  showAll?: boolean;
}

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("created")) return FileText;
  if (actionLower.includes("edit") || actionLower.includes("update") || actionLower.includes("completed")) return Edit;
  if (actionLower.includes("submit") || actionLower.includes("sent") || actionLower.includes("requested")) return Send;
  if (actionLower.includes("confirm") || actionLower.includes("approve")) return CheckCircle;
  if (actionLower.includes("correction") || actionLower.includes("reject")) return AlertCircle;
  if (actionLower.includes("attach") || actionLower.includes("upload")) return Paperclip;
  return User;
};

export function AuditTimeline({
  entries,
  className,
  maxEntries = 5,
  showAll = false,
}: AuditTimelineProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const displayEntries = showAll
    ? sortedEntries
    : sortedEntries.slice(0, maxEntries);

  if (entries.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No audit entries yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {displayEntries.map((entry, index) => {
        const Icon = getActionIcon(entry.action);
        const roleConfig = ROLE_CONFIG[entry.userRole];
        const isLast = index === displayEntries.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                roleConfig.bgClass
              )}
            >
              <Icon className={cn("w-4 h-4", roleConfig.textClass)} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{entry.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {entry.userName}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        roleConfig.bgClass,
                        roleConfig.textClass
                      )}
                    >
                      {roleConfig.label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>

              {/* Change details */}
              {(entry.oldValue || entry.newValue) && (
                <div className="mt-2 text-xs bg-muted/50 rounded-md p-2">
                  {entry.field && (
                    <span className="text-muted-foreground">
                      {entry.section && `${entry.section} → `}
                      {entry.field}:{" "}
                    </span>
                  )}
                  {entry.oldValue && (
                    <span className="line-through text-muted-foreground mr-2">
                      {entry.oldValue}
                    </span>
                  )}
                  {entry.newValue && (
                    <span className="text-foreground">{entry.newValue}</span>
                  )}
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <p className="mt-2 text-xs text-muted-foreground italic">
                  "{entry.notes}"
                </p>
              )}
            </div>
          </div>
        );
      })}

      {!showAll && entries.length > maxEntries && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Showing {maxEntries} of {entries.length} entries
        </p>
      )}
    </div>
  );
}
