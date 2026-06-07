import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  PawPrint,
  SkullIcon,
  DollarSignIcon,
  Users,
} from "lucide-react";
import FarmStaffSection from "@/components/FarmStaffSection";
import { getFarmData } from "@/api/getFarmData";
import { FarmSummaryDto } from "@/interface/farm.interface";

const FarmInsights = () => {
  const { id: farmId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [farmData, setFarmData] = useState<FarmSummaryDto | null>(null);
  const [loadingFarm, setLoadingFarm] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    const fetchFarm = async () => {
      try {
        setLoadingFarm(true);
        setError(null);
        const data = await getFarmData(farmId);
        setFarmData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load farm data");
      } finally {
        setLoadingFarm(false);
      }
    };

    fetchFarm();
  }, [farmId]);

  if (loadingFarm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading farm data...</p>
        </div>
      </div>
    );
  }

  if (error || !farmData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Farm</h2>
          <p className="text-muted-foreground mb-4">{error || "Farm data not available"}</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Farm Insights</h1>
                <p className="text-sm text-muted-foreground">
                  {farmData.name}
                  {farmData.location ? ` · ${farmData.location}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Farm Overview */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{farmData.name}</CardTitle>
                <CardDescription className="mt-1">
                  {farmData.animalTypes.length > 0
                    ? farmData.animalTypes.join(", ")
                    : "No animal types configured"}
                  {farmData.capacity ? ` · Capacity: ${farmData.capacity}` : ""}
                </CardDescription>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => navigate(`/farms/${farmData.id}/animals`)}
                  className="gap-2"
                >
                  <PawPrint className="h-4 w-4" />
                  View Animals
                </Button>
                <Button
                  className="gap-2"
                  variant="outline"
                  onClick={() => navigate(`/farms/${farmData.id}/animals?state=deceased`)}
                >
                  <SkullIcon className="h-4 w-4" />
                  Deceased
                </Button>
                <Button
                  className="gap-2"
                  variant="outline"
                  onClick={() => navigate(`/farms/${farmData.id}/animals?state=sold`)}
                >
                  <DollarSignIcon className="h-4 w-4" />
                  Sold
                </Button>
              </div>
            </div>
          </CardHeader>

          {farmData.animalTypes.length > 0 && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {farmData.animalTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() =>
                      navigate(`/farms/${farmData.id}/animals/type/${type.toLowerCase()}`)
                    }
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Farm Staff */}
        <FarmStaffSection farmId={farmId} isOwner={true} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for this farm</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button
              className="h-auto flex gap-2 py-5"
              variant="default"
              onClick={() => navigate("/addAnimal", { state: { farmId } })}
            >
              <Plus className="h-5 w-5" />
              <span>Add Animal</span>
            </Button>
            <Button
              className="h-auto flex gap-2 py-5"
              variant="outline"
              onClick={() => navigate(`/farms/${farmData.id}/animals`)}
            >
              <PawPrint className="h-5 w-5" />
              <span>All Animals</span>
            </Button>
            <Button
              className="h-auto flex gap-2 py-5"
              variant="outline"
              onClick={() => navigate("/compliance/death-cases")}
            >
              <SkullIcon className="h-5 w-5" />
              <span>Death Cases</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmInsights;
