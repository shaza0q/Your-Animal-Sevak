import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Beef, Bird, Rabbit, PawPrint, Skull, History } from "lucide-react";
import { useBreadcrumbs } from "@/components/layout/breadcrumb-context";
import { getFarmData } from "@/api/getFarmData";
import { FarmSummaryDto } from "@/interface/farm.interface";
import { getAnimalOverview } from "@/api/getAnimalOverview";
import { AnimalOverviewResponse } from "@/interface";
import { AnimalType } from "@/enums/animal-type.enum";

const animalIcons: Record<string, React.ReactNode> = {
  [AnimalType.COW]: <Beef className="h-10 w-10" />,
  [AnimalType.BUFFALO]: <Beef className="h-10 w-10" />,
  [AnimalType.GOAT]: <Rabbit className="h-10 w-10" />,
  [AnimalType.SHEEP]: <Bird className="h-10 w-10" />,
  [AnimalType.CHICKEN]: <Bird className="h-10 w-10" />,
  [AnimalType.DUCK]: <Bird className="h-10 w-10" />,
  [AnimalType.RABBIT]: <Rabbit className="h-10 w-10" />,
  [AnimalType.DOG]: <PawPrint className="h-10 w-10" />,
  [AnimalType.CAT]: <PawPrint className="h-10 w-10" />,
  [AnimalType.CAMEL]: <PawPrint className="h-10 w-10" />,
  [AnimalType.DONKEY]: <PawPrint className="h-10 w-10" />,
  [AnimalType.HORSE]: <PawPrint className="h-10 w-10" />,
  [AnimalType.PIGEON]: <Bird className="h-10 w-10" />,
  [AnimalType.TURKEY]: <Bird className="h-10 w-10" />,
  default: <PawPrint className="h-10 w-10" />
};

// ================================
// Route-based mode detection
// ================================
type OverviewMode = "active" | "deceased" | "sold";

