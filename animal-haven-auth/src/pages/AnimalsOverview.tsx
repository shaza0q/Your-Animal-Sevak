import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Beef, Bird, Rabbit, PawPrint } from "lucide-react";
import { getUserData } from "@/api/getUserData";
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

const AnimalsOverview = () => {
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState<FarmSummaryDto | null>(null)
  const [animalOverview, setAnimalOverview] = useState<AnimalOverviewResponse | null>(null)


  const fetchUser = async () => {
    try {
      const user = await getUserData();
      setUser(user);
      return user;
    } catch (err) {
      console.error("Auth failed", err);
      throw err;
    }
  };

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

  const fetchAnimalOverview = async (farmId: string) => {
    try {
      const overview = await getAnimalOverview(farmId);
      setAnimalOverview(overview);
      return overview;
    } catch (err) {
      console.error("Animal overview fetch failed", err);
      throw err;
    }
  };
   
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        await fetchUser();
        await fetchFarm(farmId);
        await fetchAnimalOverview(farmId);

      } catch (error) {
        // ONE place decides what to do
        setUser(null);
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (farmId) {
      init();
    }
  }, [farmId, navigate]);


  if (!user) return null;

  /* --------------------have to add loading buffer page----------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-6 w-64" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
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
        </main>
      </div>
    );
  }


  if (!farm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Farm Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The requested farm could not be found.</p>
            <Button onClick={() => navigate("/directory")}>Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = animalOverview?.categories ?? []
  const totalAnimals = categories.reduce((sum, cat) => sum + cat.total, 0);
  const totalUnassigned = categories.reduce((sum, cat) => sum + cat.unassigned, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/directory")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{farm.name}</h1>
              <p className="text-sm text-muted-foreground">
                {totalAnimals} animals • {totalUnassigned > 0 && (
                  <span className="text-destructive">{totalUnassigned} unassigned</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <PawPrint className="h-5 w-5" />
          Animal Categories
        </h2>

        {loading ? (
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
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Animals Yet</h3>
              <p className="text-muted-foreground mb-4">
                This farm doesn't have any animals registered yet.
              </p>
              <Button onClick={() => navigate("/add-animal")}>Add First Animal</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Card 
                key={category.type}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                onClick={() => navigate(`/farms/${farmId}/animals/type/${category.type}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      {animalIcons[category.type] || animalIcons.default}
                    </div>
                    {category.unassigned > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {category.unassigned} unassigned
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {category.type}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {category.total} {category.total === 1 ? "animal" : "animals"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalsOverview;
