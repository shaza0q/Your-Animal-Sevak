import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryItem } from "./HistoryItem";
import { formatHistoryEvent } from "@/utils/history-formatters";
import { AnimalHistoryEvent } from "@/types/animal-history";
import { Activity, ChevronRight } from "lucide-react";

interface RecentHistoryProps {
  events: AnimalHistoryEvent[];
  loading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  title?: string;
  emptyMessage?: string;
}

export function RecentHistory({
  events,
  loading = false,
  maxItems = 3,
  showViewAll = true,
  onViewAll,
  title = "Recent Activity",
  emptyMessage = "No activity recorded yet"
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
          <h3 className="font-medium mb-4">{title}</h3>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
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