const AnimalsOverview = () => {
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId: string }>();
  const [searchParams] = useSearchParams();
  const state = (searchParams.get('state') || "active") as OverviewMode;
  
  const isDeceasedMode = state === "deceased";
  const isSoldMode = state === "sold";
  const isAuditView = isDeceasedMode || isSoldMode;
  
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState<FarmSummaryDto | null>(null);
  const [animalOverview, setAnimalOverview] = useState<AnimalOverviewResponse | null>(null);
  const [deceasedCount, setDeceasedCount] = useState<number>(0);

  const fetchFarm = async (farmId: string) => {
    try {
      const farm = await getFarmData(farmId);
      setFarm(farm);
      return farm;
    } catch (err) {
      console.error("Farm fetch failed", err);
      throw err;
    }
  };

  const fetchAnimalOverview = async (farmId: string, state: OverviewMode) => {
    try {
      const overview = await getAnimalOverview(farmId, state);
      setAnimalOverview(overview);
      return overview;
    } catch (err) {
      console.error("Animal overview fetch failed", err);
      throw err;
    }
  };

  // Fetch deceased count for active mode
  const fetchDeceasedCount = async (farmId: string): Promise<number> => {
    try {
      // Call your API to get deceased count
      const overview = await getAnimalOverview(farmId, "deceased");
      return overview?.categories?.reduce((sum, cat) => sum + cat.total, 0) || 0;
    } catch (err) {
      console.error("Deceased count fetch failed", err);
      return 0;
    }
  };
   
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        await fetchFarm(farmId);

        if (isAuditView) {
          // Fetch audit data
          await fetchAnimalOverview(farmId, state);
        } else {
          // Fetch active data + deceased count
          await fetchAnimalOverview(farmId, "active");
          const count = await fetchDeceasedCount(farmId);
          setDeceasedCount(count);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (farmId) {
      init();
    }
  }, [farmId, navigate, state, isAuditView]);

  useBreadcrumbs([
    { label: "Dashboard", to: "/dashboard" },
    { label: farm?.name ?? "Farm", to: `/farmInsights/${farmId}` },
    {
      label: isAuditView
        ? state === "deceased"
          ? "Deceased"
          : "Sold"
        : "Animals",
    },
  ]);

  // ================================
  // Loading State
  // ================================
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-4" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-full mb-4" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle>Farm Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">The requested farm could not be found.</p>
          <Button onClick={() => navigate("/directory")}>Back to Directory</Button>
        </CardContent>
      </Card>
    );
  }

  // ================================
  // Data Preparation - FIXED!
  // ================================
  const currentCategories = animalOverview?.categories ?? [];
  const totalCurrentAnimals = currentCategories.reduce((sum, cat) => sum + cat.total, 0);
  const totalUnassigned = currentCategories.reduce((sum, cat) => sum + cat.unassigned, 0);
  
  // Calculate total for audit view from current data
  const totalAuditAnimals = isAuditView ? totalCurrentAnimals : 0;

  // Helper functions
  const normalizeCategoryType = (type: string): string => {
    return type.toUpperCase();
  };

  const getRouteType = (type: string): string => {
    return type.toLowerCase();
  };

  const getCategoryIcon = (type: string): React.ReactNode => {
    const typeKey = normalizeCategoryType(type) as AnimalType;
    return animalIcons[typeKey] || animalIcons.default;
  };

  const getModeSwitchButton = () => {
    if (isAuditView) {
      return {
        label: "View Active Animals",
        icon: <PawPrint className="h-4 w-4 mr-2" />,
        onClick: () => navigate(`/farms/${farmId}/animals`),
        variant: "outline" as const
      };
    } else if (deceasedCount > 0) {
      return {
        label: `Review Historical Records (${deceasedCount})`,
        icon: <History className="h-4 w-4 mr-2" />,
        onClick: () => navigate(`/farms/${farmId}/animals?state=deceased`),
        variant: "outline" as const
      };
    }
    return null;
  };

  const modeSwitchButton = getModeSwitchButton();

  // Function to determine navigation path based on mode
  const getCategoryNavigation = (categoryType: string) => {
    const routeType = getRouteType(categoryType);
    if (isAuditView) {
      return `/farms/${farmId}/animals/type/${routeType}?state=${state}`;
    } else {
      return `/farms/${farmId}/animals/type/${routeType}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page heading + mode switch */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAuditView ? `${state === 'deceased' ? 'Deceased' : 'Sold'} Animals` : farm.name}
          </h1>
          <div className="text-sm text-muted-foreground">
            {isAuditView ? (
              <>
                <span>Audit and review for {farm.name}</span>
                {totalAuditAnimals > 0 && (
                  <span> • {totalAuditAnimals} total records</span>
                )}
              </>
            ) : (
              <>
                <span>{totalCurrentAnimals} active animals</span>
                {totalUnassigned > 0 && (
                  <span className="text-destructive"> • {totalUnassigned} unassigned</span>
                )}
              </>
            )}
          </div>
        </div>

        {modeSwitchButton && (
          <Button
            variant={modeSwitchButton.variant}
            size="sm"
            onClick={modeSwitchButton.onClick}
            className="gap-2"
          >
            {modeSwitchButton.icon}
            {modeSwitchButton.label}
          </Button>
        )}
      </div>

      <div>
        {/* Mode-specific title and description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
            {isAuditView ? (
              <>
                <History className="h-5 w-5 text-muted-foreground" />
                {state === 'deceased' ? 'Deceased' : 'Sold'} Animal Categories
              </>
            ) : (
              <>
                <PawPrint className="h-5 w-5" />
                Animal Categories
              </>
            )}
          </h2>
          <p className="text-muted-foreground">
            {isAuditView 
              ? `Review ${state === 'deceased' ? 'historical' : 'sales'} records by animal category for audit and learning purposes`
              : "Manage active animals by category"
            }
          </p>
        </div>

        {currentCategories.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center">
                {isAuditView ? (
                  <>
                    <div className="p-4 bg-muted/20 rounded-full mb-4">
                      <Skull className="h-12 w-12 text-muted-foreground opacity-40" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No {state === 'deceased' ? 'Historical' : 'Sales'} Records
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      {state === 'deceased' 
                        ? "No deceased animals have been recorded for this farm. This indicates healthy farm operations and thorough care practices."
                        : "No sold animals have been recorded for this farm."
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <PawPrint className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Animals Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      This farm doesn't have any animals registered yet.
                      Add your first animal to start managing your farm operations.
                    </p>
                  </>
                )}
                <div className="flex gap-3">
                  {isAuditView ? (
                    <>
                      <Button 
                        onClick={() => navigate(`/farms/${farmId}/animals`)}
                        variant="outline"
                      >
                        <PawPrint className="h-4 w-4 mr-2" />
                        View Active Animals
                      </Button>
                      <Button 
                        onClick={() => navigate(`/farms/${farmId}`)}
                      >
                        Return to Farm
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => navigate('/addAnimal', { state: { farmId } })}>
                      Add First Animal
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentCategories.map((category) => {
              const routeType = getRouteType(category.type);
              const categoryIcon = getCategoryIcon(category.type);
              
              return (
                <Card 
                  key={category.type}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    isAuditView 
                      ? "hover:border-border/80 bg-card/50" 
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => navigate(getCategoryNavigation(category.type))}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-full ${
                        isAuditView 
                          ? "bg-muted/30 text-muted-foreground" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        {categoryIcon}
                      </div>
                      {isAuditView ? (
                        <Badge variant="outline" className="text-xs bg-muted/30 text-muted-foreground border-muted">
                          {category.total} {category.total === 1 ? 'record' : 'records'}
                        </Badge>
                      ) : category.unassigned > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {category.unassigned} unassigned
                        </Badge>
                      ) : null}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {category.type}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.total} {category.total === 1 ? "animal" : "animals"}
                    </p>
                    
                    {isAuditView && (
                      <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/30">
                        Click to review audit records
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contextual Footer */}
        <div className="mt-12 pt-6 border-t border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              {isAuditView ? (
                <p className="italic">
                  {state === 'deceased' ? 'Historical' : 'Sales'} records are for audit and learning purposes only.
                  No operational actions are available in this view.
                </p>
              ) : (
                <p>
                  Manage your farm animals by category. 
                  Click on any category to view and manage animals.
                </p>
              )}
            </div>
            
            {/* Mode switch hint */}
            {!isAuditView && deceasedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate(`/farms/${farmId}/animals?state=deceased`)}
              >
                <History className="h-3 w-3 mr-1" />
                Review Historical Records ({deceasedCount})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalsOverview;