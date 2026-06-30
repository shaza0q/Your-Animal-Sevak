import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FarmUser } from "@/types/animal";
import { User } from "@/interface/user.interface";
import {
  AnimalHeader,
  AnimalProfileCard,
  PeopleResponsiblePanel,
  HealthActions,
  AssignPersonDialog,
} from "@/components/animal-detail";
import { LineageSection } from "@/components/LineageSection";
import { useBreadcrumbs } from "@/components/layout/breadcrumb-context";
import { fetchUser } from "@/utils/fetchUser";
import { UserRole } from "@/enums/user-role.enum";
import { unassignAnimalUser } from "@/api/unassignAnimalUser";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog-box";
import { RecentHistory } from "@/components/history/RecentHistory";
import { FileText, Skull, AlertCircle, ClipboardList, BadgeDollarSign } from "lucide-react";
import { useAnimalDetail, useInvalidateAnimalDetail } from "@/hooks/useAnimalDetail";
import { useAnimalHistory, useInvalidateAnimalHistory } from "@/hooks/useAnimalHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimalUpdateForm } from "@/components/AnimalUpdateForm";
import { SellAnimalForm } from "@/components/SellAnimalForm";

// ─── Loading skeleton shown while the detail query is in flight ───────────────
const DetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="h-20 border-b bg-card/50" />
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </main>
  </div>
);

