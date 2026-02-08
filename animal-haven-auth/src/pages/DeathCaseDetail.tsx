import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { getDeathCaseById } from "@/data/mockDeathCases";
import {
  CaseHeader,
  DeathWorkflowStepper,
  RoleBasedSection,
  WorkflowActionButtons,
  AuditTimeline,
  ComplianceChecklist,
  AttachmentGallery,
  VetConfirmationModal,
  ReviewSubmitPanel,
} from "@/components/death-case";
import {
  UserRole,
  ROLE_CONFIG,
  getPermissions,
  getStepFromStatus,
  WORKFLOW_STEPS,
} from "@/types/deathCase";
import { format } from "date-fns";
import {
  FileText,
  Stethoscope,
  Package,
  User,
  Calendar,
  MapPin,
  Clock,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DeathCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deathCase = getDeathCaseById(id || "");
  
  // In a real app, this would come from auth context
  const [currentRole, setCurrentRole] = useState<UserRole>("manager");
  const [activeTab, setActiveTab] = useState("overview");
  const [showVetModal, setShowVetModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!deathCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Case Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The death case you're looking for doesn't exist or you don't have access.
            </p>
            <Button onClick={() => navigate("/death-cases")}>
              Back to Cases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const permissions = getPermissions(currentRole, deathCase.workflowStatus);
  const currentStep = getStepFromStatus(deathCase.workflowStatus);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast({
      title: "Changes saved",
      description: "Your changes have been saved as a draft.",
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast({
      title: "Case updated",
      description: "The case has been moved to the next step.",
    });
  };

  const handleVetConfirm = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setShowVetModal(false);
    setIsSubmitting(false);
    toast({
      title: "Cause of death confirmed",
      description: "The case has been sent for disposal recording.",
    });
  };

  const handleApprove = async (comments: string) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast({
      title: "Case approved",
      description: "The case has been approved and archived.",
    });
    navigate("/death-cases");
  };

  const handleRequestCorrection = async (corrections: any[]) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast({
      title: "Correction requested",
      description: "The case has been sent back for corrections.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          {/* Role switcher for demo */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Viewing as:</span>
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
          </div>
          <CaseHeader deathCase={deathCase} />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Workflow Stepper */}
        <Card>
          <CardContent className="pt-6">
            <DeathWorkflowStepper
              status={deathCase.workflowStatus}
              onStepClick={(stepKey) => setActiveTab(stepKey)}
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
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
            <TabsTrigger value="review" className="gap-2">
              <User className="w-4 h-4" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Animal Snapshot */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Animal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{deathCase.snapshot.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Tag Number</Label>
                        <p className="font-mono">{deathCase.snapshot.tagNumber}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Species</Label>
                        <p>{deathCase.snapshot.species}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Breed</Label>
                        <p>{deathCase.snapshot.breed || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Gender</Label>
                        <p className="capitalize">{deathCase.snapshot.gender}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Farm</Label>
                        <p>{deathCase.snapshot.farmName}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Location at Death</Label>
                        <p>{deathCase.snapshot.location || "Not recorded"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Case Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deathCase.eventInfo && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(deathCase.eventInfo.dateOfDeath), "MMMM d, yyyy")}
                            {deathCase.eventInfo.timeOfDeath && ` at ${deathCase.eventInfo.timeOfDeath}`}
                          </p>
                          <p className="text-sm text-muted-foreground">Date of death</p>
                        </div>
                      </div>
                    )}
                    {deathCase.vetConfirmation && (
                      <div className="flex items-start gap-3">
                        <Stethoscope className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{deathCase.vetConfirmation.confirmedCause}</p>
                          <p className="text-sm text-muted-foreground">
                            Confirmed by {deathCase.vetConfirmation.confirmedBy}
                          </p>
                        </div>
                      </div>
                    )}
                    {deathCase.disposalInfo && (
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium capitalize">{deathCase.disposalInfo.method}</p>
                          <p className="text-sm text-muted-foreground">
                            {deathCase.disposalInfo.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AuditTimeline entries={deathCase.auditTrail} maxEntries={5} />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Compliance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComplianceChecklist items={deathCase.complianceChecklist} readOnly />
                  </CardContent>
                </Card>

                {/* Attachments */}
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

          {/* Report Tab */}
          <TabsContent value="report" className="mt-6">
            <RoleBasedSection
              title="Death Event Details"
              description="Initial report of the animal's death"
              section="event"
              currentRole={currentRole}
              workflowStatus={deathCase.workflowStatus}
              requiredRoles={["caretaker", "manager", "admin"]}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Death</Label>
                  <Input
                    type="date"
                    defaultValue={deathCase.eventInfo?.dateOfDeath}
                    disabled={!permissions.canEditEvent}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time of Death</Label>
                  <Input
                    type="time"
                    defaultValue={deathCase.eventInfo?.timeOfDeath}
                    disabled={!permissions.canEditEvent}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discovered By</Label>
                  <Input
                    defaultValue={deathCase.eventInfo?.discoveredBy}
                    disabled={!permissions.canEditEvent}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Place of Death</Label>
                  <Select
                    defaultValue={deathCase.eventInfo?.placeOfDeath}
                    disabled={!permissions.canEditEvent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barn">Barn</SelectItem>
                      <SelectItem value="field">Field/Pasture</SelectItem>
                      <SelectItem value="clinic">Veterinary Clinic</SelectItem>
                      <SelectItem value="hospital">Animal Hospital</SelectItem>
                      <SelectItem value="transport">During Transport</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reported Cause</Label>
                  <Input
                    defaultValue={deathCase.eventInfo?.reportedCause}
                    disabled={!permissions.canEditEvent}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Details</Label>
                  <Textarea
                    defaultValue={deathCase.eventInfo?.reportedCauseDetails}
                    disabled={!permissions.canEditEvent}
                    rows={3}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Circumstances</Label>
                  <Textarea
                    defaultValue={deathCase.eventInfo?.circumstances}
                    disabled={!permissions.canEditEvent}
                    rows={2}
                  />
                </div>
              </div>
            </RoleBasedSection>

            <div className="mt-6">
              <WorkflowActionButtons
                status={deathCase.workflowStatus}
                currentRole={currentRole}
                onBack={() => navigate("/death-cases")}
                onSave={permissions.canEditEvent ? handleSave : undefined}
                onNext={permissions.canEditEvent ? handleSubmit : undefined}
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                hasUnsavedChanges={false}
                canProceed={true}
              />
            </div>
          </TabsContent>

          {/* Vet Tab */}
          <TabsContent value="vet" className="mt-6">
            <RoleBasedSection
              title="Veterinary Confirmation"
              description="Official cause of death confirmation by veterinarian"
              section="vet"
              currentRole={currentRole}
              workflowStatus={deathCase.workflowStatus}
              requiredRoles={["veterinarian", "admin"]}
            >
              {deathCase.vetConfirmation ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Confirmed By</Label>
                    <p className="font-medium">{deathCase.vetConfirmation.confirmedBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Confirmed At</Label>
                    <p>
                      {format(new Date(deathCase.vetConfirmation.confirmedAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-muted-foreground">Confirmed Cause</Label>
                    <p className="font-medium">{deathCase.vetConfirmation.confirmedCause}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-muted-foreground">Details</Label>
                    <p>{deathCase.vetConfirmation.confirmedCauseDetails}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Necropsy</Label>
                    <p>
                      {deathCase.vetConfirmation.necropsyPerformed
                        ? "Performed"
                        : deathCase.vetConfirmation.necropsyRequired
                        ? "Required but not yet performed"
                        : "Not required"}
                    </p>
                  </div>
                  {deathCase.vetConfirmation.necropsyFindings && (
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground">Necropsy Findings</Label>
                      <p>{deathCase.vetConfirmation.necropsyFindings}</p>
                    </div>
                  )}
                  {deathCase.vetConfirmation.additionalNotes && (
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground">Additional Notes</Label>
                      <p className="italic">{deathCase.vetConfirmation.additionalNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Waiting for veterinary confirmation
                  </p>
                  {permissions.canEditVet && (
                    <Button onClick={() => setShowVetModal(true)}>
                      Confirm Cause of Death
                    </Button>
                  )}
                </div>
              )}
            </RoleBasedSection>

            <div className="mt-6">
              <WorkflowActionButtons
                status={deathCase.workflowStatus}
                currentRole={currentRole}
                onBack={() => setActiveTab("report")}
                onNext={
                  permissions.canEditVet && !deathCase.vetConfirmation
                    ? () => setShowVetModal(true)
                    : undefined
                }
                isSubmitting={isSubmitting}
                canProceed={!!deathCase.vetConfirmation}
              />
            </div>
          </TabsContent>

          {/* Disposal Tab */}
          <TabsContent value="disposal" className="mt-6">
            <RoleBasedSection
              title="Disposal Information"
              description="Record how the animal was disposed of"
              section="disposal"
              currentRole={currentRole}
              workflowStatus={deathCase.workflowStatus}
              requiredRoles={["caretaker", "manager", "admin"]}
            >
              {deathCase.disposalInfo ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Method</Label>
                    <p className="font-medium capitalize">{deathCase.disposalInfo.method}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p>{format(new Date(deathCase.disposalInfo.date), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Handled By</Label>
                    <p>{deathCase.disposalInfo.handledBy}</p>
                  </div>
                  {deathCase.disposalInfo.witnessedBy && (
                    <div>
                      <Label className="text-muted-foreground">Witnessed By</Label>
                      <p>{deathCase.disposalInfo.witnessedBy}</p>
                    </div>
                  )}
                  {deathCase.disposalInfo.location && (
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground">Location</Label>
                      <p>{deathCase.disposalInfo.location}</p>
                    </div>
                  )}
                  {deathCase.disposalInfo.transportDetails && (
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground">Transport Details</Label>
                      <p>{deathCase.disposalInfo.transportDetails}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Disposal Method</Label>
                    <Select disabled={!permissions.canEditDisposal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="burial">Burial</SelectItem>
                        <SelectItem value="cremation">Cremation</SelectItem>
                        <SelectItem value="rendering">Rendering</SelectItem>
                        <SelectItem value="composting">Composting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" disabled={!permissions.canEditDisposal} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Where was disposal completed?"
                      disabled={!permissions.canEditDisposal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Handled By</Label>
                    <Input
                      placeholder="Who handled the disposal?"
                      disabled={!permissions.canEditDisposal}
                    />
                  </div>
                </div>
              )}
            </RoleBasedSection>

            <div className="mt-6">
              <WorkflowActionButtons
                status={deathCase.workflowStatus}
                currentRole={currentRole}
                onBack={() => setActiveTab("vet")}
                onSave={permissions.canEditDisposal ? handleSave : undefined}
                onNext={permissions.canEditDisposal ? handleSubmit : undefined}
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                hasUnsavedChanges={false}
                canProceed={!!deathCase.disposalInfo}
              />
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="mt-6">
            {permissions.canReview || permissions.canApprove ? (
              <ReviewSubmitPanel
                deathCase={deathCase}
                onApprove={handleApprove}
                onRequestCorrection={handleRequestCorrection}
                isSubmitting={isSubmitting}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Manager Review Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Only managers can review and approve death cases.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current status: <span className="font-medium">{deathCase.workflowStatus}</span>
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Vet Confirmation Modal */}
      <VetConfirmationModal
        open={showVetModal}
        onOpenChange={setShowVetModal}
        deathCase={deathCase}
        onConfirm={handleVetConfirm}
        onRequestInfo={() => {
          toast({
            title: "Information requested",
            description: "A request for more information has been sent.",
          });
          setShowVetModal(false);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
