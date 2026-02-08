import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDeathCases, getPendingCasesForRole } from "@/data/mockDeathCases";
import { DeathCaseCard, CaseStatusBadge } from "@/components/death-case";
import { UserRole, WorkflowStatus, ROLE_CONFIG, STATUS_CONFIG } from "@/types/deathCase";
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { fetchUser } from "@/utils/fetchUser";
import { User } from "@/interface";

export default function DeathCases() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "approved">("pending");
  const [user, setUser] = useState<User>();
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const init = async() => {
      try{
        const userData = await fetchUser();
        console.log('---------------------------user', userData);
        setUser(userData);
        setCurrentRole(userData.role);
      }
      catch(error){
        console.error('Error fetching user:', error);
        setUser(null);
        setCurrentRole(null);
        navigate("/signin", { replace: true });
      }
    };
    init();
  }, [navigate]);

  const pendingCases = useMemo(() => getPendingCasesForRole(currentRole), [currentRole]);

  const filteredCases = useMemo(() => {
    let cases = mockDeathCases;

    // Filter by tab
    if (activeTab === "pending") {
      cases = pendingCases;
    } else if (activeTab === "approved") {
      cases = cases.filter(
        (c) => c.workflowStatus === "approved" || c.workflowStatus === "archived"
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      cases = cases.filter((c) => c.workflowStatus === statusFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(query) ||
          c.snapshot.name.toLowerCase().includes(query) ||
          c.snapshot.tagNumber.toLowerCase().includes(query) ||
          c.snapshot.species.toLowerCase().includes(query)
      );
    }

    return cases;
  }, [activeTab, statusFilter, searchQuery, pendingCases]);

  // Stats
  const stats = useMemo(() => {
    const pending = pendingCases.length;
    const awaitingVet = mockDeathCases.filter((c) => c.workflowStatus === "vet_requested").length;
    const needsCorrection = mockDeathCases.filter((c) => c.workflowStatus === "correction_needed").length;
    const approved = mockDeathCases.filter(
      (c) => c.workflowStatus === "approved" || c.workflowStatus === "archived"
    ).length;
    return { pending, awaitingVet, needsCorrection, approved };
  }, [pendingCases]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Death Cases</h1>
                <p className="text-sm text-muted-foreground">
                  Legal-compliant mortality workflow
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Role switcher for demo */}
              <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as UserRole)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => navigate("/compliance/death-cases/new")}>
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Role indicator */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Viewing as:</span>
          {currentRole && (
            <Badge className={ROLE_CONFIG[currentRole].bgClass + " " + ROLE_CONFIG[currentRole].textClass}>
              {ROLE_CONFIG[currentRole].label}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground ml-2">
            {currentRole === "caretaker" && "You can report deaths and record disposals"}
            {currentRole === "veterinarian" && "You can confirm causes of death"}
            {currentRole === "manager" && "You can review and approve cases"}
            {currentRole === "admin" && "You have full access to all cases"}
            {currentRole === "owner" && "You have full access to all cases and farm management"}
          </span>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Action</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.awaitingVet}</p>
                  <p className="text-sm text-muted-foreground">Awaiting Vet</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.needsCorrection}</p>
                  <p className="text-sm text-muted-foreground">Need Correction</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
            {filteredCases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No cases found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {activeTab === "pending"
                      ? "You have no pending cases requiring your action"
                      : searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "No death cases have been recorded yet"}
                  </p>
                  {activeTab === "pending" && (
                    <p className="text-sm text-muted-foreground">
                      Great job! All cases assigned to you are up to date.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCases.map((deathCase) => (
                  <DeathCaseCard key={deathCase.id} deathCase={deathCase} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