// ─── Page component ───────────────────────────────────────────────────────────
const AnimalDetail = () => {
  const navigate = useNavigate();
  const { farmId, animalId } = useParams<{ farmId: string; animalId: string }>();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [logUpdateOpen, setLogUpdateOpen] = useState(false);
  const [recordSaleOpen, setRecordSaleOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<"caretaker" | "veterinarian">("caretaker");
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [unassignRole, setUnassignRole] = useState<
    UserRole.CARETAKER | UserRole.VETERINARIAN | null
  >(null);

  const invalidateDetail = useInvalidateAnimalDetail();
  const invalidateHistory = useInvalidateAnimalHistory();

  // Fetch logged-in user (needed for role check only)
  useEffect(() => {
    fetchUser()
      .then((u) => {
        setUser(u);
        setIsOwner(u.role === UserRole.OWNER);
      })
      .catch(() => navigate("/signin", { replace: true }));
  }, [navigate]);

  // ── TanStack Query: animal detail ────────────────────────────────────────
  const {
    data: animal,
    isLoading: detailLoading,
    isError: detailError,
  } = useAnimalDetail(farmId, animalId);

  // ── TanStack Query: recent history (5 events) ────────────────────────────
  const {
    data: historyData,
    isLoading: historyLoading,
  } = useAnimalHistory(animalId, { limit: 5 });

  const historyEvents = historyData?.data ?? [];

  useBreadcrumbs([
    { label: "Dashboard", to: "/dashboard" },
    { label: "Animals", to: `/farms/${farmId}/animals` },
    {
      label: animal
        ? `${animal.name} · #${animal.tagNumber}`
        : "Animal",
    },
  ]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openAssignModal = (role: "caretaker" | "veterinarian") => {
    setAssignRole(role);
    setAssignModalOpen(true);
  };

  const requestUnassign = (role: UserRole.CARETAKER | UserRole.VETERINARIAN) => {
    setUnassignRole(role);
  };

  const handleConfirmUnassign = async () => {
    if (!unassignRole || !animal || !animalId) return;

    const assignedUser =
      unassignRole === UserRole.CARETAKER ? animal.caretaker : animal.veterinarian;

    if (!assignedUser?.id) return;

    setIsUnassigning(true);
    try {
      await unassignAnimalUser(animalId, assignedUser.id, unassignRole.toLowerCase());
      toast({
        title: "Person unassigned",
        description: `${assignedUser.name} has been removed.`,
      });
      // Invalidate both detail and history so UI updates automatically
      if (farmId && animalId) {
        invalidateDetail(farmId, animalId);
        invalidateHistory(animalId);
      }
      setUnassignRole(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unassign",
        variant: "destructive",
      });
    } finally {
      setIsUnassigning(false);
    }
  };

  const handleAssignmentChange = () => {
    if (farmId && animalId) {
      invalidateDetail(farmId, animalId);
      invalidateHistory(animalId);
    }
  };

  const handleViewFullHistory = () => {
    navigate(`/farms/${farmId}/animals/${animalId}/history`);
  };

  // ── Guard: auth ──────────────────────────────────────────────────────────
  if (!user) return null;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (detailLoading) return <DetailSkeleton />;

  // ── Error ────────────────────────────────────────────────────────────────
  if (detailError || !animal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Animal Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested animal could not be found or you don't have access.
            </p>
            <Button onClick={() => navigate(`/farms/${farmId}/animals`)}>
              Back to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfirmOpen = unassignRole !== null;

  return (
    <div className="space-y-6">
      {/* Animal header */}
      <AnimalHeader animal={animal} farmId={farmId!} />

      {/* Action bar — Log Update (always) + Record Sale (Active animals only) */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setLogUpdateOpen(true)}
        >
          <ClipboardList className="h-4 w-4" />
          Log Update
        </Button>

        {animal.status === "Active" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setRecordSaleOpen(true)}
          >
            <BadgeDollarSign className="h-4 w-4" />
            Record Sale
          </Button>
        )}
      </div>

      <main className="space-y-8">
        {/* Row 1: Profile + People */}
        <div className="grid gap-6 lg:grid-cols-5">
          <AnimalProfileCard animal={animal} />

          <PeopleResponsiblePanel
            caretakerName={animal.caretaker?.name}
            caretakerEmail={animal.caretaker?.email}
            caretakerId={animal.caretaker?.id}
            veterinarianName={animal.veterinarian?.name}
            veterinarianEmail={animal.veterinarian?.email}
            veterinarianId={animal.veterinarian?.id}
            canAssign={isOwner}
            canUnassign={isOwner}
            isLoading={isUnassigning}
            onAssignCaretaker={() => openAssignModal("caretaker")}
            onAssignVeterinarian={() => openAssignModal("veterinarian")}
            onUnassignCaretaker={() => requestUnassign(UserRole.CARETAKER)}
            onUnassignVeterinarian={() => requestUnassign(UserRole.VETERINARIAN)}
          />
        </div>

        {/* Row 2: Lineage */}
        <LineageSection animal={animal} farmId={farmId!} />

        {/* Row 3: Health actions */}
        <HealthActions />

        {/* Row 4: Compliance actions */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2 text-lg">
              <Skull className="h-5 w-5" />
              Compliance Actions
            </CardTitle>
            <CardDescription>Legal and mortality reporting</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => navigate(`/compliance/death-cases/new/${animalId}`)}
            >
              <Skull className="h-4 w-4" />
              Report Death
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              View Legal Records
            </Button>
          </CardContent>
        </Card>

        {/* Row 5: Recent history */}
        <RecentHistory
          events={historyEvents}
          loading={historyLoading}
          maxItems={5}
          onViewAll={handleViewFullHistory}
          title="Recent Activity"
          emptyMessage="No updates logged yet"
          emptyDescription="Log health checks, vaccinations, weight measurements, and breeding events here."
          emptyAction={{ label: "Log First Update", onClick: () => setLogUpdateOpen(true) }}
        />
      </main>

      {/* Log Update Dialog */}
      <Dialog open={logUpdateOpen} onOpenChange={setLogUpdateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Log Update — {animal.name}{" "}
              <span className="text-muted-foreground font-mono text-sm">
                #{animal.tagNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          <AnimalUpdateForm
            animalId={animalId!}
            farmId={farmId!}
            onSuccess={() => {
              setLogUpdateOpen(false);
              invalidateHistory(animalId!);
                  }}
          />
        </DialogContent>
      </Dialog>

      {/* Record Sale Dialog */}
      <Dialog open={recordSaleOpen} onOpenChange={setRecordSaleOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Record Sale — {animal.name}{" "}
              <span className="text-muted-foreground font-mono text-sm">
                #{animal.tagNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          <SellAnimalForm
            animalId={animalId!}
            farmId={farmId!}
            animalName={animal.name}
            animalStatus={animal.status}
            onSuccess={() => {
              setRecordSaleOpen(false);
              invalidateHistory(animalId!);
                  }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <AssignPersonDialog
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        role={assignRole}
        animalName={animal.name}
        animalId={animal.id}
        farmId={farmId ?? ""}
        currentAssigneeId={
          assignRole === "caretaker" ? animal.caretaker?.id : animal.veterinarian?.id
        }
        currentAssigneeName={
          assignRole === "caretaker" ? animal.caretaker?.name : animal.veterinarian?.name
        }
        onAssignmentChange={handleAssignmentChange}
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        title={`Unassign ${
          unassignRole === UserRole.CARETAKER ? "Caretaker" : "Veterinarian"
        }?`}
        description={
          unassignRole === UserRole.CARETAKER
            ? `This will remove ${animal.caretaker?.name} as the caretaker.`
            : `This will remove ${animal.veterinarian?.name} as the veterinarian.`
        }
        confirmText="Unassign"
        destructive
        isLoading={isUnassigning}
        onConfirm={handleConfirmUnassign}
        onOpenChange={(open) => {
          if (isUnassigning) return;
          if (!open) setUnassignRole(null);
        }}
      />
    </div>
  );
};

export default AnimalDetail;
