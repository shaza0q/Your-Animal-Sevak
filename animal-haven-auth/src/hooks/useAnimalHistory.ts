// 📁 src/hooks/useAnimalHistory.ts
import { useState, useCallback, useMemo } from "react";
import { AnimalHistoryEvent } from "@/types/animal-history";

interface UseAnimalHistoryOptions {
  limit?: number;
  page?: number;
  eventTypes?: AnimalHistoryEvent["type"][];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

interface HistoryResponse {
  data: AnimalHistoryEvent[];
  pagination: Pagination;
}

export function useAnimalHistory(animalId?: string, options: UseAnimalHistoryOptions = {}) {
  const [events, setEvents] = useState<AnimalHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: options.page || 1,
    limit: options.limit || 20,
    total: 0,
    hasNext: false
  });

  const fetchHistory = useCallback(async (page = pagination.page, append = false) => {
    if (!animalId) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(options.limit || 20),
        ...(options.eventTypes?.length && { 
          eventTypes: options.eventTypes.join(',') 
        })
      });

      const response = await fetch(`/api/animals/${animalId}/history?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const result: HistoryResponse = await response.json();
      
      setEvents(prev => append ? [...prev, ...result.data] : result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [animalId, options.limit, options.eventTypes, pagination.page]);

  const loadMore = useCallback(() => {
    if (pagination.hasNext) {
      return fetchHistory(pagination.page + 1, true);
    }
  }, [pagination, fetchHistory]);

  // Memoized formatted events
  const formattedEvents = useMemo(() => 
    events.map(formatHistoryEvent),
    [events]
  );

  return {
    events,
    formattedEvents,
    loading,
    error,
    pagination,
    fetchHistory,
    loadMore,
    hasMore: pagination.hasNext
  };
}