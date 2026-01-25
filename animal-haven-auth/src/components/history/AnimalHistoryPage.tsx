import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  ChevronRight, 
  History, 
  RefreshCw, 
  AlertCircle,
  Filter,
  ArrowLeft
} from "lucide-react";
import { HistoryItem } from "./HistoryItem";
import { formatHistoryEvent } from "@/utils/history-formatters";
import { AnimalHistoryEvent } from "@/types/animal-history";
import { fetchAnimalHistory } from "@/api/fetchAnimalHistory";

interface AnimalHistoryProps {
  animalId: string;
  initialPage?: number;
  limit?: number;
  showFilters?: boolean;
  onEventClick?: (event: AnimalHistoryEvent) => void;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  totalPages: number;
}

interface HistoryFilters {
  types?: string[];
  fromDate?: string;
  toDate?: string;
  userId?: string;
}

const DEFAULT_LIMIT = 15;

// Define proper types for cache
interface CacheEntry {
  data: {
    data: AnimalHistoryEvent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
  };
  timestamp: number;
}

interface GlobalWindow {
  __historyCache?: Map<string, CacheEntry>;
}

// Global cache accessible across components
const getGlobalCache = (): Map<string, CacheEntry> => {
  if (typeof window === 'undefined') return new Map();
  const globalWindow = window as GlobalWindow;
  if (!globalWindow.__historyCache) {
    globalWindow.__historyCache = new Map();
  }
  return globalWindow.__historyCache;
};

