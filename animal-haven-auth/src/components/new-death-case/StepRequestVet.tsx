--- /dev/null
+++ c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\components\NewDeathCase\StepRequestVet.tsx
@@ -0,0 +1,118 @@
+import { Button } from "@/components/ui/button";
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
+import { Label } from "@/components/ui/label";
+import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
+import { Textarea } from "@/components/ui/textarea";
+import { AlertCircle, Check, Stethoscope } from "lucide-react";
+
+interface StepRequestVetProps {
+  canRequestVet: boolean | null;
+  vetRequired: boolean;
+  setVetRequired: (v: boolean) => void;
+  vetRequestReason: string;
+  setVetRequestReason: (v: string) => void;
+  assignedVetId: string;
+  setAssignedVetId: (v: string) => void;
+  availableVets: any[];
+  onSkip: () => void;
+}
+
+export function StepRequestVet({
+  canRequestVet,
+  vetRequired,
+  setVetRequired,
+  vetRequestReason,
+  setVetRequestReason,
+  assignedVetId,
+  setAssignedVetId,
+  availableVets,
+  onSkip,
+}: StepRequestVetProps) {
+  return (
+    <Card className="border-border/50 shadow-lg">
+      <CardHeader>
+        <CardTitle className="text-2xl">Request Veterinary Confirmation</CardTitle>
+        <CardDescription>
+          {canRequestVet
+            ? "Request a veterinarian to confirm the cause of death."
+            : "You do not have permission to request veterinarian confirmation."}
+        </CardDescription>
+      </CardHeader>
+      <CardContent className="space-y-6">
+        {!canRequestVet ? (
+          <div className="p-8 text-center">
+            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
+            <h3 className="font-semibold mb-2">Permission Required</h3>
+            <p className="text-muted-foreground">
+              Only owners, staff, and administrators can request veterinarian confirmation.
+            </p>
+            <Button variant="outline" className="mt-4" onClick={onSkip}>
+              Skip to Disposal
+            </Button>
+          </div>
+        ) : (
+          <>
+            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
+              <Stethoscope className="w-5 h-5 text-blue-500 mt-0.5" />
+              <div>
+                <p className="font-bold text-blue-500">Professional Confirmation</p>
+                <p className="text-sm opacity-80">
+                  Requesting a veterinarian is recommended for unclear causes, disease outbreaks,
+                  or when professional documentation is required for compliance.
+                </p>
+              </div>
+            </div>
+
+            <div className="space-y-4">
+              <div className="space-y-2">
+                <Label>Do you require veterinarian confirmation?</Label>
+                <div className="flex gap-4">
+                  <Button
+                    variant={vetRequired ? "default" : "outline"}
+                    className="flex-1"
+                    onClick={() => setVetRequired(true)}
+                  >
+                    Yes, request vet
+                  </Button>
+                  <Button
+                    variant={!vetRequired ? "default" : "outline"}
+                    className="flex-1"
+                    onClick={() => setVetRequired(false)}
+                  >
+                    No, skip vet review
+                  </Button>
+                </div>
+              </div>
+
+              {vetRequired && (
+                <>
+                  <div className="space-y-2">
+                    <Label>Reason for Veterinarian Request *</Label>
+                    <Textarea
+                      placeholder="Explain why veterinarian confirmation is needed..."
+                      value={vetRequestReason}
+                      onChange={(e) => setVetRequestReason(e.target.value)}
+                      className="min-h-[80px]"
+                    />
+                  </div>
+
+                  <div className="space-y-2">
+                    <Label>Assign to Veterinarian</Label>
+                    <Select value={assignedVetId} onValueChange={setAssignedVetId}>
+                      <SelectTrigger>
+                        <SelectValue placeholder="Select a veterinarian" />
+                      </SelectTrigger>
+                      <SelectContent>
+                        {availableVets.map((vet) => (
+                          <SelectItem key={vet.id} value={vet.id}>
+                            {vet.name} - {vet.specialty}
+                          </SelectItem>
+                        ))}
+                      </SelectContent>
+                    </Select>
+                  </div>
+
+                  <div className="p-4 border rounded-lg bg-muted/30">
+                    <p className="text-sm font-medium mb-2">What happens next:</p>
+                    <ul className="text-xs text-muted-foreground space-y-1">
+                      <li>• Selected veterinarian will receive a notification</li>
+                      <li>• Case status will change to "Awaiting Vet Confirmation"</li>
+                      <li>• You can proceed with disposal after vet confirms</li>
+                      <li>• Case will be paused until veterinarian responds</li>
+                    </ul>
+                  </div>
+                </>
+              )}
+
+              {!vetRequired && (
+                <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/20">
+                  <p className="text-sm font-medium text-green-500 flex items-center gap-2">
+                    <Check className="w-4 h-4" />
+                    Proceeding without veterinarian confirmation
+                  </p>
+                  <p className="text-xs text-green-500/80 mt-1">
+                    You can continue directly to disposal documentation.
+                  </p>
+                </div>
+              )}
+            </div>
+          </>
+        )}
+      </CardContent>
+    </Card>
+  );
+}
