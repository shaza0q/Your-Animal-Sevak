import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  History,
  RefreshCw,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { HistoryItem } from "./HistoryItem";
import { formatHistoryEvent } from "@/utils/history-formatters";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { useAnimalHistory } from "@/hooks/useAnimalHistory";

const DEFAULT_LIMIT = 15;

export default function AnimalHistoryPage() {
  const { farmId, animalId } = useParams<{ farmId: string; animalId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching, refetch } = useAnimalHistory(animalId, {
    page,
    limit: DEFAULT_LIMIT,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!animalId) {
    return <div className="p-8 text-center text-muted-foreground">Animal ID is required.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 shrink-0"
              onClick={() => navigate(`/farms/${farmId}/animals/${animalId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Animal History</span>
              {pagination && pagination.total > 0 && (
                <span className="text-sm text-muted-foreground font-normal">
                  ({pagination.total} events)
                </span>
              )}
              {isFetching && !isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Loading */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <ErrorMessage error={error} onRetry={() => refetch()} />
            )}

            {/* Empty */}
            {!isLoading && !isError && events.length === 0 && (
              <EmptyState
                icon={ClipboardList}
                title="No activity yet"
                description="Health checks, vaccinations, weight updates, and other events will appear here."
                className="py-12"
              />
            )}

            {/* Events */}
            {!isLoading && !isError && events.length > 0 && (
              <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                {events.map((event) => {
                  const formatted = formatHistoryEvent(event);
                  return <HistoryItem key={formatted.id} item={formatted} />;
                })}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !isError && pagination && pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!pagination.hasPrev || isFetching}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNext || isFetching}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages || 1}
                  {" · "}
                  Showing {(pagination.page - 1) * DEFAULT_LIMIT + 1}–
                  {Math.min(pagination.page * DEFAULT_LIMIT, pagination.total)} of {pagination.total}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