export default function AnimalHistoryPage({ 
  animalId: propAnimalId,
  initialPage = 1,
  limit = DEFAULT_LIMIT,
  showFilters = false,
  onEventClick
}: AnimalHistoryProps) {
  // Get animalId from URL params if not provided as prop
  const params = useParams<{ farmId: string; animalId: string }>();
  const farmId = params?.farmId;
  const animalId = propAnimalId || params?.animalId;
  const navigate = useNavigate();

  
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AnimalHistoryEvent[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    limit,
    total: 0,
    hasNext: false,
    totalPages: 0
  });

  // Use global cache
  const cacheRef = useRef(getGlobalCache());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const buildQueryString = useCallback((currentPage: number, currentFilters: HistoryFilters) => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
    });

    if (currentFilters.types?.length) {
      params.append('types', currentFilters.types.join(','));
    }
    if (currentFilters.fromDate) {
      params.append('from', currentFilters.fromDate);
    }
    if (currentFilters.toDate) {
      params.append('to', currentFilters.toDate);
    }
    if (currentFilters.userId) {
      params.append('userId', currentFilters.userId);
    }

    return params.toString();
  }, [limit]);

  const getCacheKey = useCallback((page: number, filters: HistoryFilters) => {
    return `${animalId}-${page}-${JSON.stringify(filters)}`;
  }, [animalId]);

  const fetchHistory = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey(page, filters);
    const cached = cacheRef.current.get(cacheKey);
    
    // Return cached data if it exists and not forcing refresh
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setEvents(cached.data.data || []);
      const cachedPagination = cached.data.pagination;
      setPagination({
        page: cachedPagination.page,
        limit: cachedPagination.limit,
        total: cachedPagination.total,
        hasNext: cachedPagination.hasNext,
        totalPages: Math.ceil(cachedPagination.total / limit)
      });
      setLoading(false);
      setError(null);
      return;
    }

    if (forceRefresh) {
      setLoading(true);
    }
    setRefreshing(true);
    setError(null);

    try {
      console.log("AnimalHistoryPage fetching for animalId:", animalId, "page:", page, "limit:", limit);
      console.log("AnimalHistoryPage animalId type:", typeof animalId, "length:", animalId?.length);
      // Use proper limit parameter
      const result = await fetchAnimalHistory(animalId, page > 1 ? { page, limit } : { limit });
      console.log("AnimalHistoryPage API response:", result);

      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format');
      }

      const eventsData = result.data || [];
      console.log("AnimalHistoryPage eventsData:", eventsData);
      setEvents(eventsData);
      
      const paginationData = result.pagination || {
        page,
        limit,
        total: eventsData.length,
        hasNext: false,
        totalPages: Math.ceil(eventsData.length / limit)
      };

      setPagination({
        ...paginationData,
        totalPages: Math.ceil(paginationData.total / limit)
      });

      // Cache the successful response
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error("Failed to fetch animal history:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setEvents([]);
      setPagination({
        page,
        limit,
        total: 0,
        hasNext: false,
        totalPages: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [animalId, page, limit, filters, buildQueryString, getCacheKey]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!animalId) {
    return <div>Error: Animal ID is required</div>;
  }

  const handleRefresh = () => {
    // Clear ALL cache to force fresh fetch
    cacheRef.current.clear();
    
    fetchHistory(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination.totalPages > 0 && newPage > pagination.totalPages)) {
      return;
    }
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: HistoryFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleEventClick = (event: AnimalHistoryEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // REMOVED: Frontend sorting - trust backend order
  const formattedEvents = events.map(event => ({
    ...formatHistoryEvent(event),
    rawEvent: event // Pass raw event for click handlers
  }));

  const isFirstPage = page <= 1;
  // FIXED: Use only backend's hasNext signal
  const isLastPage = !pagination.hasNext;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2"
              onClick={() => navigate(`/farms/${farmId}/animals/${animalId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-muted-foreground" />
              Animal History
              {pagination.total > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({pagination.total} total)
                </span>
              )}
              {refreshing && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="gap-2"
                  disabled={refreshing || loading}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && showFilterPanel && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange({})}
                  className="h-auto p-0 text-xs"
                  disabled={refreshing || loading}
                >
                  Clear all
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Filtering by event type, date range, and user coming soon...
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Error State */}
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Failed to load history</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="mt-3 gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try again
                  </Button>
                </div>
              )}

              {/* Loading State (initial load only) */}
              {loading && !refreshing && !error && (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              )}

              {/* Events List - Shows during refresh with subtle overlay */}
              {(!loading || refreshing) && !error && formattedEvents.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <History className="mx-auto h-12 w-12 mb-4 opacity-40" />
                  <p className="mb-2 font-medium">No activity found</p>
                  <p className="text-sm opacity-70">
                    {filters.types || filters.fromDate || filters.toDate
                      ? "Try adjusting your filters"
                      : "Activity will appear here when events are recorded"}
                  </p>
                </div>
              ) : (
                // Show events even during refresh
                !error && formattedEvents.length > 0 && (
                  <div className={`space-y-3 ${refreshing ? 'opacity-70' : ''}`}>
                    {formattedEvents.map((item) => (
                      <div 
                        key={item.id}
                        className={onEventClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}
                        onClick={() => handleEventClick(item.rawEvent)}
                      >
                        <HistoryItem item={item} />
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Pagination */}
              {!loading && !error && pagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={isFirstPage || refreshing}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={isLastPage || refreshing}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Page {pagination.page} of {pagination.totalPages || 1}
                    </span>
                    
                    <span className="hidden sm:inline">•</span>
                    
                    <span>
                      Showing {(pagination.page - 1) * limit + 1}-
                      {Math.min(pagination.page * limit, pagination.total)} of {pagination.total}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground opacity-70">
                    {limit} per page
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Global cache invalidation helper
export const useHistoryCache = () => {
  const invalidateCache = useCallback((animalId?: string) => {
    const cache = getGlobalCache();
    
    if (animalId) {
      // Clear cache for specific animal
      const cacheKeyPattern = new RegExp(`^${animalId}-`);
      const keys = Array.from(cache.keys()).filter(key => cacheKeyPattern.test(key));
      keys.forEach(key => cache.delete(key));
    } else {
      // Clear all cache
      cache.clear();
    }
  }, []);

  return { invalidateCache };
};