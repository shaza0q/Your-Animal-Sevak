--- /dev/null
+++ c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\components\NewDeathCase\StepReview.tsx
@@ -0,0 +1,79 @@
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
+import { AlertCircle } from "lucide-react";
+import { format } from "date-fns";
+
+interface StepReviewProps {
+  canReviewSubmit: boolean | null;
+  selectedAnimalData: any;
+  dateOfDeath: Date;
+  placeOfDeath: string;
+  reportedCause: string;
+  vetRequired: boolean;
+  assignedVetId: string;
+  vetRequestReason: string;
+  disposalMethod: string;
+  disposalDate: Date;
+  disposalLocation: string;
+}
+
+export function StepReview({
+  canReviewSubmit,
+  selectedAnimalData,
+  dateOfDeath,
+  placeOfDeath,
+  reportedCause,
+  vetRequired,
+  assignedVetId,
+  vetRequestReason,
+  disposalMethod,
+  disposalDate,
+  disposalLocation,
+}: StepReviewProps) {
+  return (
+    <Card className="border-border/50 shadow-lg">
+      <CardHeader>
+        <CardTitle className="text-2xl">Review & Submit</CardTitle>
+        <CardDescription>
+          {canReviewSubmit
+            ? "Review all information before final submission."
+            : "You do not have permission to submit death cases."}
+        </CardDescription>
+      </CardHeader>
+      <CardContent className="space-y-6">
+        {!canReviewSubmit ? (
+          <div className="p-8 text-center">
+            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
+            <h3 className="font-semibold mb-2">Permission Required</h3>
+            <p className="text-muted-foreground">
+              This section requires staff, caretaker, owner, or admin privileges.
+            </p>
+          </div>
+        ) : (
+          <>
+            <div className="space-y-4">
+              <div className="grid sm:grid-cols-2 gap-6">
+                <div>
+                  <h4 className="font-semibold mb-3">Animal Details</h4>
+                  <div className="space-y-2 text-sm">
+                    <p><span className="text-muted-foreground">Name:</span> {selectedAnimalData?.name}</p>
+                    <p><span className="text-muted-foreground">Tag:</span> {selectedAnimalData?.tagNumber}</p>
+                    <p><span className="text-muted-foreground">Type:</span> {selectedAnimalData?.animalType}</p>
+                  </div>
+                </div>
+                <div>
+                  <h4 className="font-semibold mb-3">Death Event</h4>
+                  <div className="space-y-2 text-sm">
+                    <p><span className="text-muted-foreground">Date:</span> {format(dateOfDeath, "PPP")}</p>
+                    <p><span className="text-muted-foreground">Location:</span> {placeOfDeath}</p>
+                    <p><span className="text-muted-foreground">Reported Cause:</span> {reportedCause}</p>
+                  </div>
+                </div>
+              </div>
+
+              {vetRequired && (
+                <div className="border-t pt-4">
+                  <h4 className="font-semibold mb-3">Veterinary Information</h4>
+                  <div className="space-y-2 text-sm">
+                    <p><span className="text-muted-foreground">Status:</span> {assignedVetId ? "Vet Assigned" : "Vet Requested"}</p>
+                    {vetRequestReason && (
+                      <p><span className="text-muted-foreground">Reason:</span> {vetRequestReason}</p>
+                    )}
+                  </div>
+                </div>
+              )}
+
+              <div className="border-t pt-4">
+                <h4 className="font-semibold mb-3">Disposal Information</h4>
+                <div className="space-y-2 text-sm">
+                  <p><span className="text-muted-foreground">Method:</span> {disposalMethod || "Not specified"}</p>
+                  <p><span className="text-muted-foreground">Date:</span> {disposalDate ? format(disposalDate, "PPP") : "Not specified"}</p>
+                  <p><span className="text-muted-foreground">Location:</span> {disposalLocation || "Not specified"}</p>
+                </div>
+              </div>
+            </div>
+
+            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
+              <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
+              <p className="text-sm text-amber-500">
+                After submission, this case will be sent for manager review and become read-only.
+                Any further changes will require a formal correction request.
+              </p>
+            </div>
+          </>
+        )}
+      </CardContent>
+    </Card>
+  );
+}
