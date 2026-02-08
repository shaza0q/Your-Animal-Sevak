import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Archive,
  Download,
  CalendarIcon,
  FileText,
  Activity,
  Clock,
  Heart,
} from "lucide-react";
import { mockAnimals } from "@/data/mockAnimals";
import { getDeceasedRecordOrPlaceholder } from "@/data/mockDeceasedRecords";
import { Animal } from "@/types/animal";
import { AgeAtDeathRange, ageAtDeathRangeLabels, causeOfDeathLabels, CauseOfDeathType } from "@/types/deceased";
import DeceasedAnimalDetailDrawer from "@/components/deceased-animal-detail/DeceasedAnimalDetailDrawer";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { fetchUser } from "@/utils/fetchUser";
import { User } from "@/interface";

// Types
type TimeframePreset = "this-month" | "this-quarter" | "this-year" | "custom" | "all";

interface FilterState {
  timeframe: TimeframePreset;
  customDateFrom: Date | undefined;
  customDateTo: Date | undefined;
  category: string;
  causeOfDeath: CauseOfDeathType | "all";
  caretakerName: string;
  vetName: string;
  ageAtDeath: AgeAtDeathRange;
  location: string;
  vetConfirmed: "all" | "yes" | "no";
}

const defaultFilters: FilterState = {
  timeframe: "all",
  customDateFrom: undefined,
  customDateTo: undefined,
  category: "all",
  causeOfDeath: "all",
  caretakerName: "",
  vetName: "",
  ageAtDeath: "all",
  location: "",
  vetConfirmed: "all",
};

// Mock metrics data structure (UI-only, no real calculations)
interface DeceasedMetrics {
  totalDeceased: number;
  deceasedThisPeriod: number;
  mostDocumentedCause: string;
  averageLifespanAtDeath: string;
}

