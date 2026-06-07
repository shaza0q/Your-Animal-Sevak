import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryItem } from "./HistoryItem";
import { formatHistoryEvent } from "@/utils/history-formatters";
import { AnimalHistoryEvent } from "@/types/animal-history";
import { ClipboardList, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface RecentHistoryProps {
  events: AnimalHistoryEvent[];
  loading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  title?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick?: () => void;
    to?: string;
  };
}

export function RecentHistory({
  events,
  loading = false,
  maxItems = 3,
  showViewAll = true,
  onViewAll,
  title = "Recent Activity",
  emptyMessage = "No updates logged yet",
  emptyDescription = "Log health checks, vaccinations, weight measurements, and breeding events here.",
  emptyAction,
}: RecentHistoryProps) {
  const formattedEvents = events
    .map(formatHistoryEvent)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">{title}</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (formattedEvents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">{title}</h3>
          <EmptyState
            icon={ClipboardList}
            title={emptyMessage}
            description={emptyDescription}
            action={emptyAction}
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{title}</h3>
          {formattedEvents.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {formattedEvents.length} event{formattedEvents.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {formattedEvents.map((item) => (
            <HistoryItem key={item.id} item={item} compact />
          ))}
        </div>

        {showViewAll && onViewAll && formattedEvents.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground"
            onClick={onViewAll}
          >
            View full history
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}