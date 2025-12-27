import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Stethoscope, Users, Phone, Mail, MapPin, PawPrint } from "lucide-react";
import { getUserData } from "../api/getUserData"

interface VeterinaryDoctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  location: string;
}

interface Personnel {
  id: string;
  name: string;
  role: "staff" | "caretaker";
  email: string;
  phone: string;
}

interface FarmPersonnel {
  farmId: string;
  farmName: string;
  personnel: Personnel[];
}

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  status: "healthy" | "injured" | "diseased" | "pregnant" | "vaccined";
}

interface FarmAnimals {
  farmId: string;
  farmName: string;
  animals: Animal[];
}

const Directory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Mock data - replace with actual API calls
  const veterinaryDoctors: VeterinaryDoctor[] = [
    {
      id: "vet1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@vetcare.com",
      phone: "+1 (555) 123-4567",
      specialization: "Large Animals",
      location: "Downtown Clinic"
    },
    {
      id: "vet2",
      name: "Dr. Michael Chen",
      email: "michael.chen@vetcare.com",
      phone: "+1 (555) 234-5678",
      specialization: "Emergency Care",
      location: "Emergency Vet Center"
    }
  ];

  const farmPersonnel: FarmPersonnel[] = [
    {
      farmId: "farm1",
      farmName: "Sunshine Valley Farm",
      personnel: [
        {
          id: "staff1",
          name: "John Smith",
          role: "staff",
          email: "john.smith@farm.com",
          phone: "+1 (555) 345-6789"
        },
        {
          id: "care1",
          name: "Emily Davis",
          role: "caretaker",
          email: "emily.davis@farm.com",
          phone: "+1 (555) 456-7890"
        },
        {
          id: "care2",
          name: "Robert Wilson",
          role: "caretaker",
          email: "robert.wilson@farm.com",
          phone: "+1 (555) 567-8901"
        }
      ]
    },
    {
      farmId: "farm2",
      farmName: "Green Meadows Farm",
      personnel: [
        {
          id: "staff2",
          name: "Lisa Anderson",
          role: "staff",
          email: "lisa.anderson@farm.com",
          phone: "+1 (555) 678-9012"
        },
        {
          id: "care3",
          name: "David Brown",
          role: "caretaker",
          email: "david.brown@farm.com",
          phone: "+1 (555) 789-0123"
        }
      ]
    }
  ];

  const farmAnimals: FarmAnimals[] = [
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
          status: "healthy"
        },
        {
          id: "animal2",
          name: "Daisy",
          type: "Cow",
          breed: "Jersey",
          age: "2 years",
          status: "pregnant"
        },
        {
          id: "animal3",
          name: "Max",
          type: "Bull",
          breed: "Angus",
          age: "4 years",
          status: "healthy"
        }
      ]
    },
    {
      farmId: "farm2",
      farmName: "Green Meadows Farm",
      animals: [
        {
          id: "animal4",
          name: "Luna",
          type: "Cow",
          breed: "Holstein",
          age: "5 years",
          status: "vaccined"
        },
        {
          id: "animal5",
          name: "Charlie",
          type: "Calf",
          breed: "Jersey",
          age: "6 months",
          status: "healthy"
        }
      ]
    }
  ];

    useEffect(() => {
      const checkAuth = async () => {
          try {
              const userData = await getUserData(); 
              setUser(userData);

          } catch (error) {
              console.error("Auth check failed, redirecting:", error);
              setUser(null);
              navigate("/signin", { replace: true });

          } 
      };

      checkAuth();

    }, [navigate])
        
  if (!user) return null;

  const getTotalStaff = () => {
    return farmPersonnel.reduce(
      (acc, farm) => acc + farm.personnel.filter(p => p.role === "staff").length,
      0
    );
  };

  const getTotalCaretakers = () => {
    return farmPersonnel.reduce(
      (acc, farm) => acc + farm.personnel.filter(p => p.role === "caretaker").length,
      0
    );
  };

  const getTotalAnimals = () => {
    return farmAnimals.reduce((acc, farm) => acc + farm.animals.length, 0);
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Personnel Directory</h1>
              <p className="text-sm text-muted-foreground">
                Manage your farm staff, caretakers, and veterinary partners
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veterinary Doctors</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{veterinaryDoctors.length}</div>
              <p className="text-xs text-muted-foreground">Available specialists</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Farm Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalStaff()}</div>
              <p className="text-xs text-muted-foreground">Across all farms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caretakers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalCaretakers()}</div>
              <p className="text-xs text-muted-foreground">Animal caretakers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Animals</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalAnimals()}</div>
              <p className="text-xs text-muted-foreground">Across all farms</p>
            </CardContent>
          </Card>
        </div>

        {/* Veterinary Doctors Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Veterinary Doctors
            </h2>
            <Button size="sm">Add Veterinarian</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {veterinaryDoctors.map((vet) => (
              <Card key={vet.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{vet.name}</CardTitle>
                      <CardDescription>{vet.specialization}</CardDescription>
                    </div>
                    <Badge variant="outline">Veterinarian</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{vet.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{vet.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{vet.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Farm Personnel Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Farm Personnel
            </h2>
            <Button size="sm">Add Personnel</Button>
          </div>

          <div className="space-y-6">
            {farmPersonnel.map((farm) => (
              <Card key={farm.farmId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{farm.farmName}</CardTitle>
                    <Badge variant="secondary">
                      {farm.personnel.length} {farm.personnel.length === 1 ? "person" : "people"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {farm.personnel.filter(p => p.role === "staff").length} Staff • {" "}
                    {farm.personnel.filter(p => p.role === "caretaker").length} Caretakers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {farm.personnel.map((person) => (
                      <div
                        key={person.id}
                        className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{person.name}</h4>
                          <Badge variant={person.role === "staff" ? "default" : "outline"}>
                            {person.role}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{person.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{person.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Animals Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Animals
            </h2>
            <Button size="sm">Add Animal</Button>
          </div>

          <div className="space-y-6">
            {farmAnimals.map((farm) => (
              <Card key={farm.farmId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{farm.farmName}</CardTitle>
                      <CardDescription>
                        Farm livestock and animals under care
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {farm.animals.length} {farm.animals.length === 1 ? "animal" : "animals"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/farm/${farm.farmId}/animals`)}
                      >
                        View All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {farm.animals.map((animal) => (
                      <div
                        key={animal.id}
                        className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{animal.name}</h4>
                            <p className="text-sm text-muted-foreground">{animal.type}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(animal.status)}>
                            {animal.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Breed:</span> {animal.breed}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Age:</span> {animal.age}
                          </p>
                        </div>
                      </div>
                    ))}
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

export default Directory;
