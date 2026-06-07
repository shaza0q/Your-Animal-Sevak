import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  PawPrint,
  User,
  UserX,
  Stethoscope,
  Activity,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { fetchUser } from "@/utils/fetchUser";
import { AnimalType } from "@/enums/animal-type.enum";
import { cn } from "@/lib/utils";
import { User as UserInterface } from "@/interface/user.interface";
import { useAnimals, AnimalsFilters } from "@/hooks/useAnimals";
import { AnimalListItem } from "@/api/getAnimalsData";
import { format, differenceInMonths, differenceInYears } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANIMAL_TYPES = Object.values(AnimalType);

function calcAge(dob: string | null): string {
  if (!dob) return "Unknown";
  const birth = new Date(dob);
  const years = differenceInYears(new Date(), birth);
  const months = differenceInMonths(new Date(), birth) % 12;
  if (years === 0) return months <= 0 ? "< 1 month" : `${months} mo`;
  return months > 0 ? `${years} yr ${months} mo` : `${years} yr`;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Active: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  },
  Sold: {
    label: "Sold",
    className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400",
  },
  Deceased: {
    label: "Deceased",
    className: "bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-400",
  },
};

const genderConfig: Record<string, string> = {
  Male: "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-400",
  Female: "bg-pink-500/15 text-pink-700 border-pink-500/30 dark:text-pink-400",
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const AnimalCardSkeleton = () => (
  <Card className="border-border/50">
    <CardHeader className="pb-2 pt-4 px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
    </CardHeader>
    <CardContent className="pt-2 pb-4 px-4 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
);

// ─── Animal card ──────────────────────────────────────────────────────────────
interface AnimalCardProps {
  animal: AnimalListItem;
  farmId: string;
  isOwner: boolean;
}

const AnimalCard = ({ animal, farmId, isOwner }: AnimalCardProps) => {
  const navigate = useNavigate();
  const status = statusConfig[animal.status] ?? {
    label: animal.status,
    className: "bg-muted text-muted-foreground",
  };
  const genderClass = genderConfig[animal.gender] ?? "";

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all border-border/50 group"
      onClick={() => navigate(`/farms/${farmId}/animals/${animal.id}`)}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-tight truncate group-hover:text-primary transition-colors">
              {animal.name}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5 font-mono">
              #{animal.tagNumber}
              <span className="font-sans mx-1">·</span>
              {animal.animalType}
              {animal.breed && ` · ${animal.breed}`}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0 text-xs font-medium", status.className)}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 px-4 space-y-2">
        {/* Gender + Age row */}
        <div className="flex items-center gap-2">
          {animal.gender && (
            <Badge
              variant="outline"
              className={cn("text-xs px-2 py-0 h-5", genderClass)}
            >
              {animal.gender}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {calcAge(animal.dateOfBirth)}
          </span>
          {animal.updatesCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              {animal.updatesCount}
            </span>
          )}
        </div>

        {/* Caretaker */}
        <div className="flex items-center gap-2 text-sm">
          {animal.caretaker?.id ? (
            <>
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate text-xs">
                {animal.caretaker.name}
              </span>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <UserX className="h-3.5 w-3.5 text-amber-500/70 shrink-0" />
                <span className="text-xs text-muted-foreground">Unassigned</span>
              </div>
              {isOwner && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/farms/${farmId}/animals/${animal.id}?assign=caretaker`);
                  }}
                >
                  Assign
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Vet */}
        {animal.veterinarian?.id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{animal.veterinarian.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const LIMIT = 12;

const AnimalsByCategory = () => {
  const navigate = useNavigate();
  const { farmId, animalType } = useParams<{
    farmId: string;
    animalType: string;
  }>();

  const [user, setUser] = useState<UserInterface | null>(null);

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<AnimalsFilters>({
    animalType: animalType,
    status: undefined,
    gender: undefined,
    breed: undefined,
    search: undefined,
  });
  const [page, setPage] = useState(1);

  // Auth
  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => navigate("/signin", { replace: true }));
  }, [navigate]);

  // Sync animalType URL param into filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, animalType }));
    setPage(1);
  }, [animalType]);

  // Debounced search — 400 ms
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput.trim() || undefined }));
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const setFilter = useCallback(
    <K extends keyof AnimalsFilters>(key: K, value: AnimalsFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setFilters({ animalType, status: undefined, gender: undefined, breed: undefined, search: undefined });
    setPage(1);
  }, [animalType]);

  const handleTypeChange = (value: string) => {
    if (value === "__all__") {
      navigate(`/farms/${farmId}/animals`);
    } else {
      navigate(`/farms/${farmId}/animals/type/${value}`);
    }
  };

  // TanStack Query
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useAnimals(
    farmId,
    filters,
    page,
    LIMIT,
  );

  const animals = data?.data ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const hasActiveFilters =
    !!filters.status ||
    !!filters.gender ||
    !!filters.breed ||
    !!filters.search;

  const displayType =
    animalType
      ? animalType.charAt(0).toUpperCase() + animalType.slice(1)
      : "All Animals";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/farms/${farmId}/animals`)}
                className="hover:bg-muted/60 shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {displayType}s
                </h1>
                {totalItems > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {totalItems} animal{totalItems !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/addAnimal")}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Animal
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* ── Filter bar ── */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 ml-1">
                  Active
                </Badge>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mt-3">
              {/* Search by tag number */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by tag number…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
                {searchInput && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchInput("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Animal type */}
              <Select
                value={animalType ?? "__all__"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All types</SelectItem>
                  {ANIMAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={filters.status ?? "__all__"}
                onValueChange={(v) =>
                  setFilter("status", v === "__all__" ? undefined : v)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>

              {/* Gender */}
              <Select
                value={filters.gender ?? "__all__"}
                onValueChange={(v) =>
                  setFilter("gender", v === "__all__" ? undefined : v)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Animal grid: loading → error → empty → content ── */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <AnimalCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage
            error={error}
            onRetry={() => refetch()}
            title="Could not load animals"
          />
        ) : animals.length === 0 ? (
          /* ── Empty states (three distinct cases) ── */
          <Card className="border-border/50">
            {filters.search ? (
              <EmptyState
                icon={SearchX}
                title={`No animals found for "${filters.search}"`}
                description="Check the tag number and try again."
                action={{ label: "Clear search", onClick: () => setSearchInput("") }}
              />
            ) : hasActiveFilters ? (
              <EmptyState
                icon={SearchX}
                title="No animals match your filters"
                description="Try adjusting or clearing your filters."
                action={{ label: "Clear filters", onClick: clearFilters }}
              />
            ) : (
              <EmptyState
                icon={PawPrint}
                title="No animals registered yet"
                description="Register your first animal to start tracking health, vaccinations, and updates."
                action={{ label: "Add Animal", to: "/addAnimal" }}
              />
            )}
          </Card>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity",
                isPlaceholderData && "opacity-60",
              )}
            >
              {animals.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  farmId={farmId!}
                  isOwner={true}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 bg-muted/30 rounded-lg border border-border/40">
                <p className="text-xs text-muted-foreground order-last sm:order-first">
                  Showing {(page - 1) * LIMIT + 1}–
                  {Math.min(page * LIMIT, totalItems)} of {totalItems} animals
                </p>

                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AnimalsByCategory;
