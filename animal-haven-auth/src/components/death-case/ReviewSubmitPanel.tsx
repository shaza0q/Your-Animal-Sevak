import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeathCase, CorrectionRequest } from "@/types/deathCase";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { ComplianceChecklist } from "./ComplianceChecklist";
import { AuditTimeline } from "./AuditTimeline";
import { format } from "date-fns";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Stethoscope,
  Package,
  User,
  Calendar,
  MapPin,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewSubmitPanelProps {
  deathCase: DeathCase;
  onApprove: (comments: string) => void;
  onRequestCorrection: (corrections: CorrectionRequest[]) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ReviewSubmitPanel({
  deathCase,
  onApprove,
  onRequestCorrection,
  isSubmitting = false,
  className,
}: ReviewSubmitPanelProps) {
  const [comments, setComments] = useState("");
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [selectedSection, setSelectedSection] = useState<"event" | "vet" | "disposal" | null>(null);

  const allRequiredComplete = deathCase.complianceChecklist
    .filter((item) => item.required)
    .every((item) => item.completed);

  const handleApprove = () => {
    onApprove(comments);
  };

  const handleRequestCorrection = () => {
    if (!selectedSection || !correctionReason) return;

    const correction: CorrectionRequest = {
      id: `corr-${Date.now()}`,
      section: selectedSection,
      field: "general",
      reason: correctionReason,
      requestedBy: "Current User", // Would come from auth context
      requestedAt: new Date().toISOString(),
      resolved: false,
    };

    onRequestCorrection([correction]);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Case Summary Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Case Review: {deathCase.caseNumber}
              </CardTitle>
              <CardDescription className="mt-1">
                Review all sections before approving
              </CardDescription>
            </div>
            <CaseStatusBadge status={deathCase.workflowStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Animal:</span>
                <span className="font-medium">{deathCase.snapshot.name}</span>
                <Badge variant="outline">{deathCase.snapshot.species}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Date of Death:</span>
                <span>
                  {deathCase.eventInfo?.dateOfDeath
                    ? format(new Date(deathCase.eventInfo.dateOfDeath), "MMMM d, yyyy")
                    : "Not recorded"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span>{deathCase.snapshot.location || deathCase.snapshot.farmName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Reviews */}
      <div className="grid gap-4">
        {/* Event Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Death Event Details
              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Reported By:</span>{" "}
                <span>{deathCase.eventInfo?.discoveredBy || "Unknown"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Reported Cause:</span>{" "}
                <span>{deathCase.eventInfo?.reportedCause || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Place of Death:</span>{" "}
                <span className="capitalize">{deathCase.eventInfo?.placeOfDeath || "Unknown"}</span>
              </div>
              {deathCase.eventInfo?.circumstances && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Circumstances:</span>{" "}
                  <span>{deathCase.eventInfo.circumstances}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vet Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Veterinary Confirmation
              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Confirmed By:</span>{" "}
                <span>{deathCase.vetConfirmation?.confirmedBy || "Pending"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confirmed Cause:</span>{" "}
                <span>{deathCase.vetConfirmation?.confirmedCause || "Pending"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Necropsy:</span>{" "}
                <span>
                  {deathCase.vetConfirmation?.necropsyPerformed
                    ? "Performed"
                    : deathCase.vetConfirmation?.necropsyRequired
                    ? "Required"
                    : "Not required"}
                </span>
              </div>
              {deathCase.vetConfirmation?.confirmedCauseDetails && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Details:</span>{" "}
                  <span>{deathCase.vetConfirmation.confirmedCauseDetails}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disposal Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              Disposal Information
              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Method:</span>{" "}
                <span className="capitalize">{deathCase.disposalInfo?.method || "Not recorded"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span>
                  {deathCase.disposalInfo?.date
                    ? format(new Date(deathCase.disposalInfo.date), "MMM d, yyyy")
                    : "Not recorded"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Handled By:</span>{" "}
                <span>{deathCase.disposalInfo?.handledBy || "Not recorded"}</span>
              </div>
              {deathCase.disposalInfo?.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>{" "}
                  <span>{deathCase.disposalInfo.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplianceChecklist items={deathCase.complianceChecklist} readOnly />
        </CardContent>
      </Card>

      {/* Audit Trail (Collapsible) */}
      <Card>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => setShowAuditTrail(!showAuditTrail)}
        >
          <CardTitle className="text-base flex items-center justify-between">
            <span>Audit Trail ({deathCase.auditTrail.length} entries)</span>
            {showAuditTrail ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </CardTitle>
        </CardHeader>
        {showAuditTrail && (
          <CardContent>
            <AuditTimeline entries={deathCase.auditTrail} showAll />
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Action Section */}
      {correctionMode ? (
        <Card className="border-rose-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
              Request Correction
            </CardTitle>
            <CardDescription>
              Specify which section needs correction and why
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Section requiring correction</Label>
              <div className="flex gap-2 flex-wrap">
                {(["event", "vet", "disposal"] as const).map((section) => (
                  <Button
                    key={section}
                    variant={selectedSection === section ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection(section)}
                  >
                    {section === "event"
                      ? "Death Event"
                      : section === "vet"
                      ? "Vet Confirmation"
                      : "Disposal"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctionReason">Reason for correction</Label>
              <Textarea
                id="correctionReason"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Describe what needs to be corrected..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCorrectionMode(false);
                  setCorrectionReason("");
                  setSelectedSection(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestCorrection}
                disabled={!selectedSection || !correctionReason || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Correction Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Review Decision</CardTitle>
            <CardDescription>
              Add any comments and submit your decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any notes or observations..."
                rows={3}
              />
            </div>

            {!allRequiredComplete && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Some required compliance items are incomplete</span>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setCorrectionMode(true)}
                disabled={isSubmitting}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Correction
              </Button>
              <Button
                onClick={handleApprove}
                disabled={!allRequiredComplete || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Approve Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
