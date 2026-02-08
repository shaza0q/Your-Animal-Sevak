import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  AlertCircle,
  Skull,
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

// ================================
// TYPES AND INTERFACES
// ================================

type AnimalStatusMode = "active" | "deceased";

interface FilterState {
  // Common filters
  gender: "all" | "male" | "female";
  breed: string;
  caretakerName: string;
  vetName: string;
  
  // Active-only filters
  assigned?: "all" | "true" | "false";
  
  // Deceased-only filters
  cause?: string;
  dateRange?: "all" | "month" | "quarter" | "year";
}

// Extend Animal type for deceased-specific data
interface DeceasedAnimal extends Animal {
  dateOfDeath?: string;
  causeOfDeath?: string;
  ageAtDeath?: number;
  lastVeterinarianName?: string;
  lastCaretakerName?: string;
}

// ================================
// HELPER FUNCTIONS
// ================================

const getDefaultFilters = (mode: AnimalStatusMode): FilterState => {
  const commonFilters = {
    gender: "all" as const,
    breed: "",
    caretakerName: "",
    vetName: "",
  };

  if (mode === "deceased") {
    return {
      ...commonFilters,
      cause: "all",
      dateRange: "all",
    };
  }

  return {
    ...commonFilters,
    assigned: "all",
  };
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

const getCauseBadgeClasses = (cause?: string): string => {
  if (!cause) return "bg-muted/50 text-muted-foreground border-muted";
  
  const causeLower = cause.toLowerCase();
  if (causeLower.includes("natural")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (causeLower.includes("accident")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (causeLower.includes("disease")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (causeLower.includes("medical")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-muted/50 text-muted-foreground border-muted";
};

const getStatusBadgeClasses = (status: Animal["status"], isDeceasedMode: boolean): string => {
  if (isDeceasedMode) {
    return "bg-muted/30 text-muted-foreground border-muted";
  }
  
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

// ================================
// API INTEGRATION POINTS - MOCK IMPLEMENTATION
// ================================

/**
 * MOCK API: Fetch animals with status filter
 * This is where you'll integrate with your actual backend
 * 
 * @param farmId - Farm ID
 * @param animalType - Animal category (cows, pigs, etc.)
 * @param mode - "active" or "deceased"
 * @param page - Page number
 * @param limit - Items per page
 * @param filters - Applied filters
 * @returns Promise with animals data
 */
const fetchAnimalsByStatus = async (
  farmId: string,
  animalType: AnimalType,
  mode: AnimalStatusMode,
  page: number,
  limit: number,
  filters: FilterState
): Promise<{
  animals: Animal[] | DeceasedAnimal[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}> => {
  // ⚠️ IMPORTANT: This is a mock implementation
  // Replace with your actual API calls
  
  if (mode === "deceased") {
    // ============================================
    // MOCK API CALL FOR DECEASED ANIMALS
    // ============================================
    console.log(`Mock API: Fetching deceased ${animalType}s for farm ${farmId}`);
    console.log(`Page: ${page}, Limit: ${limit}, Filters:`, filters);
    
    // This would be your actual API call:
    // const response = await fetch(
    //   `/api/farms/${farmId}/animals?` +
    //   `category=${animalType}&` +
    //   `status=deceased&` +  // ⚠️ KEY: status=deceased
    //   `page=${page}&limit=${limit}&` +
    //   `cause=${filters.cause}&` +
    //   `dateRange=${filters.dateRange}&` +
    //   `breed=${filters.breed}&` +
    //   `caretaker=${filters.caretakerName}&` +
    //   `vet=${filters.vetName}`
    // );
    
    // Mock response - replace with actual API data
    const mockDeceasedAnimals: DeceasedAnimal[] = [
      {
        id: "dec-001",
        name: "Clover",
        tagNumber: "COW-001",
        breed: "Holstein",
        status: "deceased", // ⚠️ Backend should set this
        gender: "female",
        farmName: "Sunshine Farm",
        caretakerId: "care-001",
        caretakerName: "John Doe",
        veterinarianId: "vet-001",
        veterinarianName: "Dr. Smith",
        dateOfDeath: "2024-06-20",
        causeOfDeath: "Natural causes",
        ageAtDeath: 4.2,
        lastVeterinarianName: "Dr. Smith",
        lastCaretakerName: "John Doe",
      },
      // Add more mock deceased animals as needed
    ];
    
    return {
      animals: mockDeceasedAnimals,
      meta: {
        page,
        limit,
        total: mockDeceasedAnimals.length,
      },
    };
  } else {
    // ============================================
    // EXISTING API CALL FOR ACTIVE ANIMALS
    // ============================================
    console.log(`Mock API: Fetching active ${animalType}s for farm ${farmId}`);
    
    // This uses your existing fetchFarmAnimals utility
    // Add status=active or remove status filter based on your API
    const assignedFilter = filters.assigned === "all" 
      ? undefined 
      : filters.assigned === "true";
    
    return await fetchFarmAnimals(
      farmId,
      animalType,
      page,
      limit,
      assignedFilter,
      filters.gender === "all" ? undefined : filters.gender,
      filters.breed.trim() || undefined,
      filters.caretakerName.trim() || undefined,
      filters.vetName.trim() || undefined
      // ⚠️ Note: You might need to add status="active" if your backend supports it
    );
  }
};

// ================================
// MAIN COMPONENT
// ================================

const AnimalsByCategory = () => {
  const navigate = useNavigate();
  const { farmId, animalType, status = "active" } = useParams<{
    farmId: string;
    animalType: AnimalType;
    status?: AnimalStatusMode;
  }>();
  
  const mode: AnimalStatusMode = status === "deceased" ? "deceased" : "active";
  const isDeceasedMode = mode === "deceased";
  
  const [user, setUser] = useState<UserInterface | null>(null);
  const [farm, setFarm] = useState<FarmSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner] = useState(true); // Mock: would come from permissions check
  
  const [animalsData, setAnimalsData] = useState<{
    animals: Animal[] | DeceasedAnimal[];
    meta: {
      page: number;
      limit: number;
      total: number;
    };
  } | null>(null);

  // Initialize filters based on mode - CORRECT IMPLEMENTATION
  const [filters, setFilters] = useState<FilterState>(() => getDefaultFilters(mode));
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => getDefaultFilters(mode));
  const [isFilterOpen, setIsFilterOpen] = useState(!isDeceasedMode); // Closed by default for deceased

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset filters when mode changes - IMPORTANT FIX
  useEffect(() => {
    const newDefaultFilters = getDefaultFilters(mode);
    setFilters(newDefaultFilters);
    setAppliedFilters(newDefaultFilters);
    setPage(1); // Reset to first page
    setIsFilterOpen(!isDeceasedMode); // Adjust filter panel state
  }, [mode]);

  // Fetch animals when dependencies change
  useEffect(() => {
    const init = async () => {
      if (!farmId || !animalType) return;
      
      try {
        setLoading(true);

        const userData = await fetchUser();
        setUser(userData);

        const farmData = await fetchFarm(farmId);
        setFarm(farmData);

        // ⚠️ KEY INTEGRATION POINT: Use the unified fetch function
        const animalsData = await fetchAnimalsByStatus(
          farmId,
          animalType,
          mode,
          page,
          limit,
          appliedFilters
        );
        
        setAnimalsData(animalsData);
      } catch (error) {
        console.error("Failed to fetch animals:", error);
        setUser(null);
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [farmId, animalType, mode, page, limit, appliedFilters, navigate]);

  const allAnimals = animalsData?.animals ?? [];
  const displayType = animalType
    ? animalType.charAt(0).toUpperCase() + animalType.slice(1)
    : "";
  const total = animalsData?.meta?.total ?? 0;

  // Early returns
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

  const hasActiveFilters = useMemo(() => {
    const defaultFilters = getDefaultFilters(mode);
    return Object.entries(appliedFilters).some(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof FilterState];
      return JSON.stringify(value) !== JSON.stringify(defaultValue);
    });
  }, [appliedFilters, mode]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    const defaultFilters = getDefaultFilters(mode);
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit));
    setPage(1);
  };

  const handleAnimalClick = (animalId: string) => {
    const animal = allAnimals.find(a => a.id === animalId);
    
    if (isDeceasedMode) {
      // Navigate to read-only detail view for deceased animals
      navigate(`/farms/${farmId}/animals/${animalId}?view=readonly&context=deceased`);
    } else {
      // Original navigation for active animals
      navigate(`/farms/${farmId}/animals/${animalId}`);
    }
  };

  if (loading && paginatedAnimals.length === 0) {
    return (
      <LoadingState
        message={`Loading ${isDeceasedMode ? 'deceased ' : ''}${displayType.toLowerCase()}s...`}
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
              onClick={() => navigate(
                isDeceasedMode
                  ? `/farms/${farmId}/deceased` // Back to deceased overview
                  : `/farms/${farmId}/animals`  // Back to animal categories
              )}
              className="hover:bg-muted/60"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isDeceasedMode ? 'Deceased ' : ''}{displayType}s {!isDeceasedMode && `at ${farm.name}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {allAnimals.length} {isDeceasedMode ? 'records' : 'animals'}
                {isDeceasedMode && ' for audit and review'}
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
                      {isDeceasedMode ? 'Audit ' : ''}Filters
                    </CardTitle>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 text-xs px-2 py-0">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                  {/* Common Filters */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Gender
                    </Label>
                    <Select
                      value={filters.gender}
                      onValueChange={(value: FilterState["gender"]) =>
                        setFilters((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Breed
                    </Label>
                    <Input
                      placeholder="Search breed..."
                      value={filters.breed}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Caretaker
                    </Label>
                    <Input
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

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Veterinarian
                    </Label>
                    <Input
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

                  {/* Mode-Specific Filters */}
                  {!isDeceasedMode ? (
                    // Active-only filter: Assignment
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Assignment
                      </Label>
                      <Select
                        value={filters.assigned || "all"}
                        onValueChange={(value: FilterState["assigned"]) =>
                          setFilters((prev) => ({ ...prev, assigned: value }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="true">Assigned</SelectItem>
                          <SelectItem value="false">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    // Deceased-only filters
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Cause of Death
                        </Label>
                        <Select
                          value={filters.cause || "all"}
                          onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, cause: value }))
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="All causes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All causes</SelectItem>
                            <SelectItem value="natural">Natural</SelectItem>
                            <SelectItem value="accident">Accident</SelectItem>
                            <SelectItem value="disease">Disease</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Time Period
                        </Label>
                        <Select
                          value={filters.dateRange || "all"}
                          onValueChange={(value: FilterState["dateRange"]) =>
                            setFilters((prev) => ({ ...prev, dateRange: value }))
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="All time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All time</SelectItem>
                            <SelectItem value="month">Last month</SelectItem>
                            <SelectItem value="quarter">Last quarter</SelectItem>
                            <SelectItem value="year">Last year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
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
                      hasActiveFilters && "text-foreground hover:text-destructive",
                    )}
                    disabled={!hasActiveFilters}
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
              {isDeceasedMode ? (
                <Skull className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
              ) : null}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {hasActiveFilters
                  ? "No Results Found"
                  : isDeceasedMode
                  ? `No Deceased ${displayType}s Recorded`
                  : `No ${displayType}s Found`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "No records match the applied filters. Try adjusting your search criteria."
                  : isDeceasedMode
                  ? "This indicates healthy farm operations and thorough care practices."
                  : `There are no ${displayType.toLowerCase()}s registered in this farm.`}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={handleClearFilters} size="sm">
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
              {paginatedAnimals.map((animal) => {
                const deceasedAnimal = isDeceasedMode ? animal as DeceasedAnimal : null;
                
                return (
                  <Card
                    key={animal.id}
                    className={cn(
                      "cursor-pointer border-border/50 hover:border-border/80 transition-colors",
                      isDeceasedMode ? "bg-card/50" : "card-hover-lift"
                    )}
                    onClick={() => handleAnimalClick(animal.id)}
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
                            getStatusBadgeClasses(animal.status, isDeceasedMode)
                          )}
                        >
                          {isDeceasedMode ? 'Deceased' : animal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4 px-4 space-y-2.5">
                      {/* Farm name - only for active animals */}
                      {!isDeceasedMode && animal.farmName && (
                        <div className="text-sm text-muted-foreground">
                          {animal.farmName}
                        </div>
                      )}

                      {/* Date of Death - only for deceased animals */}
                      {isDeceasedMode && deceasedAnimal?.dateOfDeath && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground">
                            {new Date(deceasedAnimal.dateOfDeath).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({formatTimeAgo(deceasedAnimal.dateOfDeath)})
                          </span>
                        </div>
                      )}

                      {/* Cause of Death - only for deceased animals */}
                      {isDeceasedMode && deceasedAnimal?.causeOfDeath && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-2 py-0.5",
                              getCauseBadgeClasses(deceasedAnimal.causeOfDeath)
                            )}
                          >
                            {deceasedAnimal.causeOfDeath}
                          </Badge>
                        </div>
                      )}

                      {/* Caretaker Assignment */}
                      <div className="flex items-center gap-2 text-sm">
                        {animal.caretakerId ? (
                          <>
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground truncate">
                              {animal.caretakerName}
                              {isDeceasedMode && ' (Last assigned)'}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <UserX className={cn(
                                "h-3.5 w-3.5",
                                isDeceasedMode ? "text-muted-foreground" : "text-destructive/70"
                              )} />
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs px-1.5 py-0 h-5",
                                  isDeceasedMode 
                                    ? "bg-muted/30 text-muted-foreground border-muted"
                                    : "badge-unassigned"
                                )}
                              >
                                {isDeceasedMode ? 'Not assigned' : 'Not Assigned'}
                              </Badge>
                            </div>
                            {/* Only show Assign button for active animals */}
                            {!isDeceasedMode && isOwner && (
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
                            {isDeceasedMode && ' (Last treated)'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className={cn(
                "mt-6 py-3 px-4 rounded-lg border",
                isDeceasedMode 
                  ? "bg-muted/10 border-border/30" 
                  : "bg-muted/30 border-border/40"
              )}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">
                      Show:
                    </Label>
                    <Select value={String(limit)} onValueChange={handleLimitChange}>
                      <SelectTrigger className="w-16 h-7 text-xs">
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