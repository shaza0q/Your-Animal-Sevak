import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────

export const pageSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PageQuery = z.infer<typeof pageSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parsePage(query: Record<string, unknown>, defaultLimit = 20) {
  const result = pageSchema.safeParse({ ...query, limit: query.limit ?? defaultLimit });
  if (!result.success) {
    return { page: 1, limit: defaultLimit, skip: 0 };
  }
  const { page, limit } = result.data;
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  return { data, pagination: paginationMeta(page, limit, total) };
}
