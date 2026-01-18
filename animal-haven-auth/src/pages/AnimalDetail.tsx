import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Activity,
  Syringe,
  Heart,
  Tag,
  MapPin,
  User,
  UserX,
  Stethoscope
} from "lucide-react";
import { getAnimalUpdates } from "@/data/mockAnimals";
import { Animal, AnimalUpdate } from "@/types/animal";
import { type AnimalDetail, getCaretakerId, getVeterinarianId, getCaretakerName, getVeterinarianName, getAnimalType } from "@/interfaces/animal-detail.interface";
import { fetchUser } from "@/utils/fetchUser";
import { fetchAnimalDetail } from "@/utils/fetchAnimalDetail";
import AnimalAssignmentSection from "@/components/AnimalAssignmentSection";

const AnimalDetail = () => {
  const navigate = useNavigate();
  const { farmId, animalId } = useParams<{ farmId: string; animalId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const init = async () => {
        try {
          setLoading(true);

          const userData = await fetchUser();
          setUser(userData)

          console.log('-----------------userData', userData);

          const animalData = await fetchAnimalDetail(farmId, animalId);
          setAnimal(animalData)

        } catch (error) {
          setUser(null);
          navigate("/signin", { replace: true });

        } finally {
          setLoading(false);
        }
      };

    if (farmId && animalId) init();
  }, [farmId, animalId, navigate]);

  // Handle ?assign=caretaker query param
  useEffect(() => {
    const assignParam = searchParams.get("assign");
    if (assignParam === "caretaker" || assignParam === "veterinarian") {
      // This will be handled by AnimalAssignmentSection component
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (!user) return null;

  if (!animal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested animal could not be found.
            </p>
            <Button onClick={() => navigate("/directory")}>Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: AnimalDetail["status"]) => {
    switch (status) {
      case "healthy": return "default";
      case "pregnant": return "secondary";
      case "vaccined": return "outline";
      case "injured":
      case "diseased": return "destructive";
      case "sold": return "secondary";
      default: return "default";
    }
  };

  const getUpdateIcon = (type: AnimalUpdate["type"]) => {
    switch (type) {
      case "health": return <Activity className="h-4 w-4" />;
      case "weight": return <Tag className="h-4 w-4" />;
      case "vaccination": return <Syringe className="h-4 w-4" />;
      case "breeding": return <Heart className="h-4 w-4" />;
      case "sale": return <Tag className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const updates = animalId ? getAnimalUpdates(animalId) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/farms/${farmId}/animals/type/${animal.animalType}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
              <p className="text-sm text-muted-foreground">
                {animal.tagNumber} • {animal.animalType} • {animal.breed}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(animal.status)} className="text-sm">
              {animal.status}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Animal Profile */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Animal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tag Number</p>
                  <p className="font-medium">{animal.tagNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{animal.animalType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Breed</p>
                  <p className="font-medium">{animal.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{animal.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{animal.age || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{animal.weight || "N/A"}</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Farm
                  </p>
                  <p className="font-medium">Farm soon coming</p>
                </div>
              </div>
              
              {/* Caretaker */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Caretaker</p>
                {getCaretakerId(animal) ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{getCaretakerName(animal)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground">Not assigned</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Veterinarian */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Veterinarian</p>
                {getVeterinarianId(animal) ? (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-medium">{getVeterinarianName(animal)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Not assigned</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Section */}
          <AnimalAssignmentSection 
            animal={animal}
            farmId={farmId}
            userId={user._id}
          />

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : updates.length > 0 ? (
                <div className="space-y-3">
                  {updates.map((update) => (
                    <div key={update.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getUpdateIcon(update.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{update.notes}</p>
                        <p className="text-sm text-muted-foreground">{update.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No updates recorded for this animal</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AnimalDetail;
