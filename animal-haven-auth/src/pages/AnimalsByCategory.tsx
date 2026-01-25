import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  User,
  UserX,
  Stethoscope,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Animal } from "@/types/animal";
import { fetchUser } from "@/utils/fetchUser";
import { AnimalType } from "@/enums/animal-type.enum";
import { fetchFarm } from "@/utils/fetchFarm";
import { FarmSummaryDto } from "@/interface/farm.interface";
import { fetchFarmAnimals } from "@/utils/fetchFarmAnimals";
import LoadingState from "@/components/LoadingState";
import { cn } from "@/lib/utils";
import { User as UserInterface } from "@/interface/user.interface";

interface FilterState {
  assigned: "all" | "true" | "false";
  gender: "all" | "male" | "female";
  breed: string;
  caretakerName: string;
  vetName: string;
}

const defaultFilters: FilterState = {
  assigned: "all",
  gender: "all",
  breed: "",
  caretakerName: "",
  vetName: "",
};

const AnimalsByCategory = () => {
  const navigate = useNavigate();
  const { farmId, animalType } = useParams<{
    farmId: string;
    animalType: AnimalType;
  }>();
  const [user, setUser] = useState<UserInterface | null>(null);
  const [farm, setFarm] = useState<FarmSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner] = useState(true); // Mock: would come from permissions check
  const [animalsData, setAnimalsData] = useState<{
    animals: Animal[];
    meta: {
      page: number;
      limit: number;
      total: number;
    };
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const userData = await fetchUser();
        setUser(userData);

        const farmData = await fetchFarm(farmId);
        setFarm(farmData);

        const animalsData = await fetchFarmAnimals(
          farmId,
          animalType,
          page,
          limit,
          appliedFilters.assigned === "all"
            ? undefined
            : appliedFilters.assigned === "true",
          appliedFilters.gender === "all" ? undefined : appliedFilters.gender,
          appliedFilters.breed.trim() || undefined,
          appliedFilters.caretakerName.trim() || undefined,
          appliedFilters.vetName.trim() || undefined,
        );
        setAnimalsData(animalsData);
      } catch (error) {
        setUser(null);
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (farmId && animalType) init();
  }, [farmId, animalType, page, navigate, appliedFilters]);

  const allAnimals = animalsData?.animals ?? [];
  const displayType = animalType
    ? animalType.charAt(0).toUpperCase() + animalType.slice(1)
    : "";
  const total = animalsData?.meta?.[0]?.total ?? 0;

  // Early returns AFTER all hooks
  if (!user) return null;

  if (!farm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Farm Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested farm could not be found.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pagination calculations
  const totalItems = allAnimals.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedAnimals = allAnimals.slice(startIndex, endIndex);

  const hasActiveFilters =
    appliedFilters.assigned !== "all" ||
    appliedFilters.gender !== "all" ||
    appliedFilters.breed.trim() !== "" ||
    appliedFilters.caretakerName.trim() !== "" ||
    appliedFilters.vetName.trim() !== "";

  const hasPendingFilters =
    JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setLoading(true);
      setTimeout(() => setLoading(false), 200);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit));
    setPage(1);
    setLoading(true);
    setTimeout(() => setLoading(false), 200);
  };

  const getStatusBadgeClasses = (status: Animal["status"]) => {
    switch (status) {
      case "healthy":
        return "badge-healthy";
      case "pregnant":
        return "badge-pregnant";
      case "vaccined":
        return "badge-vaccinated";
      case "injured":
      case "diseased":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "sold":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "default";
    }
  };

  if (loading && paginatedAnimals.length === 0) {
    return (
      <LoadingState
        message={`Loading ${displayType.toLowerCase()}s for ${farm.name}...`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/farms/${farmId}/animals`)}
              className="hover:bg-muted/60"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {displayType}s at {farm.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {allAnimals.length}{" "}
                {allAnimals.length === 1 ? "animal" : "animals"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filter Section */}
        <Collapsible
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          className="mb-6"
        >
          <Card className="border-border/50 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-medium">
                      Filters
                    </CardTitle>
                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="ml-2 text-xs px-2 py-0"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isFilterOpen && "rotate-180",
                    )}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
              <CardContent className="pt-0 pb-4 px-4">
                {/* Row 1: Assignment, Gender, Breed */}
                <div className="grid gap-4 sm:grid-cols-3 mb-4">
                  {/* Assignment Filter */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="assigned"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Assignment
                    </Label>
                    <Select
                      value={filters.assigned}
                      onValueChange={(value: FilterState["assigned"]) =>
                        setFilters((prev) => ({ ...prev, assigned: value }))
                      }
                    >
                      <SelectTrigger id="assigned" className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Assigned</SelectItem>
                        <SelectItem value="false">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender Filter */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="gender"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Gender
                    </Label>
                    <Select
                      value={filters.gender}
                      onValueChange={(value: FilterState["gender"]) =>
                        setFilters((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger id="gender" className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Breed Filter */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="breed"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Breed
                    </Label>
                    <Input
                      id="breed"
                      placeholder="Search breed..."
                      value={filters.breed}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Caretaker Name Filter */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="caretakerName"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Caretaker
                    </Label>
                    <Input
                      id="caretakerName"
                      placeholder="Search caretaker..."
                      value={filters.caretakerName}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          caretakerName: e.target.value,
                        }))
                      }
                      className="h-9"
                    />
                  </div>

                  {/* Veterinarian Name Filter */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="vetName"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Veterinarian
                    </Label>
                    <Input
                      id="vetName"
                      placeholder="Search vet..."
                      value={filters.vetName}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          vetName: e.target.value,
                        }))
                      }
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <Button onClick={handleApplyFilters} size="sm">
                    Apply Filters
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    size="sm"
                    className={cn(
                      "text-muted-foreground",
                      (hasActiveFilters || hasPendingFilters) &&
                        "text-foreground hover:text-destructive",
                    )}
                    disabled={!hasActiveFilters && !hasPendingFilters}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Animal Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
              <Card key={i} className="animate-pulse border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="h-5 w-28 bg-muted rounded mb-2" />
                      <div className="h-3.5 w-40 bg-muted/70 rounded" />
                    </div>
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted/50 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted/50 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedAnimals.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {hasActiveFilters
                  ? "No Results Found"
                  : `No ${displayType}s Found`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "No animals match the applied filters. Try adjusting your search criteria."
                  : `There are no ${displayType.toLowerCase()}s registered in this farm.`}
              </p>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate(`/farms/${farmId}/animals`)}>
                  Back to Categories
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedAnimals.map((animal) => (
                <Card
                  key={animal.id}
                  className="cursor-pointer card-hover-lift border-border/50 hover:border-primary/40"
                  onClick={() =>
                    navigate(`/farms/${farmId}/animals/${animal.id}`)
                  }
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold leading-tight truncate">
                          {animal.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-0.5">
                          {animal.tagNumber} · {animal.breed}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-xs font-medium capitalize",
                          getStatusBadgeClasses(animal.status),
                        )}
                      >
                        {animal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4 px-4 space-y-2.5">
                    <div className="text-sm text-muted-foreground">
                      {animal.farmName}
                    </div>

                    {/* Caretaker Assignment */}
                    <div className="flex items-center gap-2 text-sm">
                      {animal.caretakerId ? (
                        <>
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">
                            {animal.caretakerName}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <UserX className="h-3.5 w-3.5 text-destructive/70" />
                            <Badge
                              variant="outline"
                              className="badge-unassigned text-xs px-1.5 py-0 h-5"
                            >
                              Not Assigned
                            </Badge>
                          </div>
                          {isOwner && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/farms/${farmId}/animals/${animal.id}?assign=caretaker`,
                                );
                              }}
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Veterinarian */}
                    {animal.veterinarianId && (
                      <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">
                          {animal.veterinarianName}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="mt-6 py-3 px-4 bg-muted/30 rounded-lg border border-border/40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="pageSize"
                      className="text-xs text-muted-foreground whitespace-nowrap"
                    >
                      Show:
                    </Label>
                    <Select
                      value={String(limit)}
                      onValueChange={handleLimitChange}
                    >
                      <SelectTrigger id="pageSize" className="w-16 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page Indicator */}
                  <div className="text-xs text-muted-foreground text-center order-first sm:order-none">
                    Page {page} of {totalPages} · Showing {startIndex + 1}–
                    {Math.min(endIndex, totalItems)}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                      Prev
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="h-7 px-2 text-xs"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </Button>
                  </div>
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