const DeceasedAnimals = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Detail drawer state
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get all deceased animals across all farms
  const deceasedAnimals = useMemo(() => {
    return mockAnimals.filter((a) => a.status === "deceased");
  }, []);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const types = new Set(deceasedAnimals.map((a) => a.type));
    return Array.from(types);
  }, [deceasedAnimals]);

  // Get unique locations from deceased records
  const locations = useMemo(() => {
    const locs = new Set<string>();
    deceasedAnimals.forEach((a) => {
      const record = getDeceasedRecordOrPlaceholder(a.id, a.name);
      if (record.location && record.location !== "Location not recorded") {
        locs.add(record.location);
      }
    });
    return Array.from(locs);
  }, [deceasedAnimals]);

  // Apply filters
  const filteredAnimals = useMemo(() => {
    let result = [...deceasedAnimals];

    // Category filter
    if (appliedFilters.category !== "all") {
      result = result.filter((a) => a.type === appliedFilters.category);
    }

    // Caretaker name filter
    if (appliedFilters.caretakerName.trim()) {
      const search = appliedFilters.caretakerName.toLowerCase();
      result = result.filter((a) => a.caretakerName?.toLowerCase().includes(search));
    }

    // Vet name filter
    if (appliedFilters.vetName.trim()) {
      const search = appliedFilters.vetName.toLowerCase();
      result = result.filter((a) => a.veterinarianName?.toLowerCase().includes(search));
    }

    // Location filter
    if (appliedFilters.location.trim()) {
      const search = appliedFilters.location.toLowerCase();
      result = result.filter((a) => {
        const record = getDeceasedRecordOrPlaceholder(a.id, a.name);
        return record.location?.toLowerCase().includes(search);
      });
    }

    // Vet confirmed filter
    if (appliedFilters.vetConfirmed !== "all") {
      result = result.filter((a) => {
        const record = getDeceasedRecordOrPlaceholder(a.id, a.name);
        const isConfirmed = !!record.deathRecord.confirmedBy;
        return appliedFilters.vetConfirmed === "yes" ? isConfirmed : !isConfirmed;
      });
    }

    return result;
  }, [deceasedAnimals, appliedFilters]);

  // Compute static metrics (UI placeholders - would come from API in production)
  const metrics: DeceasedMetrics = useMemo(() => {
    return {
      totalDeceased: deceasedAnimals.length,
      deceasedThisPeriod: Math.min(deceasedAnimals.length, 2), // Mock value
      mostDocumentedCause: deceasedAnimals.length > 0 ? "Natural" : "—",
      averageLifespanAtDeath: deceasedAnimals.length > 0 ? "4.2 years" : "—",
    };
  }, [deceasedAnimals]);

  // Pagination
  const totalItems = filteredAnimals.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

  // Filter state checks
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.timeframe !== "all") count++;
    if (appliedFilters.category !== "all") count++;
    if (appliedFilters.causeOfDeath !== "all") count++;
    if (appliedFilters.caretakerName.trim()) count++;
    if (appliedFilters.vetName.trim()) count++;
    if (appliedFilters.ageAtDeath !== "all") count++;
    if (appliedFilters.location.trim()) count++;
    if (appliedFilters.vetConfirmed !== "all") count++;
    return count;
  }, [appliedFilters]);

  const hasActiveFilters = activeFilterCount > 0;
  const hasPendingFilters = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  useEffect(() => {
    const currentUser = fetchUser();
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    setUser(currentUser);
    setTimeout(() => setLoading(false), 500);
  }, [navigate]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
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

  const handleAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Export triggered with filters:", appliedFilters);
  };

  // Get the deceased record for the selected animal
  const selectedDeceasedRecord = useMemo(() => {
    if (!selectedAnimal) return null;
    return getDeceasedRecordOrPlaceholder(selectedAnimal.id, selectedAnimal.name);
  }, [selectedAnimal]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/directory")}
                className="hover:bg-muted/60"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Deceased Animals</h1>
                <p className="text-sm text-muted-foreground">
                  Historical records for audit and compliance review
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics Bar - Refined copy */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Total Deceased
              </CardDescription>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{metrics.totalDeceased}</p>
              <p className="text-xs text-muted-foreground mt-1">All-time records</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Deaths This Period
              </CardDescription>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{metrics.deceasedThisPeriod}</p>
              <p className="text-xs text-muted-foreground mt-1">Current month</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Most Documented Cause
              </CardDescription>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{metrics.mostDocumentedCause}</p>
              <p className="text-xs text-muted-foreground mt-1">Primary recorded cause</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Avg. Lifespan at Death
              </CardDescription>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{metrics.averageLifespanAtDeath}</p>
              <p className="text-xs text-muted-foreground mt-1">By category average</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <Card className="border-border/50 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-medium">Filters</CardTitle>
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs px-2 py-0">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isFilterOpen && "rotate-180"
                    )}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
              <CardContent className="pt-0 pb-4 px-4">
                {/* Row 1: Timeframe, Category, Cause, Age at Death */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                  {/* Timeframe Filter */}
                  <div className="space-y-1.5">
                    <Label htmlFor="timeframe" className="text-xs font-medium text-muted-foreground">
                      Timeframe
                    </Label>
                    <Select
                      value={filters.timeframe}
                      onValueChange={(value: TimeframePreset) =>
                        setFilters((prev) => ({ ...prev, timeframe: value }))
                      }
                    >
                      <SelectTrigger id="timeframe" className="h-9">
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="this-month">This month</SelectItem>
                        <SelectItem value="this-quarter">This quarter</SelectItem>
                        <SelectItem value="this-year">This year</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
                      Category / Species
                    </Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger id="category" className="h-9">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cause of Death Filter */}
                  <div className="space-y-1.5">
                    <Label htmlFor="causeOfDeath" className="text-xs font-medium text-muted-foreground">
                      Cause of Death
                    </Label>
                    <Select
                      value={filters.causeOfDeath}
                      onValueChange={(value: CauseOfDeathType | "all") =>
                        setFilters((prev) => ({ ...prev, causeOfDeath: value }))
                      }
                    >
                      <SelectTrigger id="causeOfDeath" className="h-9">
                        <SelectValue placeholder="All causes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All causes</SelectItem>
                        {Object.entries(causeOfDeathLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age at Death Filter */}
                  <div className="space-y-1.5">
                    <Label htmlFor="ageAtDeath" className="text-xs font-medium text-muted-foreground">
                      Age at Death
                    </Label>
                    <Select
                      value={filters.ageAtDeath}
                      onValueChange={(value: AgeAtDeathRange) =>
                        setFilters((prev) => ({ ...prev, ageAtDeath: value }))
                      }
                    >
                      <SelectTrigger id="ageAtDeath" className="h-9">
                        <SelectValue placeholder="All ages" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ageAtDeathRangeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Custom date range (shown when custom is selected) */}
                {filters.timeframe === "custom" && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 w-full justify-start text-left font-normal",
                              !filters.customDateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.customDateFrom
                              ? format(filters.customDateFrom, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.customDateFrom}
                            onSelect={(date) =>
                              setFilters((prev) => ({ ...prev, customDateFrom: date }))
                            }
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 w-full justify-start text-left font-normal",
                              !filters.customDateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.customDateTo
                              ? format(filters.customDateTo, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.customDateTo}
                            onSelect={(date) =>
                              setFilters((prev) => ({ ...prev, customDateTo: date }))
                            }
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Row 3: Location, Vet Confirmed */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-medium text-muted-foreground">
                      Location / Pen
                    </Label>
                    <Input
                      id="location"
                      placeholder="Search location..."
                      value={filters.location}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, location: e.target.value }))
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vetConfirmed" className="text-xs font-medium text-muted-foreground">
                      Confirmed by Veterinarian
                    </Label>
                    <Select
                      value={filters.vetConfirmed}
                      onValueChange={(value: "all" | "yes" | "no") =>
                        setFilters((prev) => ({ ...prev, vetConfirmed: value }))
                      }
                    >
                      <SelectTrigger id="vetConfirmed" className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes — Vet confirmed</SelectItem>
                        <SelectItem value="no">No — Pending confirmation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Assigned Staff */}
                <div className="grid gap-4 sm:grid-cols-2 mb-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="caretakerName" className="text-xs font-medium text-muted-foreground">
                      Caretaker
                    </Label>
                    <Input
                      id="caretakerName"
                      placeholder="Search caretaker..."
                      value={filters.caretakerName}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, caretakerName: e.target.value }))
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vetName" className="text-xs font-medium text-muted-foreground">
                      Veterinarian
                    </Label>
                    <Input
                      id="vetName"
                      placeholder="Search veterinarian..."
                      value={filters.vetName}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, vetName: e.target.value }))
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
                    size="sm"
                    onClick={handleClearFilters}
                    className={cn(
                      "text-muted-foreground",
                      (hasActiveFilters || hasPendingFilters) &&
                        "text-foreground hover:text-destructive"
                    )}
                    disabled={!hasActiveFilters && !hasPendingFilters}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Reset all
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Main Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              // Loading State
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : paginatedAnimals.length === 0 ? (
              // Empty State
              <div className="py-16 px-4 text-center">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No deceased animals recorded
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This indicates healthy operations and thorough care. Records will appear here when animal mortality events are documented.
                </p>
              </div>
            ) : (
              // Data Table
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[140px]">ID / Tag</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date of Death</TableHead>
                      <TableHead>Cause</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAnimals.map((animal) => {
                      const record = getDeceasedRecordOrPlaceholder(animal.id, animal.name);
                      return (
                        <TableRow
                          key={animal.id}
                          onClick={() => handleAnimalClick(animal)}
                          className="cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {animal.tagNumber}
                          </TableCell>
                          <TableCell className="font-medium">{animal.name}</TableCell>
                          <TableCell className="capitalize">{animal.type}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="text-sm">
                                {record.deathRecord.dateOfDeath !== "Unknown"
                                  ? format(new Date(record.deathRecord.dateOfDeath), "MMM d, yyyy")
                                  : animal.lastCheckup
                                    ? format(new Date(animal.lastCheckup), "MMM d, yyyy")
                                    : "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {record.deathRecord.dateOfDeath !== "Unknown"
                                  ? formatDistanceToNow(new Date(record.deathRecord.dateOfDeath), {
                                      addSuffix: true,
                                    })
                                  : animal.lastCheckup
                                    ? formatDistanceToNow(new Date(animal.lastCheckup), {
                                        addSuffix: true,
                                      })
                                    : ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-muted/50 text-muted-foreground border-border"
                            >
                              {causeOfDeathLabels[record.deathRecord.causeOfDeath]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className="badge-deceased">Deceased</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page:</span>
                      <Select value={String(limit)} onValueChange={handleLimitChange}>
                        <SelectTrigger className="h-8 w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Drawer */}
      <DeceasedAnimalDetailDrawer
        animal={selectedAnimal}
        deceasedRecord={selectedDeceasedRecord}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

export default DeceasedAnimals;
