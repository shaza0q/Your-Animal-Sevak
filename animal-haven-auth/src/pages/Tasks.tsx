import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Syringe,
  AlertTriangle,
  Skull,
  ClipboardPlus,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { AnimalUpdateForm } from "@/components/AnimalUpdateForm";
import { useBreadcrumbs } from "@/components/layout/breadcrumb-context";
import { useTasks } from "@/hooks/useTasks";

interface QuickLogTarget {
  id: string;
  name: string;
  tagNumber: string;
  farmId: string;
}

/** Human-readable label for a death-case workflow status. */
const formatWorkflowStatus = (status: string) =>
  status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const SectionSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-16 rounded-lg" />
    ))}
  </div>
);

const Tasks = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useTasks();
  const [logTarget, setLogTarget] = useState<QuickLogTarget | null>(null);

  useBreadcrumbs([{ label: "Dashboard", to: "/dashboard" }, { label: "Today" }]);

  const vaccinations = data?.vaccinations ?? [];
  const attention = data?.attention ?? [];
  const deathCases = data?.deathCases ?? [];
  const total = data?.counts.total ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Today
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading your tasks…"
              : total === 0
              ? "You're all caught up across your farms."
              : `${total} task${total !== 1 ? "s" : ""} need your attention across your farms.`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* error first, per render-order convention */}
      {isError && (
        <ErrorMessage
          error={error}
          title="Could not load your tasks"
          onRetry={() => refetch()}
        />
      )}

      {isLoading && (
        <div className="space-y-6">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      )}

      {!isLoading && !isError && total === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing due today"
          description="No vaccinations due, no animals needing attention, and no open compliance tasks. Check back later."
          className="py-16"
        />
      )}

      {!isLoading && !isError && total > 0 && (
        <div className="space-y-6">
          {/* ── Vaccinations due ─────────────────────────────────────────── */}
          {vaccinations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Syringe className="h-5 w-5 text-amber-600" />
                  Vaccinations Due
                  <Badge variant="secondary">{vaccinations.length}</Badge>
                </CardTitle>
                <CardDescription>Upcoming within 7 days and overdue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {vaccinations.map((v) => (
                  <div
                    key={`${v.animalId}-${v.dueDate}`}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3"
                  >
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/farms/${v.farmId}/animals/${v.animalId}`)}
                    >
                      <p className="font-medium truncate">
                        {v.name}{" "}
                        <span className="font-mono text-xs text-muted-foreground">
                          #{v.tagNumber}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.vaccineName ?? "Vaccination"} · {v.farmName}
                      </p>
                      <div className="mt-1">
                        {v.overdue ? (
                          <Badge variant="destructive" className="text-xs">
                            Overdue · {format(new Date(v.dueDate), "dd MMM")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                            Due {format(new Date(v.dueDate), "dd MMM")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() =>
                        setLogTarget({
                          id: v.animalId,
                          name: v.name,
                          tagNumber: v.tagNumber,
                          farmId: v.farmId,
                        })
                      }
                    >
                      <ClipboardPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Log</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Animals needing attention ────────────────────────────────── */}
          {attention.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Needs Attention
                  <Badge variant="secondary">{attention.length}</Badge>
                </CardTitle>
                <CardDescription>Sick, injured or high-risk animals to follow up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {attention.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3"
                  >
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/farms/${a.farmId}/animals/${a.id}`)}
                    >
                      <p className="font-medium truncate">
                        {a.name}{" "}
                        <span className="font-mono text-xs text-muted-foreground">
                          #{a.tagNumber}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.animalType} · {a.farmName}
                      </p>
                      <div className="mt-1 flex gap-1">
                        <Badge
                          variant={a.riskLevel === "High" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {a.latestStatus}
                        </Badge>
                        {a.riskLevel === "High" && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                            High Risk
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() =>
                        setLogTarget({
                          id: a.id,
                          name: a.name,
                          tagNumber: a.tagNumber,
                          farmId: a.farmId,
                        })
                      }
                    >
                      <ClipboardPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Log</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Open compliance tasks ────────────────────────────────────── */}
          {deathCases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Skull className="h-5 w-5 text-primary" />
                  Open Death Cases
                  <Badge variant="secondary">{deathCases.length}</Badge>
                </CardTitle>
                <CardDescription>Compliance cases awaiting the next step</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deathCases.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => navigate(`/compliance/death-cases/${d.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {d.name}{" "}
                        <span className="font-mono text-xs text-muted-foreground">
                          #{d.tagNumber}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {d.farmName} · reported {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {formatWorkflowStatus(d.workflowStatus)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick-log dialog — record care without leaving the page */}
      <Dialog open={logTarget !== null} onOpenChange={(open) => !open && setLogTarget(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Log Update — {logTarget?.name}{" "}
              <span className="font-mono text-sm text-muted-foreground">
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
                queryClient.invalidateQueries({ queryKey: ["farm-tasks"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                toast("Update logged", {
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

export default Tasks;
