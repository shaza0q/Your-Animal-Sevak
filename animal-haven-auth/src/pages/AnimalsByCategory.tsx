import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, UserX, Stethoscope } from "lucide-react";
import { getAnimalsByType, mockFarms } from "@/data/mockAnimals";
import { Animal } from "@/types/animal";

const AnimalsByCategory = () => {
  const navigate = useNavigate();
  const { farmId, animalType } = useParams<{ farmId: string; animalType: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner] = useState(true); // Mock: would come from permissions check

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    setUser(JSON.parse(currentUser));
    setTimeout(() => setLoading(false), 500);
  }, [navigate]);

  if (!user) return null;

  const farm = farmId ? mockFarms[farmId] : null;

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

  const animals = animalType ? getAnimalsByType(farmId!, animalType) : [];
  const displayType = animalType ? animalType.charAt(0).toUpperCase() + animalType.slice(1) : "";

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
      case "sold":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/farms/${farmId}/animals`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {displayType}s at {farm.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {animals.length} {animals.length === 1 ? "animal" : "animals"} in this category
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : animals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">No {displayType}s Found</h3>
              <p className="text-muted-foreground mb-4">
                There are no {displayType.toLowerCase()}s registered in this farm.
              </p>
              <Button onClick={() => navigate(`/farms/${farmId}/animals`)}>
                Back to Categories
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {animals.map((animal) => (
              <Card 
                key={animal.id}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                onClick={() => navigate(`/farms/${farmId}/animals/${animal.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{animal.name}</CardTitle>
                      <CardDescription>
                        {animal.tagNumber} • {animal.breed}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(animal.status)}>
                      {animal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {animal.farmName}
                  </div>

                  {/* Caretaker Assignment */}
                  <div className="flex items-center gap-2 text-sm">
                    {animal.caretakerId ? (
                      <>
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{animal.caretakerName}</span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 text-destructive" />
                        <Badge variant="outline" className="text-destructive border-destructive">
                          Not Assigned
                        </Badge>
                        {isOwner && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="ml-auto h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/farms/${farmId}/animals/${animal.id}?assign=caretaker`);
                            }}
                          >
                            Assign
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Veterinarian */}
                  {animal.veterinarianId && (
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{animal.veterinarianName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalsByCategory;
