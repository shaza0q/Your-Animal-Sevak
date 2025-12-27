import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PawPrint, Calendar, Activity } from "lucide-react";

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  status: "healthy" | "injured" | "diseased" | "pregnant" | "vaccined";
  tagNumber?: string;
  weight?: string;
  lastCheckup?: string;
}

interface FarmAnimals {
  farmId: string;
  farmName: string;
  animals: Animal[];
}

const FarmAnimals = () => {
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId: string }>();
  const [user, setUser] = useState<any>(null);

  // Mock data - replace with actual API calls
  const farmAnimalsData: FarmAnimals[] = [
    {
      farmId: "farm1",
      farmName: "Sunshine Valley Farm",
      animals: [
        {
          id: "animal1",
          name: "Bessie",
          type: "Cow",
          breed: "Holstein",
          age: "3 years",
          status: "healthy",
          tagNumber: "SV-001",
          weight: "650 kg",
          lastCheckup: "2025-10-15"
        },
        {
          id: "animal2",
          name: "Daisy",
          type: "Cow",
          breed: "Jersey",
          age: "2 years",
          status: "pregnant",
          tagNumber: "SV-002",
          weight: "480 kg",
          lastCheckup: "2025-10-20"
        },
        {
          id: "animal3",
          name: "Max",
          type: "Bull",
          breed: "Angus",
          age: "4 years",
          status: "healthy",
          tagNumber: "SV-003",
          weight: "900 kg",
          lastCheckup: "2025-10-10"
        },
        {
          id: "animal4",
          name: "Rosie",
          type: "Cow",
          breed: "Holstein",
          age: "5 years",
          status: "vaccined",
          tagNumber: "SV-004",
          weight: "700 kg",
          lastCheckup: "2025-10-25"
        },
        {
          id: "animal5",
          name: "Bella",
          type: "Cow",
          breed: "Jersey",
          age: "1 year",
          status: "healthy",
          tagNumber: "SV-005",
          weight: "350 kg",
          lastCheckup: "2025-10-22"
        }
      ]
    },
    {
      farmId: "farm2",
      farmName: "Green Meadows Farm",
      animals: [
        {
          id: "animal6",
          name: "Luna",
          type: "Cow",
          breed: "Holstein",
          age: "5 years",
          status: "vaccined",
          tagNumber: "GM-001",
          weight: "720 kg",
          lastCheckup: "2025-10-18"
        },
        {
          id: "animal7",
          name: "Charlie",
          type: "Calf",
          breed: "Jersey",
          age: "6 months",
          status: "healthy",
          tagNumber: "GM-002",
          weight: "180 kg",
          lastCheckup: "2025-10-23"
        }
      ]
    }
  ];

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  if (!user) return null;

  const farmData = farmAnimalsData.find(f => f.farmId === farmId);

  if (!farmData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Farm Not Found</CardTitle>
            <CardDescription>The requested farm could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/directory")}>Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Animal["status"]) => {
    switch (status) {
      case "healthy":
        return "default";
      case "pregnant":
        return "secondary";
      case "vaccined":
        return "outline";
      case "injured":
      case "diseased":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusCounts = () => {
    return {
      healthy: farmData.animals.filter(a => a.status === "healthy").length,
      pregnant: farmData.animals.filter(a => a.status === "pregnant").length,
      vaccined: farmData.animals.filter(a => a.status === "vaccined").length,
      injured: farmData.animals.filter(a => a.status === "injured").length,
      diseased: farmData.animals.filter(a => a.status === "diseased").length,
    };
  };

  const statusCounts = getStatusCounts();

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
              <h1 className="text-2xl font-bold text-foreground">{farmData.farmName}</h1>
              <p className="text-sm text-muted-foreground">
                Managing {farmData.animals.length} {farmData.animals.length === 1 ? "animal" : "animals"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Overview Cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmData.animals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.healthy}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Pregnant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.pregnant}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Vaccined</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.vaccined}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.injured + statusCounts.diseased}</div>
            </CardContent>
          </Card>
        </div>

        {/* Animals Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              All Animals
            </h2>
            <Button size="sm">Add Animal</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {farmData.animals.map((animal) => (
              <Card key={animal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{animal.name}</CardTitle>
                      <CardDescription>{animal.type} • {animal.breed}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(animal.status)}>
                      {animal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tag Number</p>
                      <p className="font-medium">{animal.tagNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Age</p>
                      <p className="font-medium">{animal.age}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{animal.weight}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Checkup</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {animal.lastCheckup}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Activity className="h-3 w-3 mr-1" />
                      View History
                    </Button>
                    <Button size="sm" className="flex-1">Update</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FarmAnimals;
