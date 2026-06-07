import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  User,
  Plus,
  FileText,
  Users,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Activity,
  Skull,
  Home,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getUserData } from "@/api/getUserData";
import { handleLogout } from "@/api/handleLogout";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const StatSkeleton = () => <Skeleton className="h-9 w-12 rounded" />;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ fullName: string; [k: string]: unknown } | null>(null);

  useEffect(() => {
    getUserData()
      .then((userData) => setUser(userData))
      .catch(() => {
        setUser(null);
        navigate("/signin", { replace: true });
      });
  }, [navigate]);

  const {
    data: stats,
    isLoading,
    isError,
  } = useDashboardStats();

  useEffect(() => {
    if (isError) {
      toast({
        title: "Dashboard data unavailable",
        description: "Could not load stats from the server. Displaying last known data.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  if (!user) return null;

  const healthSummary = stats?.healthSummary;
  const attention = stats?.animalsNeedingAttention ?? [];
  const dc = stats?.deathCases;
  const farmStats = stats?.farmStats ?? [];

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
                  <span className="hidden sm:inline">{user.fullName as string}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
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
              <CardTitle className="text-2xl">Welcome, {user.fullName as string}!</CardTitle>
              <CardDescription>
                Today's information
                {stats && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    · {stats.addedLast30Days} animal{stats.addedLast30Days !== 1 ? "s" : ""} added in
                    the last 30 days
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Health Overview & Abnormal Status */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Health Summary */}
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
                  {isLoading ? (
                    <StatSkeleton />
                  ) : (
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {healthSummary?.healthy ?? "—"}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium">Under Treatment</span>
                  </div>
                  {isLoading ? (
                    <StatSkeleton />
                  ) : (
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {healthSummary?.underTreatment ?? "—"}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="font-medium">Critical (High Risk)</span>
                  </div>
                  {isLoading ? (
                    <StatSkeleton />
                  ) : (
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {healthSummary?.critical ?? "—"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Animals Requiring Attention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Animals Requiring Attention
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    `${attention.length} animal${attention.length !== 1 ? "s" : ""} need care`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))
                ) : attention.length === 0 ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">All animals are healthy</p>
                  </div>
                ) : (
                  attention.map((animal) => (
                    <div
                      key={animal.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/farms/${animal.farmId}/animals/${animal.id}`)
                      }
                    >
                      <div>
                        <p className="font-medium">
                          {animal.name}{" "}
                          <span className="text-xs text-muted-foreground font-mono">
                            #{animal.tagNumber}
                          </span>
                        </p>
                        <div className="flex gap-1 mt-1">
                          <Badge
                            variant={
                              animal.riskLevel === "High" ? "destructive" : "secondary"
                            }
                          >
                            {animal.latestStatus}
                          </Badge>
                          {animal.riskLevel === "High" && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              High Risk
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Death Cases Compliance Widget */}
            <Card className="md:col-span-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Skull className="h-5 w-5 text-primary" />
                      Death Cases Compliance
                    </CardTitle>
                    <CardDescription>Pending tasks and recent mortality records</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/compliance/death-cases")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    {isLoading ? (
                      <Skeleton className="h-8 w-10 mx-auto mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-amber-600">
                        {dc?.openCases ?? "—"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                      Open Cases
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    {isLoading ? (
                      <Skeleton className="h-8 w-10 mx-auto mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        {dc?.pendingReview ?? "—"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                      Pending Review
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    {isLoading ? (
                      <Skeleton className="h-8 w-10 mx-auto mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-emerald-600">
                        {dc != null ? `${dc.complianceRate}%` : "—"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                      Compliance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Farm Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Your Farms</CardTitle>
              <CardDescription>Manage your animals and track their health</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Farms Insights</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-xl" />
                  ))
                ) : farmStats.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Home}
                      title="Welcome to your farm dashboard"
                      description="You haven't set up any farms yet. Create your first farm to start managing your animals."
                      action={{ label: "Create Your First Farm", to: "/addFarm" }}
                      className="py-12"
                    />
                  </div>
                ) : (
                  farmStats.map((f, index) => (
                    <Card
                      key={f.farmId}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                      onClick={() => navigate(`/farmInsights/${f.farmId}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <MapPin className="h-5 w-5 text-primary" />
                              {`Farm ${index + 1} – ${f.farmName}`}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {f.totalActiveAnimals} active animal
                              {f.totalActiveAnimals !== 1 ? "s" : ""} ·{" "}
                              {f.animalTypes.length} species
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Health Score</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold">{f.healthScore}%</p>
                              <span className="flex items-center text-xs text-green-600">
                                <TrendingUp className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Vaccines Due (7d)</p>
                            <p className="text-2xl font-bold">{f.vaccinationsDue7Days}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant="secondary"
                              className={
                                f.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              }
                            >
                              {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <Button className="w-full" variant="default">
                          View Farm Insights
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button
                  className="h-auto flex-col gap-2 py-6"
                  variant="default"
                  onClick={() => navigate("/addFarm")}
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Farm</span>
                </Button>
                <Button
                  className="h-auto flex-col gap-2 py-6"
                  variant="default"
                  onClick={() => navigate("/addAnimal")}
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Animal</span>
                </Button>
                <Button
                  className="h-auto flex-col gap-2 py-6"
                  variant="outline"
                  onClick={() => navigate("/directory")}
                >
                  <Users className="h-6 w-6" />
                  <span>Directory</span>
                </Button>
                <Button
                  className="h-auto flex-col gap-2 py-6"
                  variant="outline"
                  onClick={() => navigate("/compliance/death-cases")}
                >
                  <FileText className="h-6 w-6" />
                  <span>Death Cases</span>
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
