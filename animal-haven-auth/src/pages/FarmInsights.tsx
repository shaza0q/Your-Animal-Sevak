import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  TrendingUp, 
  Plus, FileText, Bell, Users,
  TrendingDown,
  Heart,
  Syringe,
  AlertTriangle,
  Activity,
  PawPrint,
  PieChart as PieChartIcon,
  BarChart3,
  DollarSignIcon,
  SkullIcon,
  Archive
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }


  // console.log(farm)
  // const [farmData, setFarmData] = useState()
  // Mock data - in real app, this would come from API
  // const farmData = {
  //   name: "Farm 1 - Sunshine Valley",
  //   totalAnimals: 45,
  //   species: 4,
  //   healthyAnimals: 38,
  //   upcomingVaccines: 5,
  //   sickAnimals: 2,
  //   weeklyChange: {
  //     healthy: 2,
  //     vaccines: -1,
  //     sick: -1
  //   }
  // };

  const healthAlerts = [
    {
      id: 1,
      name: "Bella",
      tagNumber: "COW-001",
      type: "Cow",
      breed: "Holstein",
      symptoms: "Low appetite, slight fever",
      caretaker: "John Smith",
      lastCheckup: "2 days ago"
    },
    {
      id: 2,
      name: "Charlie",
      tagNumber: "GOAT-023",
      type: "Goat",
      breed: "Boer",
      symptoms: "Limping on front left leg",
      caretaker: "Sarah Johnson",
      lastCheckup: "1 day ago"
    }
  ];

  const upcomingVaccines = [
    { id: 1, animalName: "Daisy", tagNumber: "COW-002", vaccineName: "FMD Booster", dueDate: "2025-11-01", status: "Pending" },
    { id: 2, animalName: "Max", tagNumber: "HORSE-005", vaccineName: "Tetanus", dueDate: "2025-11-03", status: "Pending" },
    { id: 3, animalName: "Lucy", tagNumber: "COW-008", vaccineName: "Brucellosis", dueDate: "2025-11-05", status: "Pending" },
    { id: 4, animalName: "Rocky", tagNumber: "GOAT-015", vaccineName: "PPR Vaccine", dueDate: "2025-11-07", status: "Pending" },
    { id: 5, animalName: "Molly", tagNumber: "COW-012", vaccineName: "FMD Booster", dueDate: "2025-11-10", status: "Pending" },
  ];

  const healthDistribution = [
    { name: "Healthy", value: 38, color: "hsl(var(--chart-1))" },
    { name: "Sick", value: 2, color: "hsl(var(--chart-2))" },
    { name: "Under Observation", value: 5, color: "hsl(var(--chart-3))" },
  ];

  const animalCountBySpecies = [
    { species: "Cows", count: 18 },
    { species: "Goats", count: 15 },
    { species: "Horses", count: 8 },
    { species: "Chickens", count: 4 },
  ];

  const monthlyHealthTrend = [
    { month: "Jul", healthy: 40, sick: 5, recovered: 3 },
    { month: "Aug", healthy: 42, sick: 3, recovered: 2 },
    { month: "Sep", healthy: 41, sick: 4, recovered: 3 },
    { month: "Oct", healthy: 45, sick: 2, recovered: 4 },
  ];

  const recentActivity = [
    { id: 1, description: "Bella the cow vaccinated for FMD", time: "2 hours ago", icon: Syringe },
    { id: 2, description: "3 goats checked for fever – all healthy", time: "5 hours ago", icon: Heart },
    { id: 3, description: "New horse added to the farm", time: "1 day ago", icon: Activity },
    { id: 4, description: "Monthly health inspection completed", time: "2 days ago", icon: Activity },
    { id: 5, description: "Feed consumption report generated", time: "3 days ago", icon: Activity },
  ];

  const chartConfig = {
    healthy: {
      label: "Healthy",
      color: "hsl(var(--chart-1))",
    },
    sick: {
      label: "Sick",
      color: "hsl(var(--chart-2))",
    },
    recovered: {
      label: "Recovered",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header>
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Farm Insights</h1>
                  <p className="text-sm text-muted-foreground">Monitor your animals' health and productivity</p>
                </div>
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
                <CardTitle className="text-xl">🌿 {farmData.name}</CardTitle>
                <CardDescription>Your animals are healthy and thriving</CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate(`/farms/${farmData.id}/animals`)}
                  className="gap-2"
                >
                  <PawPrint className="h-4 w-4" />
                  View Animals
                </Button>

                <Button className="gap-2" variant="outline"
                  onClick={() => navigate(`/farms/${farmData.id}/animals?state=deceased`)}
                >
                  <SkullIcon className="h-4 w-4" />
                  Dead Animals R.I.P
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Animals</span>
                  <Badge variant="secondary" className="text-lg font-bold">will add this</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Species Types</span>
                  <Badge variant="secondary">{farmData.animalTypes.length} types</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">Healthy Animals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">will add this</span>
                    {1 > 0 && (
                      <span className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        will add this
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">Upcoming Vaccines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">will add this</span>
                    {1 < 0 && (
                      <span className="flex items-center text-xs text-green-600">
                        <TrendingDown className="h-3 w-3" />
                        {Math.abs(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm">Sick Animals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">will add this</span>
                    {1 < 0 && (
                      <span className="flex items-center text-xs text-green-600">
                        <TrendingDown className="h-3 w-3" />
                        {Math.abs(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Health Score</span>
                    <span className="font-semibold">84%</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vaccination Coverage</span>
                    <span className="font-semibold">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* farm staff & veterinarians */}
        <FarmStaffSection
         farmId={farmId}
         isOwner={true} 
        />

        {/* Health Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Animals Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p className="text-lg">All animals are doing great today! 🐾</p>
                <p className="text-sm">Keep up the good care.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthAlerts.map((alert) => (
                  <Card key={alert.id} className="border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{alert.name}</h4>
                            <p className="text-sm text-muted-foreground">{alert.tagNumber}</p>
                          </div>
                          <Badge variant="outline">{alert.type}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">Breed:</span> {alert.breed}</p>
                          <p className="text-sm"><span className="font-medium">Symptoms:</span> {alert.symptoms}</p>
                          <p className="text-sm"><span className="font-medium">Caretaker:</span> {alert.caretaker}</p>
                          <p className="text-xs text-muted-foreground">Last checkup: {alert.lastCheckup}</p>
                        </div>
                        <Button size="sm" variant="default" className="w-full">
                          View Health Record
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Vaccines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-blue-500" />
                Upcoming Vaccines
              </CardTitle>
              <Button variant="outline" size="sm">View All Vaccinations</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Animal Name</th>
                    <th className="text-left py-3 px-2">Tag Number</th>
                    <th className="text-left py-3 px-2">Vaccine Name</th>
                    <th className="text-left py-3 px-2">Due Date</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingVaccines.map((vaccine) => (
                    <tr key={vaccine.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{vaccine.animalName}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{vaccine.tagNumber}</td>
                      <td className="py-3 px-2">{vaccine.vaccineName}</td>
                      <td className="py-3 px-2 text-sm">{vaccine.dueDate}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary">{vaccine.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Animal Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Health Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {healthDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Animals by Species
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={animalCountBySpecies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="species" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Health Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monthly Health Reports
            </CardTitle>
            <CardDescription>Track health trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyHealthTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="healthy" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="sick" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Line type="monotone" dataKey="recovered" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Weight Gain</p>
                <p className="text-2xl font-bold">+2.3 kg</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Feed Consumption</p>
                <p className="text-2xl font-bold">450 kg</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Water Usage</p>
                <p className="text-2xl font-bold">680 L</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">24°C</p>
                <p className="text-xs text-muted-foreground">optimal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 border-b last:border-0 pb-4 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
              <Button className="h-auto flex gap-2 py-6" variant="default" onClick = { () => navigate("/addAnimal", { state: { farmId: farmId } })}>
                <Plus className="h-6 w-6" />
                <span>Add Animal</span>
              </Button>
              
              <Button className="h-auto flex gap-2 py-6" variant="outline">
                <FileText className="h-6 w-6" />
                <span>Health Records</span>
              </Button>

              <Button className="h-auto flex gap-2 py-6" variant="outline">
                <Bell className="h-6 w-6" />
                <span>All Alerts</span>
              </Button>

              <Button className="h-auto flex gap-2 py-6" variant="outline"
                onClick={() => navigate(`/farms/${farmData.id}/animals?state=deceased`)}
              >
                <SkullIcon className="h-6 w-6" />
                Dead Animals R.I.P
              </Button>

              <Button className="h-auto flex gap-2 py-6" variant="outline"
                onClick={() => navigate(`/farms/${farmData.id}/animals?state=sold`)}
              >
                <DollarSignIcon className="h-6 w-6" />
                Sold Animals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default FarmInsights;
