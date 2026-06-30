import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  MapPin,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Activity,
  Skull,
  Home,
  ClipboardPlus,
  Syringe,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { AnimalUpdateForm } from "@/components/AnimalUpdateForm";
import { AnimalAvatar } from "@/components/AnimalAvatar";
import { DashboardActivity } from "@/components/layout/DashboardActivity";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const StatSkeleton = () => <Skeleton className="h-9 w-12 rounded" />;

/** Time-of-day aware greeting for a warmer, personal welcome. */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

interface QuickLogTarget {
  id: string;
  name: string;
  tagNumber: string;
  farmId: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth();
  const queryClient = useQueryClient();

  // Animal selected for a quick health/weight/vaccination log from the dashboard
  const [logTarget, setLogTarget] = useState<QuickLogTarget | null>(null);

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

  const healthSummary = stats?.healthSummary;
  const attention = stats?.animalsNeedingAttention ?? [];
  const dc = stats?.deathCases;
  const farmStats = stats?.farmStats ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {getGreeting()}, {user.fullName?.split(" ")[0] || user.fullName}!
          </CardTitle>
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

      {/* Main content + activity rail */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
                  className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                    onClick={() =>
                      navigate(`/farms/${animal.farmId}/animals/${animal.id}`)
                    }
                  >
                    <AnimalAvatar
                      photoUrl={animal.photoUrl}
                      name={animal.name}
                      animalType={animal.animalType}
                      className="h-10 w-10"
                    />
                    <div className="min-w-0">
                    <p className="font-medium truncate">
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
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        setLogTarget({
                          id: animal.id,
                          name: animal.name,
                          tagNumber: animal.tagNumber,
                          farmId: animal.farmId,
                        })
                      }
                    >
                      <ClipboardPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Log</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/farms/${animal.farmId}/animals/${animal.id}`)
                      }
                    >
                      View
                    </Button>
                  </div>
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
                      <button
                        type="button"
                        disabled={f.vaccinationsDue7Days === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/tasks");
                        }}
                        className="space-y-1 rounded-md p-1 -m-1 text-left transition-colors enabled:hover:bg-muted enabled:cursor-pointer disabled:cursor-default"
                      >
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Syringe className="h-3 w-3" />
                          Vaccines Due (7d)
                        </p>
                        <p
                          className={
                            f.vaccinationsDue7Days > 0
                              ? "text-2xl font-bold text-amber-600"
                              : "text-2xl font-bold"
                          }
                        >
                          {f.vaccinationsDue7Days}
                        </p>
                      </button>
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
        </div>

        {/* Activity rail */}
        <div className="lg:col-span-1">
          <DashboardActivity />
        </div>
      </div>

      {/* Quick Log Update dialog — record care without leaving the dashboard */}
      <Dialog open={logTarget !== null} onOpenChange={(open) => !open && setLogTarget(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Log Update — {logTarget?.name}{" "}
              <span className="text-muted-foreground font-mono text-sm">
                #{logTarget?.tagNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          {logTarget && (
            <AnimalUpdateForm
              animalId={logTarget.id}
              farmId={logTarget.farmId}
              onSuccess={() => {
                setLogTarget(null);
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
                toast({
                  title: "Update logged",
                  description: "The animal's record has been updated.",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
