import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Mail, Phone, Shield, Plus, FileText, Bell, Users, TrendingUp, MapPin, AlertTriangle, Heart, CheckCircle2, Activity } from "lucide-react";
import { getUserData } from "@/api/getUserData"
import { handleLogout } from "@/api/handleLogout"
import { getUserFarm } from "@/api/getUserFarms"
import { getHealthData } from "@/api/getHealthData"
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [farm, setFarm] = useState<any[] | null>(null)

  const [healthData, setHealthData] = useState<any[] | null>(null);

  const abnormalAnimals = [
    { id: 1, name: "Cow #12", status: "Sick" },
    { id: 2, name: "Goat #7", status: "Injured" },
    { id: 3, name: "Horse #2", status: "Sick" },
  ];

   useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await getUserData(); 
                // console.log(userData)
                
                setUser(userData); 

                await getFarm();

                await getHealthStatus()

            } catch (error) {
                // 3. If API fails (401 due to bad cookie, network error, etc.)
                console.error("Auth check failed, redirecting:", error);
                setUser(null);
                navigate("/signin", { replace: true });

            } 
        };

        const getFarm = async () => {
            try {
                // 1. AWAIT the API call to get the resolved user data
                const farmData = await getUserFarm(); 
                // console.log(farmData)
                // 2. Set the state with the actual data
                setFarm(farmData); 

            } catch (error) {
                // 3. If API fails (401 due to bad cookie, network error, etc.)
                console.error("Farm not found", error)

            } 
        };

        const getHealthStatus = async() => {
          try{
            // console.log(farm)
            const healthData = await getHealthData(farm)
            setHealthData(healthData)
          }
          catch(err){
            console.error("Health data not found", err)
          }
        }


        checkAuth();

   }, [navigate])
        

   useEffect(() => {
      
   }, [])
        // Call the asynchronous check function

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Animal Management System</h1>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout(navigate)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome, {user.full_name}!</CardTitle>
              <CardDescription>Today's information</CardDescription>
            </CardHeader>
          </Card>

          
              {/* <p className="text-muted-foreground">
                This is your dashboard. Animal management features will be added here.
              </p> */}
            
            {/* Health Overview & Abnormal Status */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Animal Health Summary
                  </CardTitle>
                  <CardDescription>Current health status overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium">Healthy</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">87</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium">Under Treatment</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="font-medium">Critical</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">1</span>
                  </div>
                </CardContent>
              </Card>

              {/* Abnormal Status Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Animals Requiring Attention
                  </CardTitle>
                  <CardDescription>
                    {abnormalAnimals.length} animals need immediate care
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {abnormalAnimals.map((animal) => (
                    <div 
                      key={animal.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{animal.name}</p>
                        <Badge variant={animal.status === "Sick" ? "destructive" : "secondary"} className="mt-1">
                          {animal.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <Card>
            <CardHeader>
              <CardTitle>Your Farms</CardTitle>
              <CardDescription>Manage your animals and track their health</CardDescription>
            </CardHeader>
            <CardContent>

            {/* Add Farm page */}
            <div>
            <h3 className="text-xl font-semibold mb-4">Farms Insights</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farm && farm.length > 0 ? (
                farm.map((f: any, index: number) => (
                  <Card
                    key={f._id || index}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                    onClick={() => navigate(`/FarmInsights/${f._id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-5 w-5 text-primary" />
                            {`Farm ${index + 1} - ${f.name}`}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            NA{/*total animals accross*/} {f.animalTypes.length} species
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Health Score</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">NA{/*health score*/} %</p>
                            <span className="flex items-center text-xs text-green-600">
                              <TrendingUp className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Vaccines Due</p>
                          <p className="text-2xl font-bold">NA{/*vaccines for animals*/}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant="secondary"
                            className={`${
                              f.status === "Healthy"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            }`}
                          >
                            NA
                          </Badge>
                        </div>
                      </div>

                      <Button className="w-full" variant="default">
                        View Farm Insights
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No farms found.</p>
              )}
            </div>
          </div>
          {/* 
          <div> <h3 className="text-xl font-semibold mb-4">Farms Insights</h3> <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"> <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50" onClick={() => navigate("/FarmInsights")} > <CardHeader> <div className="flex items-start justify-between"> <div className="flex-1"> <CardTitle className="flex items-center gap-2 text-lg"> <MapPin className="h-5 w-5 text-primary" /> Farm 1 - Sunshine Valley </CardTitle> <CardDescription className="mt-2">45 animals across 4 species</CardDescription> </div> </div> </CardHeader> <CardContent className="space-y-4"> <div className="grid grid-cols-2 gap-4"> <div className="space-y-1"> <p className="text-xs text-muted-foreground">Health Score</p> <div className="flex items-center gap-2"> <p className="text-2xl font-bold">84%</p> <span className="flex items-center text-xs text-green-600"> <TrendingUp className="h-3 w-3" /> </span> </div> </div> <div className="space-y-1"> <p className="text-xs text-muted-foreground">Vaccines Due</p> <p className="text-2xl font-bold">5</p> </div> </div> <div className="pt-2 border-t"> <div className="flex items-center justify-between text-sm"> <span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"> Healthy </Badge> </div> </div> <Button className="w-full" variant="default"> View Farm Insights </Button> </CardContent> </Card> </div> </div> */}

          </CardContent>
          </Card>


          {/* Quick Actions & Recent Activity */}
          <div className="grid md:grid gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-3">
                
                <Button className="h-auto flex-col gap-2 py-6" variant="default" onClick = { () => navigate("/addFarm")}>
                  <Plus className="h-6 w-6" />
                  <span>Add Farm</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="default" onClick = { () => navigate("/addAnimal")}>
                  <Plus className="h-6 w-6" />
                  <span>Add Animal</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="default" onClick = { () => navigate("/animalUpdate")}>
                  <Plus className="h-6 w-6" />
                  <span>Update Animal</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="outline" onClick = { () => navigate("/directory")}>
                  <Users className="h-6 w-6" />
                  <span>Directory</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                  <FileText className="h-6 w-6" />
                  <span>Health Records</span>
                </Button>
                <Button className="h-auto flex-col gap-2 py-6" variant="outline">
                  <Bell className="h-6 w-6" />
                  <span>All Alerts</span>
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
    
  );
};

export default Dashboard;
