--- /dev/null
+++ c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\components\NewDeathCase\StepDisposal.tsx
@@ -0,0 +1,107 @@
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
+import { Input } from "@/components/ui/input";
+import { Label } from "@/components/ui/label";
+import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
+import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
+import { Button } from "@/components/ui/button";
+import { Calendar } from "@/components/ui/calendar";
+import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";
+import { format } from "date-fns";
+
+interface StepDisposalProps {
+  canFillDisposal: boolean | null;
+  disposalMethod: string;
+  setDisposalMethod: (v: string) => void;
+  disposalDate: Date;
+  setDisposalDate: (v: Date | undefined) => void;
+  disposalLocation: string;
+  setDisposalLocation: (v: string) => void;
+  disposalWitness: string;
+  setDisposalWitness: (v: string) => void;
+  setDisposalCertificate: (v: File | null) => void;
+}
+
+export function StepDisposal({
+  canFillDisposal,
+  disposalMethod,
+  setDisposalMethod,
+  disposalDate,
+  setDisposalDate,
+  disposalLocation,
+  setDisposalLocation,
+  disposalWitness,
+  setDisposalWitness,
+  setDisposalCertificate,
+}: StepDisposalProps) {
+  return (
+    <Card className="border-border/50 shadow-lg">
+      <CardHeader>
+        <CardTitle className="text-2xl">Disposal Information</CardTitle>
+        <CardDescription>
+          {canFillDisposal
+            ? "Document how the remains were handled for compliance."
+            : "You do not have permission to record disposal information."}
+        </CardDescription>
+      </CardHeader>
+      <CardContent className="space-y-6">
+        {!canFillDisposal ? (
+          <div className="p-8 text-center">
+            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
+            <h3 className="font-semibold mb-2">Permission Required</h3>
+            <p className="text-muted-foreground">
+              This section requires staff, caretaker, owner, or admin privileges.
+            </p>
+          </div>
+        ) : (
+          <>
+            <div className="grid gap-6 sm:grid-cols-2">
+              <div className="space-y-2">
+                <Label>Disposal Method *</Label>
+                <Select value={disposalMethod} onValueChange={setDisposalMethod}>
+                  <SelectTrigger>
+                    <SelectValue placeholder="Select method" />
+                  </SelectTrigger>
+                  <SelectContent>
+                    <SelectItem value="burial">On-site Burial</SelectItem>
+                    <SelectItem value="incineration">Incineration</SelectItem>
+                    <SelectItem value="rendering">Rendering Service</SelectItem>
+                    <SelectItem value="composting">Composting</SelectItem>
+                    <SelectItem value="landfill">Landfill</SelectItem>
+                    <SelectItem value="other">Other</SelectItem>
+                  </SelectContent>
+                </Select>
+              </div>
+              <div className="space-y-2">
+                <Label>Disposal Date *</Label>
+                <Popover>
+                  <PopoverTrigger asChild>
+                    <Button variant="outline" className="w-full justify-start text-left font-normal">
+                      <CalendarIcon className="mr-2 h-4 w-4" />
+                      {disposalDate ? format(disposalDate, "PPP") : "Select date"}
+                    </Button>
+                  </PopoverTrigger>
+                  <PopoverContent className="w-auto p-0" align="start">
+                    <Calendar mode="single" selected={disposalDate} onSelect={setDisposalDate} />
+                  </PopoverContent>
+                </Popover>
+              </div>
+              <div className="space-y-2 sm:col-span-2">
+                <Label>Disposal Location</Label>
+                <Input
+                  value={disposalLocation}
+                  onChange={(e) => setDisposalLocation(e.target.value)}
+                  placeholder="Specific area, facility, or coordinates..."
+                />
+              </div>
+              <div className="space-y-2 sm:col-span-2">
+                <Label>Witness (if applicable)</Label>
+                <Input
+                  value={disposalWitness}
+                  onChange={(e) => setDisposalWitness(e.target.value)}
+                  placeholder="Name of person who witnessed disposal"
+                />
+              </div>
+            </div>
+
+            <div className="p-4 border-2 border-dashed rounded-lg">
+              <Label className="block mb-2">Upload Disposal Certificate (Optional)</Label>
+              <Input
+                type="file"
+                accept=".pdf,.jpg,.jpeg,.png"
+                onChange={(e) => setDisposalCertificate(e.target.files?.[0] || null)}
+              />
+              <p className="text-xs text-muted-foreground mt-2">
+                Upload certificate from rendering service, landfill, or other disposal facility.
+              </p>
+            </div>
+
+            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
+              <p className="text-sm font-bold text-green-500">Compliance Note</p>
+              <p className="text-xs text-green-500/80 mt-1">
+                Proper disposal documentation is required for regulatory compliance and audit trails.
+              </p>
+            </div>
+          </>
+        )}
+      </CardContent>
+    </Card>
+  );
+}
