import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  UserX,
  Stethoscope,
  Calendar,
  Weight,
  Activity,
  Syringe,
  Heart,
  Tag,
  MapPin,
  Search,
  UserPlus
} from "lucide-react";
import { getAnimalById, getAnimalUpdates, getFarmUsers, mockFarms } from "@/data/mockAnimals";
import { Animal, AnimalUpdate, FarmUser } from "@/types/animal";

const AnimalDetail = () => {
  const navigate = useNavigate();
  const { farmId, animalId } = useParams<{ farmId: string; animalId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner] = useState(true); // Mock: would come from permissions check
  
  // Assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<"caretaker" | "veterinarian">("caretaker");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<FarmUser | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    setUser(JSON.parse(currentUser));
    setTimeout(() => setLoading(false), 500);
  }, [navigate]);

  // Handle ?assign=caretaker query param
  useEffect(() => {
    const assignParam = searchParams.get("assign");
    if (assignParam === "caretaker" || assignParam === "veterinarian") {
      setAssignRole(assignParam);
      setAssignModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (!user) return null;

  const farm = farmId ? mockFarms[farmId] : null;
  const animal = animalId ? getAnimalById(animalId) : null;
  const updates = animalId ? getAnimalUpdates(animalId) : [];
  const farmUsers = farmId ? getFarmUsers(farmId) : [];

  if (!farm || !animal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested {!farm ? "farm" : "animal"} could not be found.
            </p>
            <Button onClick={() => navigate("/directory")}>Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Animal["status"]) => {
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
      case "weight": return <Weight className="h-4 w-4" />;
      case "vaccination": return <Syringe className="h-4 w-4" />;
      case "breeding": return <Heart className="h-4 w-4" />;
      case "sale": return <Tag className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Filter users based on search and role
  const filteredUsers = farmUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = assignRole === "veterinarian" 
      ? u.role === "veterinarian" 
      : (u.role === "caretaker" || u.role === "staff");
    const notAlreadyAssigned = assignRole === "caretaker" 
      ? u.id !== animal.caretakerId 
      : u.id !== animal.veterinarianId;
    return matchesSearch && matchesRole && notAlreadyAssigned;
  });

  const handleAssign = async () => {
    if (!selectedUser) return;
    setAssigning(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Assignment Successful",
      description: `${selectedUser.name} has been assigned as ${assignRole} for ${animal.name}.`,
    });
    
    setAssigning(false);
    setAssignModalOpen(false);
    setSelectedUser(null);
    setSearchQuery("");
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
              onClick={() => navigate(`/farms/${farmId}/animals/type/${animal.type.toLowerCase()}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
              <p className="text-sm text-muted-foreground">
                {animal.tagNumber} • {animal.type} • {animal.breed}
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
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tag Number</p>
                    <p className="font-medium">{animal.tagNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{animal.type}</p>
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
                    <p className="font-medium">{animal.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{animal.weight || "N/A"}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Farm
                    </p>
                    <p className="font-medium">{animal.farmName}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Caretaker */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Caretaker</p>
                {animal.caretakerId ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{animal.caretakerName}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground">Not assigned</span>
                    </div>
                    {isOwner && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setAssignRole("caretaker");
                          setAssignModalOpen(true);
                        }}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Veterinarian */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Veterinarian</p>
                {animal.veterinarianId ? (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-medium">{animal.veterinarianName}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Not assigned</span>
                    </div>
                    {isOwner && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setAssignRole("veterinarian");
                          setAssignModalOpen(true);
                        }}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/animal-update")}>
                <Activity className="h-4 w-4 mr-2" />
                Add Health Update
              </Button>
              <Button variant="outline" onClick={() => navigate("/animal-update")}>
                <Syringe className="h-4 w-4 mr-2" />
                Add Vaccination
              </Button>
              <Button variant="outline" onClick={() => navigate("/animal-update")}>
                <Weight className="h-4 w-4 mr-2" />
                Add Weight Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Health & Update Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Update Timeline
            </CardTitle>
            <CardDescription>
              Chronological history of all updates for this animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Updates Yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  There are no recorded updates for this animal.
                </p>
                <Button onClick={() => navigate("/animal-update")}>
                  Add First Update
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div 
                    key={update.id}
                    className="flex gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="p-2 bg-primary/10 rounded-full text-primary h-fit">
                      {getUpdateIcon(update.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize text-xs">
                          {update.type}
                        </Badge>
                        {update.status && (
                          <Badge variant="secondary" className="capitalize text-xs">
                            {update.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground mb-2">{update.notes}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {update.updatedByName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {update.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {assignRole === "caretaker" ? "Caretaker" : "Veterinarian"}</DialogTitle>
            <DialogDescription>
              Search and select a user to assign as {assignRole} for {animal.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">
                    {searchQuery 
                      ? "No matching users found" 
                      : `No available ${assignRole}s in this farm`}
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser?.id === u.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {u.role}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={!selectedUser || assigning}
              >
                {assigning ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalDetail;
