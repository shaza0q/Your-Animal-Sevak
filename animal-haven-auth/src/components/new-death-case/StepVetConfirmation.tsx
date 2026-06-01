--- /dev/null
+++ c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\components\NewDeathCase\StepVetConfirmation.tsx
@@ -0,0 +1,148 @@
+import { Button } from "@/components/ui/button";
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
+import { Input } from "@/components/ui/input";
+import { Label } from "@/components/ui/label";
+import { Textarea } from "@/components/ui/textarea";
+import { Switch } from "@/components/ui/switch";
+import { AlertCircle } from "lucide-react";
+import { format } from "date-fns";
+
+interface StepVetConfirmationProps {
+  canFillVetSection: boolean | null;
+  selectedAnimalData: any;
+  reportedCause: string;
+  dateOfDeath: Date;
+  confirmedCause: string;
+  setConfirmedCause: (v: string) => void;
+  confirmedCauseDetails: string;
+  setConfirmedCauseDetails: (v: string) => void;
+  necropsyRequired: boolean;
+  setNecropsyRequired: (v: boolean) => void;
+  necropsyPerformed: boolean;
+  setNecropsyPerformed: (v: boolean) => void;
+  necropsyFindings: string;
+  setNecropsyFindings: (v: string) => void;
+  necropsyFiles: File[];
+  setNecropsyFiles: (v: File[]) => void;
+  vetNotes: string;
+  setVetNotes: (v: string) => void;
+}
+
+export function StepVetConfirmation({
+  canFillVetSection,
+  selectedAnimalData,
+  reportedCause,
+  dateOfDeath,
+  confirmedCause,
+  setConfirmedCause,
+  confirmedCauseDetails,
+  setConfirmedCauseDetails,
+  necropsyRequired,
+  setNecropsyRequired,
+  necropsyPerformed,
+  setNecropsyPerformed,
+  necropsyFindings,
+  setNecropsyFindings,
+  necropsyFiles,
+  setNecropsyFiles,
+  vetNotes,
+  setVetNotes,
+}: StepVetConfirmationProps) {
+  return (
+    <Card className="border-border/50 shadow-lg">
+      <CardHeader>
+        <CardTitle className="text-2xl">Veterinary Confirmation</CardTitle>
+        <CardDescription>
+          {canFillVetSection
+            ? "Provide professional confirmation of the cause of death."
+            : "Only veterinarians can access this section."}
+        </CardDescription>
+      </CardHeader>
+      <CardContent className="space-y-6">
+        {!canFillVetSection ? (
+          <div className="p-8 text-center">
+            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
+            <h3 className="font-semibold mb-2">Veterinarian Access Only</h3>
+            <p className="text-muted-foreground">
+              This section requires veterinarian privileges.
+            </p>
+          </div>
+        ) : (
+          <>
+            {selectedAnimalData && (
+              <div className="p-4 border rounded-lg bg-card">
+                <p className="font-medium">Animal: {selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
+                <p className="text-sm text-muted-foreground">
+                  Reported cause: {reportedCause} • Date: {format(dateOfDeath, "PPP")}
+                </p>
+              </div>
+            )}
+
+            <div className="space-y-2">
+              <Label>Confirmed Cause of Death *</Label>
+              <Textarea
+                placeholder="Enter the official medical cause of death..."
+                value={confirmedCause}
+                onChange={(e) => setConfirmedCause(e.target.value)}
+                className="min-h-[100px]"
+              />
+            </div>
+
+            <div className="space-y-2">
+              <Label>Detailed Findings & Observations</Label>
+              <Textarea
+                placeholder="Describe clinical findings, examination results, any tests performed..."
+                value={confirmedCauseDetails}
+                onChange={(e) => setConfirmedCauseDetails(e.target.value)}
+                className="min-h-[120px]"
+              />
+            </div>
+
+            {/* Necropsy Section */}
+            <div className="space-y-4 border rounded-lg p-4">
+              <div className="flex items-center justify-between">
+                <div>
+                  <Label className="font-medium">Necropsy Required?</Label>
+                  <p className="text-sm text-muted-foreground">Was a post-mortem examination needed or performed?</p>
+                </div>
+                <Switch
+                  checked={necropsyRequired}
+                  onCheckedChange={setNecropsyRequired}
+                />
+              </div>
+
+              {necropsyRequired && (
+                <>
+                  <div className="flex items-center justify-between">
+                    <div>
+                      <Label className="font-medium">Necropsy Performed?</Label>
+                      <p className="text-sm text-muted-foreground">Was the necropsy actually conducted?</p>
+                    </div>
+                    <Switch
+                      checked={necropsyPerformed}
+                      onCheckedChange={setNecropsyPerformed}
+                    />
+                  </div>
+
+                  {necropsyPerformed && (
+                    <>
+                      <div className="space-y-2">
+                        <Label>Necropsy Findings</Label>
+                        <Textarea
+                          placeholder="Describe necropsy findings, tissue samples taken, lab results..."
+                          value={necropsyFindings}
+                          onChange={(e) => setNecropsyFindings(e.target.value)}
+                          className="min-h-[100px]"
+                        />
+                      </div>
+
+                      <div className="space-y-2">
+                        <Label>Upload Necropsy Report</Label>
+                        <Input
+                          type="file"
+                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
+                          multiple
+                          onChange={(e) => {
+                            const files = Array.from(e.target.files || []);
+                            setNecropsyFiles(files);
+                          }}
+                        />
+                        <p className="text-xs text-muted-foreground">
+                          Upload necropsy reports, lab results, or photos. Max 10MB per file.
+                        </p>
+                        {necropsyFiles.length > 0 && (
+                          <div className="mt-2 space-y-1">
+                            {necropsyFiles.map((file, index) => (
+                              <div key={index} className="flex items-center justify-between text-sm">
+                                <span>{file.name}</span>
+                                <Button
+                                  variant="ghost"
+                                  size="sm"
+                                  onClick={() => setNecropsyFiles(necropsyFiles.filter((_, i) => i !== index))}
+                                >
+                                  Remove
+                                </Button>
+                              </div>
+                            ))}
+                          </div>
+                        )}
+                      </div>
+                    </>
+                  )}
+                </>
+              )}
+            </div>
+
+            <div className="space-y-2">
+              <Label>Additional Notes & Recommendations</Label>
+              <Textarea
+                placeholder="Any additional veterinary recommendations, treatment history, or notes..."
+                value={vetNotes}
+                onChange={(e) => setVetNotes(e.target.value)}
+                className="min-h-[80px]"
+              />
+            </div>
+
+            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
+              <p className="text-sm font-bold text-amber-500">Professional Responsibility</p>
+              <p className="text-xs text-amber-500/80 mt-1">
+                By submitting, you confirm that you have professionally examined this case
+                and the information provided is accurate to the best of your knowledge.
+              </p>
+            </div>
+          </>
+        )}
+      </CardContent>
+    </Card>
+  );
+}
