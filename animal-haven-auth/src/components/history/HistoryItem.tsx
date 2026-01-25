import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { FormattedHistoryItem } from "@/utils/history-formatters";

interface HistoryItemProps {
  item: FormattedHistoryItem;
  showUser?: boolean;
  compact?: boolean;
}

export function HistoryItem({ item, showUser = true, compact = false }: HistoryItemProps) {
  return (
    <div className="flex gap-3 p-4 rounded-lg border border-border/40 bg-card/50 hover:bg-card/70 transition-colors">
      {/* Icon */}
      <div className={`p-2 rounded-full ${item.color.split(' ')[1]} h-fit`}>
        <span className="text-sm">{item.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {item.title}
            </p>
            <p className="text-sm text-foreground/70 mt-0.5">
              {item.description}
            </p>
          </div>
          
          {!compact && (
            <Badge 
              variant="outline" 
              className="text-xs font-normal whitespace-nowrap"
            >
              {item.timestamp.toLocaleDateString()}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {showUser && item.user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {item.user.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{item.user.name || 'Unknown User'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="whitespace-nowrap">
                {item.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}

          {compact && (
            <span className="text-[10px] opacity-70">
              {item.timestamp.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
