import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CaseHeader,
  DeathWorkflowStepper,
  AuditTimeline,
  ComplianceChecklist,
  AttachmentGallery,
} from "@/components/death-case";
import { CaseStatusBadge } from "@/components/death-case/CaseStatusBadge";
import { UserRole, getPermissions, getStepFromStatus } from "@/types/deathCase";
import { format } from "date-fns";
import {
  FileText,
  Stethoscope,
  Package,
  Eye,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { fetchUser } from "@/utils/fetchUser";
import { User } from "@/interface";
import {
  useDeathCase,
  useUpdateDeathCaseEvent,
  useRequestVet,
  useConfirmVet,
  useRecordDisposal,
  useManagerReview,
} from "@/hooks/useDeathCase";

export default function DeathCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog visibility
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showVetDialog, setShowVetDialog] = useState(false);
  const [showVetRequestDialog, setShowVetRequestDialog] = useState(false);
  const [showDisposalDialog, setShowDisposalDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Event form state
  const [eventDate, setEventDate] = useState("");
  const [eventCause, setEventCause] = useState("unknown");
  const [eventPlace, setEventPlace] = useState("unknown");
  const [eventDetails, setEventDetails] = useState("");

  // Vet form state
  const [vetCause, setVetCause] = useState("unknown");
  const [vetDetails, setVetDetails] = useState("");
  const [vetNecropsy, setVetNecropsy] = useState(false);
  const [vetNecropsyFindings, setVetNecropsyFindings] = useState("");

  // Vet request state
  const [requiresVet, setRequiresVet] = useState(true);

  // Disposal form state
  const [disposalMethod, setDisposalMethod] = useState("burial");
  const [disposalDate, setDisposalDate] = useState("");
  const [disposalLocation, setDisposalLocation] = useState("");

  // Review form state
  const [reviewDecision, setReviewDecision] = useState<"approved" | "correction_needed">("approved");
  const [reviewComments, setReviewComments] = useState("");
  const [correctionField, setCorrectionField] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => navigate("/signin", { replace: true }));
  }, [navigate]);

  const { data: deathCase, isLoading, isError } = useDeathCase(id);

  const updateEvent = useUpdateDeathCaseEvent();
  const requestVetMutation = useRequestVet();
  const confirmVetMutation = useConfirmVet();
  const recordDisposalMutation = useRecordDisposal();
  const managerReviewMutation = useManagerReview();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !deathCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Case Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The death case doesn't exist or you don't have access.
            </p>
            <Button onClick={() => navigate("/compliance/death-cases")}>
              Back to Cases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentRole = (user?.role ?? "caretaker") as UserRole;
  const permissions = getPermissions(currentRole, deathCase.workflowStatus);
  const status = deathCase.workflowStatus;

  // Pre-populate event form when dialog opens
  const openEventDialog = () => {
    if (deathCase.eventInfo) {
      setEventDate(
        deathCase.eventInfo.dateOfDeath
          ? format(new Date(deathCase.eventInfo.dateOfDeath), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      );
      setEventCause(deathCase.eventInfo.reportedCause ?? "unknown");
      setEventPlace(deathCase.eventInfo.placeOfDeath ?? "unknown");
      setEventDetails(deathCase.eventInfo.reportedCauseDetails ?? "");
    } else {
      setEventDate(format(new Date(), "yyyy-MM-dd"));
    }
    setShowEventDialog(true);
  };

  const openDisposalDialog = () => {
    setDisposalDate(format(new Date(), "yyyy-MM-dd"));
    setShowDisposalDialog(true);
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveEvent = async () => {
    if (!eventDate || !eventCause || !eventPlace) {
      toast({ title: "Missing fields", description: "Date, cause, and place are required.", variant: "destructive" });
      return;
    }
    try {
      await updateEvent.mutateAsync({
        caseId: id!,
        dateOfDeath: new Date(eventDate).toISOString(),
        causeOfDeath: eventCause,
        placeOfDeath: eventPlace,
        causeDetails: eventDetails || undefined,
      });
      setShowEventDialog(false);
      toast({ title: "Event updated", description: "Death event section saved." });
    } catch (err: unknown) {
      toast({ title: "Could not update case status", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  const handleRequestVet = async () => {
    try {
      await requestVetMutation.mutateAsync({ caseId: id!, requiresVet });
      setShowVetRequestDialog(false);
      toast({
        title: requiresVet ? "Vet review requested" : "Proceeding without vet",
        description: requiresVet ? "Case status is now awaiting vet confirmation." : "Case moved to disposal pending.",
      });
    } catch (err: unknown) {
      toast({ title: "Could not update case status", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  const handleConfirmVet = async () => {
    try {
      await confirmVetMutation.mutateAsync({
        caseId: id!,
        causeOfDeath: vetCause,
        causeDetails: vetDetails || undefined,
        necropsyPerformed: vetNecropsy,
        necropsyFindings: vetNecropsy ? vetNecropsyFindings : undefined,
      });
      setShowVetDialog(false);
      toast({ title: "Vet confirmation submitted", description: "Case is now disposal pending." });
    } catch (err: unknown) {
      toast({ title: "Failed to save changes", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  const handleRecordDisposal = async () => {
    if (!disposalMethod || !disposalDate) {
      toast({ title: "Missing fields", description: "Method and date are required.", variant: "destructive" });
      return;
    }
    try {
      await recordDisposalMutation.mutateAsync({
        caseId: id!,
        disposalMethod,
        disposalDate: new Date(disposalDate).toISOString(),
        disposalLocation: disposalLocation || undefined,
      });
      setShowDisposalDialog(false);
      toast({ title: "Disposal recorded", description: "Case is now pending manager review." });
    } catch (err: unknown) {
      toast({ title: "Failed to save changes", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  const handleManagerReview = async () => {
    if (reviewDecision === "correction_needed" && (!correctionField || !correctionReason)) {
      toast({ title: "Missing fields", description: "Field and reason are required for corrections.", variant: "destructive" });
      return;
    }
    try {
      await managerReviewMutation.mutateAsync({
        caseId: id!,
        decision: reviewDecision,
        comments: reviewComments || undefined,
        correctionRequests:
          reviewDecision === "correction_needed"
            ? [{ field: correctionField, expectedValue: null, reason: correctionReason }]
            : undefined,
      });
      setShowReviewDialog(false);
      toast({
        title: reviewDecision === "approved" ? "Case approved" : "Correction requested",
        description: reviewDecision === "approved" ? "The case has been approved." : "The case has been sent back for corrections.",
      });
      if (reviewDecision === "approved") navigate("/compliance/death-cases");
    } catch (err: unknown) {
      toast({ title: "Could not update case status", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  // ── Action button bar ────────────────────────────────────────────────────────
  const actionBar = () => {
    const btns: React.ReactNode[] = [];

    if (permissions.canEditEvent && (status === "draft" || status === "correction_needed")) {
      btns.push(
        <Button key="event" onClick={openEventDialog} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Update Event Info
        </Button>,
      );
    }

    if (status === "reported" && (permissions.canEditEvent)) {
      btns.push(
        <Button key="vet-req" onClick={() => setShowVetRequestDialog(true)}>
          <Stethoscope className="w-4 h-4 mr-2" />
          Vet Review Decision
        </Button>,
      );
    }

    if (status === "vet_requested" && permissions.canEditVet) {
      btns.push(
        <Button key="vet-confirm" onClick={() => { setVetCause(deathCase.eventInfo?.reportedCause ?? "unknown"); setShowVetDialog(true); }}>
          <Stethoscope className="w-4 h-4 mr-2" />
          Confirm Cause of Death
        </Button>,
      );
    }

    if ((status === "disposal_pending" || status === "vet_confirmed") && permissions.canEditDisposal) {
      btns.push(
        <Button key="disposal" onClick={openDisposalDialog}>
          <Package className="w-4 h-4 mr-2" />
          Record Disposal
        </Button>,
      );
    }

    if (status === "review_pending" && (permissions.canReview || permissions.canApprove)) {
      btns.push(
        <Button key="review" onClick={() => setShowReviewDialog(true)}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Review Case
        </Button>,
      );
    }

    if (btns.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg border">
        {btns}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <CaseHeader deathCase={deathCase} />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Workflow stepper */}
        <Card>
          <CardContent className="pt-6">
            <DeathWorkflowStepper
              status={deathCase.workflowStatus}
              onStepClick={(stepKey) => setActiveTab(stepKey)}
            />
          </CardContent>
        </Card>

        {/* Action buttons */}
        {actionBar()}

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2">
              <FileText className="w-4 h-4" />
              Report
            </TabsTrigger>
            <TabsTrigger value="vet" className="gap-2">
              <Stethoscope className="w-4 h-4" />
              Vet
            </TabsTrigger>
            <TabsTrigger value="disposal" className="gap-2">
              <Package className="w-4 h-4" />
              Disposal
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Animal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{deathCase.snapshot.name}</p></div>
                      <div><Label className="text-muted-foreground">Tag</Label><p className="font-mono">{deathCase.snapshot.tagNumber}</p></div>
                      <div><Label className="text-muted-foreground">Type</Label><p>{deathCase.snapshot.species}</p></div>
                      <div><Label className="text-muted-foreground">Breed</Label><p>{deathCase.snapshot.breed ?? "Not specified"}</p></div>
                      <div><Label className="text-muted-foreground">Gender</Label><p className="capitalize">{deathCase.snapshot.gender}</p></div>
                      <div><Label className="text-muted-foreground">Farm</Label><p>{deathCase.snapshot.farmName}</p></div>
                      {deathCase.snapshot.location && (
                        <div className="sm:col-span-2">
                          <Label className="text-muted-foreground">Last Known Location</Label>
                          <p>{deathCase.snapshot.location}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AuditTimeline entries={deathCase.auditTrail} maxEntries={5} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CaseStatusBadge status={deathCase.workflowStatus} size="lg" />
                    <Separator />
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Case ID</p>
                      <p className="font-mono text-xs break-all">{deathCase.id}</p>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Created</p>
                      <p>{format(new Date(deathCase.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    {deathCase.eventInfo?.dateOfDeath && (
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">Date of Death</p>
                        <p>{format(new Date(deathCase.eventInfo.dateOfDeath), "MMM d, yyyy")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComplianceChecklist items={deathCase.complianceChecklist} readOnly />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AttachmentGallery
                      attachments={deathCase.attachments}
                      readOnly={!permissions.canAddAttachments}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Report */}
          <TabsContent value="report" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Death Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deathCase.eventInfo ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Date of Death</Label>
                      <p className="font-medium">
                        {format(new Date(deathCase.eventInfo.dateOfDeath), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Place of Death</Label>
                      <p className="capitalize">{deathCase.eventInfo.placeOfDeath}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Reported Cause</Label>
                      <p className="capitalize">{deathCase.eventInfo.reportedCause}</p>
                    </div>
                    {deathCase.eventInfo.reportedCauseDetails && (
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Details</Label>
                        <p>{deathCase.eventInfo.reportedCauseDetails}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No event data recorded yet.</p>
                )}

                {permissions.canEditEvent && (
                  <div className="pt-2">
                    <Button variant="outline" onClick={openEventDialog}>
                      <FileText className="w-4 h-4 mr-2" />
                      {status === "draft" ? "Fill Event Details" : "Edit Event Details"}
                    </Button>
                  </div>
                )}

                {status === "reported" && permissions.canEditEvent && (
                  <div className="pt-2">
                    <Button onClick={() => setShowVetRequestDialog(true)}>
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Proceed: Vet Review Decision
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vet */}
          <TabsContent value="vet" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Veterinary Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deathCase.vetConfirmation ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Confirmed At</Label>
                      <p>{format(new Date(deathCase.vetConfirmation.confirmedAt), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Confirmed Cause</Label>
                      <p className="font-medium capitalize">{deathCase.vetConfirmation.confirmedCause}</p>
                    </div>
                    {deathCase.vetConfirmation.confirmedCauseDetails && (
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Details</Label>
                        <p>{deathCase.vetConfirmation.confirmedCauseDetails}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Necropsy</Label>
                      <p>{deathCase.vetConfirmation.necropsyPerformed ? "Performed" : "Not performed"}</p>
                    </div>
                    {deathCase.vetConfirmation.necropsyFindings && (
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Necropsy Findings</Label>
                        <p>{deathCase.vetConfirmation.necropsyFindings}</p>
                      </div>
                    )}
                  </div>
                ) : status === "vet_requested" ? (
                  <div className="text-center py-8">
                    <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Awaiting veterinary confirmation</p>
                    {permissions.canEditVet && (
                      <Button onClick={() => { setVetCause(deathCase.eventInfo?.reportedCause ?? "unknown"); setShowVetDialog(true); }}>
                        Confirm Cause of Death
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Vet confirmation not yet requested.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disposal */}
          <TabsContent value="disposal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Disposal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deathCase.disposalInfo ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Method</Label>
                      <p className="font-medium capitalize">{deathCase.disposalInfo.method}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p>{deathCase.disposalInfo.date ? format(new Date(deathCase.disposalInfo.date), "MMM d, yyyy") : "—"}</p>
                    </div>
                    {deathCase.disposalInfo.location && (
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Location</Label>
                        <p>{deathCase.disposalInfo.location}</p>
                      </div>
                    )}
                  </div>
                ) : (status === "disposal_pending" || status === "vet_confirmed") ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Disposal information not yet recorded</p>
                    {permissions.canEditDisposal && (
                      <Button onClick={openDisposalDialog}>Record Disposal</Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Disposal step not yet reached.</p>
                )}

                {deathCase.disposalInfo && permissions.canEditDisposal && (
                  <div className="pt-2">
                    <Button variant="outline" onClick={openDisposalDialog}>Edit Disposal Info</Button>
                  </div>
                )}

                {status === "review_pending" && (permissions.canReview || permissions.canApprove) && (
                  <div className="pt-4 border-t">
                    <Button onClick={() => setShowReviewDialog(true)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Proceed to Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}

      {/* Edit Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Death Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Date of Death *</Label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cause of Death *</Label>
              <Select value={eventCause} onValueChange={setEventCause}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="infectious">Infectious Disease</SelectItem>
                  <SelectItem value="non_infectious">Non-Infectious Disease</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="predation">Predation</SelectItem>
                  <SelectItem value="poisoning">Poisoning</SelectItem>
                  <SelectItem value="euthanasia">Euthanasia</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Place of Death *</Label>
              <Select value={eventPlace} onValueChange={setEventPlace}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="barn">Barn</SelectItem>
                  <SelectItem value="field">Field / Pasture</SelectItem>
                  <SelectItem value="clinic">Veterinary Clinic</SelectItem>
                  <SelectItem value="hospital">Animal Hospital</SelectItem>
                  <SelectItem value="transport">During Transport</SelectItem>
                  <SelectItem value="quarantine">Quarantine Area</SelectItem>
                  <SelectItem value="holding_pen">Holding Pen</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Details</Label>
              <Textarea
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Circumstances, observations..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent} disabled={updateEvent.isPending}>
              {updateEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vet Request Dialog */}
      <Dialog open={showVetRequestDialog} onOpenChange={setShowVetRequestDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Veterinary Review Decision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-3">
              <Button
                variant={requiresVet ? "default" : "outline"}
                className="h-16 justify-start px-6 gap-4"
                onClick={() => setRequiresVet(true)}
              >
                <Stethoscope className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Request Vet Confirmation</p>
                  <p className="text-xs opacity-70">Requires official cause confirmation</p>
                </div>
              </Button>
              <Button
                variant={!requiresVet ? "default" : "outline"}
                className="h-16 justify-start px-6 gap-4"
                onClick={() => setRequiresVet(false)}
              >
                <Package className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Skip Vet Review</p>
                  <p className="text-xs opacity-70">Proceed directly to disposal</p>
                </div>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVetRequestDialog(false)}>Cancel</Button>
            <Button onClick={handleRequestVet} disabled={requestVetMutation.isPending}>
              {requestVetMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vet Confirmation Dialog */}
      <Dialog open={showVetDialog} onOpenChange={setShowVetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Veterinary Confirmation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Confirmed Cause of Death *</Label>
              <Select value={vetCause} onValueChange={setVetCause}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="infectious">Infectious Disease</SelectItem>
                  <SelectItem value="non_infectious">Non-Infectious Disease</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="predation">Predation</SelectItem>
                  <SelectItem value="poisoning">Poisoning</SelectItem>
                  <SelectItem value="euthanasia">Euthanasia</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Clinical Details</Label>
              <Textarea
                value={vetDetails}
                onChange={(e) => setVetDetails(e.target.value)}
                placeholder="Clinical findings, examination results..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="necropsy"
                checked={vetNecropsy}
                onChange={(e) => setVetNecropsy(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="necropsy">Necropsy performed</Label>
            </div>
            {vetNecropsy && (
              <div className="space-y-2">
                <Label>Necropsy Findings</Label>
                <Textarea
                  value={vetNecropsyFindings}
                  onChange={(e) => setVetNecropsyFindings(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVetDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmVet} disabled={confirmVetMutation.isPending}>
              {confirmVetMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disposal Dialog */}
      <Dialog open={showDisposalDialog} onOpenChange={setShowDisposalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Disposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Disposal Method *</Label>
              <Select value={disposalMethod} onValueChange={setDisposalMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="burial">Burial</SelectItem>
                  <SelectItem value="cremation">Cremation</SelectItem>
                  <SelectItem value="rendering">Rendering</SelectItem>
                  <SelectItem value="composting">Composting</SelectItem>
                  <SelectItem value="incineration">Incineration</SelectItem>
                  <SelectItem value="landfill">Landfill</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disposal Date *</Label>
              <Input type="date" value={disposalDate} onChange={(e) => setDisposalDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input
                value={disposalLocation}
                onChange={(e) => setDisposalLocation(e.target.value)}
                placeholder="Where was disposal completed?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisposalDialog(false)}>Cancel</Button>
            <Button onClick={handleRecordDisposal} disabled={recordDisposalMutation.isPending}>
              {recordDisposalMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Death Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <Button
                variant={reviewDecision === "approved" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setReviewDecision("approved")}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </Button>
              <Button
                variant={reviewDecision === "correction_needed" ? "destructive" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setReviewDecision("correction_needed")}
              >
                <XCircle className="w-4 h-4" />
                Request Correction
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Comments (optional)</Label>
              <Textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={3}
              />
            </div>
            {reviewDecision === "correction_needed" && (
              <>
                <div className="space-y-2">
                  <Label>Field requiring correction *</Label>
                  <Input
                    value={correctionField}
                    onChange={(e) => setCorrectionField(e.target.value)}
                    placeholder="e.g. causeOfDeath, disposalDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <Textarea
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
            <Button
              onClick={handleManagerReview}
              disabled={managerReviewMutation.isPending}
              variant={reviewDecision === "correction_needed" ? "destructive" : "default"}
            >
              {managerReviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {reviewDecision === "approved" ? "Approve Case" : "Send for Correction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
