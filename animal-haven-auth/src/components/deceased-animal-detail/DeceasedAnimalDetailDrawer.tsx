import { format, formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  MapPin,
  User,
  Stethoscope,
  FileText,
  Clock,
  ChevronDown,
  CheckCircle2,
  Circle,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { Animal } from "@/types/animal";
import {
  DeceasedAnimalRecord,
  causeOfDeathLabels,
  placeOfDeathLabels,
  disposalMethodLabels,
} from "@/types/deceased";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DeceasedAnimalDetailDrawerProps {
  animal: Animal | null;
  deceasedRecord: DeceasedAnimalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeceasedAnimalDetailDrawer = ({
  animal,
  deceasedRecord,
  open,
  onOpenChange,
}: DeceasedAnimalDetailDrawerProps) => {
  const [medicalExpanded, setMedicalExpanded] = useState(false);

  if (!animal || !deceasedRecord) return null;

  const { deathRecord, medicalContext, auditMetadata } = deceasedRecord;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === "Unknown") return "Not recorded";
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return "Not recorded";
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateStr;
    }
  };

  const formatRelativeTime = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === "Unknown") return "";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                {animal.name}
                <Badge className="badge-deceased text-xs">Deceased</Badge>
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {animal.tagNumber} • {animal.type} • {animal.breed}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-6">
            {/* Section A: Animal Snapshot */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Animal Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">Gender</p>
                  <p className="font-medium capitalize">{animal.gender}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">Breed</p>
                  <p className="font-medium">{animal.breed || "Not recorded"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">Age at Death</p>
                  <p className="font-medium">{deceasedRecord.ageAtDeath || animal.age}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">Farm</p>
                  <p className="font-medium">{animal.farmName}</p>
                </div>
                <div className="col-span-2 space-y-0.5">
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location at Time of Death
                  </p>
                  <p className="font-medium">{deceasedRecord.location || "Not recorded"}</p>
                </div>
              </div>
            </section>

            <Separator className="bg-border/50" />

            {/* Section B: Death Record */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Death Record
              </h3>
              <div className="space-y-4">
                {/* Date and Time */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Date & Time of Death</p>
                    <p className="font-medium">
                      {formatDate(deathRecord.dateOfDeath)}
                      {deathRecord.timeOfDeath && ` at ${deathRecord.timeOfDeath}`}
                    </p>
                    {deathRecord.dateOfDeath !== "Unknown" && (
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(deathRecord.dateOfDeath)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cause of Death */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cause of Death</p>
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                    {causeOfDeathLabels[deathRecord.causeOfDeath]}
                  </Badge>
                  {deathRecord.causeDetails && (
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {deathRecord.causeDetails}
                    </p>
                  )}
                </div>

                {/* Place of Death */}
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Place of Death</p>
                  <p className="font-medium">{placeOfDeathLabels[deathRecord.placeOfDeath]}</p>
                </div>

                {/* Reported By / Confirmed By */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Reported By</p>
                      <p className="font-medium text-sm">{deathRecord.reportedBy}</p>
                    </div>
                  </div>
                  {deathRecord.confirmedBy && (
                    <div className="flex items-start gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Confirmed By (Vet)</p>
                        <p className="font-medium text-sm">{deathRecord.confirmedBy}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Necropsy */}
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Necropsy Performed</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{deathRecord.necropsyPerformed ? "Yes" : "No"}</p>
                    {deathRecord.necropsyPerformed && deathRecord.necropsyReportLink && (
                      <a 
                        href={deathRecord.necropsyReportLink}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Report <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Disposal */}
                {deathRecord.disposalMethod && (
                  <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Disposal Information
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Method</p>
                        <p className="font-medium">{disposalMethodLabels[deathRecord.disposalMethod]}</p>
                      </div>
                      {deathRecord.disposalDate && (
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium">{formatDate(deathRecord.disposalDate)}</p>
                        </div>
                      )}
                      {deathRecord.disposalLocation && (
                        <div className="col-span-2 space-y-0.5">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium">{deathRecord.disposalLocation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Separator className="bg-border/50" />

            {/* Section C: Medical Context (Collapsed by Default) */}
            <Collapsible open={medicalExpanded} onOpenChange={setMedicalExpanded}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Medical Context
                </h3>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    medicalExpanded && "rotate-180"
                  )} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                {medicalContext ? (
                  <>
                    {/* Last Vet Visit */}
                    {medicalContext.lastVetVisit && (
                      <div className="flex items-start gap-3">
                        <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">Last Veterinary Visit</p>
                          <p className="font-medium text-sm">{formatDate(medicalContext.lastVetVisit)}</p>
                          {medicalContext.lastVetVisitReason && (
                            <p className="text-xs text-muted-foreground">
                              Reason: {medicalContext.lastVetVisitReason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Treatments */}
                    {medicalContext.recentTreatments && medicalContext.recentTreatments.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Recent Treatments</p>
                        <ul className="space-y-1 text-sm">
                          {medicalContext.recentTreatments.map((treatment, i) => (
                            <li key={i} className="text-muted-foreground">• {treatment}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Known Conditions */}
                    {medicalContext.knownConditions && medicalContext.knownConditions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Known Conditions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {medicalContext.knownConditions.map((condition, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-muted/50">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vaccination Summary */}
                    {medicalContext.vaccinationSummary && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Vaccination Summary</p>
                        <p className="text-sm text-muted-foreground">{medicalContext.vaccinationSummary}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No medical context available for this record.
                  </p>
                )}

                <a 
                  href={`/farms/${animal.farmId}/animals/${animal.id}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                >
                  View Full Health History <ExternalLink className="h-3 w-3" />
                </a>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="bg-border/50" />

            {/* Section D: Audit & Compliance Metadata */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Audit & Compliance
              </h3>
              <div className="space-y-4">
                {/* Record Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Record Created By</p>
                      <p className="font-medium">{auditMetadata.recordCreatedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Created At</p>
                      <p className="font-medium">{formatDateTime(auditMetadata.recordCreatedAt)}</p>
                    </div>
                  </div>
                </div>

                {auditMetadata.lastModified && (
                  <div className="text-sm text-muted-foreground">
                    Last modified {formatRelativeTime(auditMetadata.lastModified)}
                    {auditMetadata.lastModifiedBy && ` by ${auditMetadata.lastModifiedBy}`}
                  </div>
                )}

                {/* Attachments */}
                {auditMetadata.attachments && auditMetadata.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      Attachments ({auditMetadata.attachments.length})
                    </p>
                    <div className="space-y-1.5">
                      {auditMetadata.attachments.map((attachment) => (
                        <div 
                          key={attachment.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{attachment.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {attachment.type.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Checklist */}
                {auditMetadata.complianceChecklist && auditMetadata.complianceChecklist.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Compliance Checklist</p>
                    <div className="space-y-1.5">
                      {auditMetadata.complianceChecklist.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <div className="space-y-0.5">
                            <p className={cn(
                              "font-medium",
                              !item.completed && "text-muted-foreground"
                            )}>
                              {item.label}
                            </p>
                            {item.completed && item.completedAt && (
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(item.completedAt)}
                                {item.completedBy && ` — ${item.completedBy}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer with read-only indicator */}
        <div className="px-6 py-3 border-t border-border/50 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            This is a read-only audit record. Contact an administrator to request changes.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DeceasedAnimalDetailDrawer;
