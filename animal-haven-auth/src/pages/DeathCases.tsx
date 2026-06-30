import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeathCaseCard, CaseStatusBadge } from "@/components/death-case";
import { WorkflowStatus, STATUS_CONFIG, ROLE_CONFIG, DeathCase } from "@/types/deathCase";
import {
  ArrowLeft,
  Search,
  SearchX,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileX,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { fetchUser } from "@/utils/fetchUser";
import { User } from "@/interface";
import { getAllFarmData } from "@/api/getAllFarmData";
import { useDeathCases } from "@/hooks/useDeathCase";

const FARM_KEY = "death_cases_farm_id";

// Roles whose pending cases are those where STATUS_PERMISSIONS includes them
const PENDING_STATUSES_FOR_ROLE: Record<string, WorkflowStatus[]> = {
  caretaker:     ["draft", "reported", "vet_confirmed", "disposal_pending", "correction_needed"],
  veterinarian:  ["vet_requested"],
  manager:       ["disposal_recorded", "review_pending", "approved"],
  admin:         ["draft", "reported", "vet_requested", "vet_confirmed", "disposal_pending", "disposal_recorded", "review_pending", "correction_needed", "approved"],
  owner:         ["draft", "reported", "vet_requested", "vet_confirmed", "disposal_pending", "disposal_recorded", "review_pending", "correction_needed", "approved"],
};

export default function DeathCases() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<{ id: string; name: string }[]>([]);
  const [farmId, setFarmId] = useState<string>(() => localStorage.getItem(FARM_KEY) ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "approved">("pending");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [userData, farmData] = await Promise.all([fetchUser(), getAllFarmData()]);
        setUser(userData);
        const list = (farmData as { id: string; name: string }[]) ?? [];
        setFarms(list);
        // Auto-select first farm if nothing stored
        if (!farmId && list.length > 0) {
          setFarmId(list[0].id);
          localStorage.setItem(FARM_KEY, list[0].id);
        }
      } catch {
        navigate("/signin", { replace: true });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleFarmChange = (id: string) => {
    setFarmId(id);
    localStorage.setItem(FARM_KEY, id);
    setPage(1);
  };

  // Fetch all cases (up to 100) for stats + filtering
  const { data: allData, isLoading, isError, error, refetch } = useDeathCases(farmId || undefined, 1, 100);
  // Fetch current page for the list
  const { data: pageData } = useDeathCases(farmId || undefined, page, 20);

  const allCases: DeathCase[] = allData?.data ?? [];
  const listedCases: DeathCase[] = pageData?.data ?? [];
  const pagination = pageData?.pagination;

  const userRole = (user?.role as string) ?? "";
  const pendingStatuses = PENDING_STATUSES_FOR_ROLE[userRole] ?? [];

  const filteredCases = useMemo(() => {
    let cases = activeTab === "pending"
      ? allCases.filter((c) => pendingStatuses.includes(c.workflowStatus))
      : activeTab === "approved"
      ? allCases.filter((c) => c.workflowStatus === "approved" || c.workflowStatus === "archived")
      : listedCases;

    if (statusFilter !== "all") {
      cases = cases.filter((c) => c.workflowStatus === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.snapshot.name.toLowerCase().includes(q) ||
          c.snapshot.tagNumber.toLowerCase().includes(q) ||
          c.snapshot.species.toLowerCase().includes(q),
      );
    }

    return cases;
  }, [activeTab, statusFilter, searchQuery, allCases, listedCases, pendingStatuses]);

  const stats = useMemo(() => ({
    pending: allCases.filter((c) => pendingStatuses.includes(c.workflowStatus)).length,
    awaitingVet: allCases.filter((c) => c.workflowStatus === "vet_requested").length,
    needsCorrection: allCases.filter((c) => c.workflowStatus === "correction_needed").length,
    approved: allCases.filter((c) => c.workflowStatus === "approved" || c.workflowStatus === "archived").length,
  }), [allCases, pendingStatuses]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page heading + actions */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Death Cases</h1>
          <p className="text-sm text-muted-foreground">Legal-compliant mortality workflow</p>
        </div>
        <div className="flex items-center gap-2">
          {farms.length > 1 && (
            <Select value={farmId} onValueChange={handleFarmChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => navigate("/compliance/death-cases/new")}
            disabled={!farmId}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Role indicator */}
        {user && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Viewing as:</span>
            {userRole && ROLE_CONFIG[userRole as keyof typeof ROLE_CONFIG] && (
              <Badge
                className={
                  ROLE_CONFIG[userRole as keyof typeof ROLE_CONFIG].bgClass +
                  " " +
                  ROLE_CONFIG[userRole as keyof typeof ROLE_CONFIG].textClass
                }
              >
                {ROLE_CONFIG[userRole as keyof typeof ROLE_CONFIG].label}
              </Badge>
            )}
          </div>
        )}

        {/* No farm selected */}
        {!farmId && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Select a farm to view death cases</h3>
              <p className="text-sm text-muted-foreground">
                {farms.length === 0
                  ? "No farms found. Create a farm first."
                  : "Please select a farm from the dropdown above."}
              </p>
            </CardContent>
          </Card>
        )}

        {farmId && (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { value: stats.pending, label: "Pending Action", icon: Clock, color: "amber" },
                { value: stats.awaitingVet, label: "Awaiting Vet", icon: FileText, color: "blue" },
                { value: stats.needsCorrection, label: "Need Correction", icon: AlertCircle, color: "rose" },
                { value: stats.approved, label: "Approved", icon: CheckCircle2, color: "emerald" },
              ].map(({ value, label, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${color}-500/15 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                      </div>
                      <div>
                        {isLoading ? (
                          <Skeleton className="h-7 w-8 mb-1" />
                        ) : (
                          <p className="text-2xl font-bold">{value}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case #, animal name, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as WorkflowStatus | "all")}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  My Pending
                  {stats.pending > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {stats.pending}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All Cases</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                  </div>
                ) : isError ? (
                  <ErrorMessage
                    error={error}
                    onRetry={() => refetch()}
                    title="Could not load death cases"
                  />
                ) : filteredCases.length === 0 ? (
                  <Card>
                    {activeTab === "pending" ? (
                      <EmptyState
                        icon={CheckCircle2}
                        title="No pending actions"
                        description="No cases require your attention right now."
                      />
                    ) : searchQuery || statusFilter !== "all" ? (
                      <EmptyState
                        icon={SearchX}
                        title="No cases match your filters"
                        description="Adjust your filters to see more cases."
                        action={{
                          label: "Clear filters",
                          onClick: () => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          },
                        }}
                      />
                    ) : (
                      <EmptyState
                        icon={FileX}
                        title="No death cases recorded"
                        description="Death cases appear here when an animal death is reported and enters the compliance workflow."
                      />
                    )}
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCases.map((deathCase) => (
                      <DeathCaseCard key={deathCase.id} deathCase={deathCase} />
                    ))}
                  </div>
                )}

                {/* Pagination (All tab only) */}
                {activeTab === "all" && pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNext}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
