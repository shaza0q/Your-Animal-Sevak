+import { Button } from "@/components/ui/button";
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
+import { Input } from "@/components/ui/input";
+import { Label } from "@/components/ui/label";
+import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
+import { Textarea } from "@/components/ui/textarea";
+import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
+import { Calendar } from "@/components/ui/calendar";
+import { Badge } from "@/components/ui/badge";
+import { AlertCircle, Calendar as CalendarIcon, Loader2, Search, Stethoscope } from "lucide-react";
+import { cn } from "@/lib/utils";
+import { format } from "date-fns";
+
+interface StepReportDeathProps {
+  canReportDeat--- /dev/null
+++ c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\components\NewDeathCase\StepReportDeath.tsx
@@ -0,0 +1,245 @@
+import { Button } from "@/components/ui/button";
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
+import { Input } from "@/components/ui/input";
+import { Label } from "@/components/ui/label";
+import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
+import { Textarea } from "@/components/ui/textarea";
+import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
+import { Calendar } from "@/components/ui/calendar";
+import { Badge } from "@/components/ui/badge";
+import { AlertCircle, Calendar as CalendarIcon, Loader2, Search, Stethoscope } from "lucide-react";
+import { cn } from "@/lib/utils";
+import { format } from "date-fns";
+
+interface StepReportDeathProps {
+  canReportDeath: boolean | null;
+  role: string | null;
+  isAnimalConfirmed: boolean;
+  setIsAnimalConfirmed: (v: boolean) => void;
+  searchQuery: string;
+  setSearchQuery: (v: string) => void;
+  isSearching: boolean;
+  searchResults: any[];
+  selectedAnimal: string;
+  setSelectedAnimal: (v: string) => void;
+  selectedAnimalData: any;
+  setSelectedAnimalData: (v: any) => void;
+  dateOfDeath: Date;
+  setDateOfDeath: (v: Date | undefined) => void;
+  timeOfDeath: string;
+  setTimeOfDeath: (v: string) => void;
+  placeOfDeath: string;
+  setPlaceOfDeath: (v: string) => void;
+  reportedCause: string;
+  setReportedCause: (v: string) => void;
+  circumstances: string;
+  setCircumstances: (v: string) => void;
+  witnesses: string[];
+  setWitnesses: (v: string[]) => void;
+  witnessInput: string;
+  setWitnessInput: (v: string) => void;
+  canRequestVet: boolean | null;
+}
+
+export function StepReportDeath({
+  canReportDeath,
+  role,
+  isAnimalConfirmed,
+  setIsAnimalConfirmed,
+  searchQuery,
+  setSearchQuery,
+  isSearching,
+  searchResults,
+  selectedAnimal,
+  setSelectedAnimal,
+  selectedAnimalData,
+  setSelectedAnimalData,
+  dateOfDeath,
+  setDateOfDeath,
+  timeOfDeath,
+  setTimeOfDeath,
+  placeOfDeath,
+  setPlaceOfDeath,
+  reportedCause,
+  setReportedCause,
+  circumstances,
+  setCircumstances,
+  witnesses,
+  setWitnesses,
+  witnessInput,
+  setWitnessInput,
+  canRequestVet,
+}: StepReportDeathProps) {
+  return (
+    <Card className="border-border/50 shadow-lg">
+      <CardHeader>
+        <CardTitle className="text-2xl">Report Animal Death</CardTitle>
+        <CardDescription>
+          {canReportDeath
+            ? "Provide initial details about the death event."
+            : "You do not have permission to report deaths. Please contact an administrator."}
+        </CardDescription>
+      </CardHeader>
+      <CardContent className="space-y-6">
+        {!canReportDeath ? (
+          <div className="p-8 text-center">
+            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
+            <h3 className="font-semibold mb-2">Permission Required</h3>
+            <p className="text-muted-foreground">
+              Your role ({role}) does not have permission to report deaths.
+            </p>
+          </div>
+        ) : (
+          <>
+            {/* Animal Selection */}
+            {!isAnimalConfirmed ? (
+              <div className="space-y-4">
+                <div className="space-y-2">
+                  <Label htmlFor="search">Search animal</Label>
+                  <div className="relative">
+                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
+                    <Input
+                      id="search"
+                      placeholder="Enter tag number or animal name"
+                      value={searchQuery}
+                      onChange={(e) => setSearchQuery(e.target.value)}
+                      className="pl-10"
+                    />
+                  </div>
+                </div>
+
+                {searchQuery.length >= 2 && (
+                  <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
+                    {isSearching ? (
+                      <div className="p-8 text-center">
+                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
+                        <p className="text-muted-foreground">Searching animals...</p>
+                      </div>
+                    ) : (
+                      searchResults.map((animal) => {
+                        const isDeceased = animal.status === "deceased";
+                        const isSold = animal.status === "sold";
+                        const isDisabled = isDeceased || isSold;
+
+                        return (
+                          <div
+                            key={animal._id}
+                            className={cn(
+                              "p-4 flex items-center justify-between transition-colors",
+                              isDisabled ? "opacity-50 cursor-not-allowed bg-muted/20" : "hover:bg-muted/50 cursor-pointer",
+                              selectedAnimal === animal._id && !isDisabled && "bg-primary/5 border-primary/20"
+                            )}
+                            onClick={() => !isDisabled && (setSelectedAnimal(animal._id), setSelectedAnimalData(animal))}
+                          >
+                            <div className="flex-1">
+                              <div className="flex items-center gap-2">
+                                <p className="font-bold">{animal.name}</p>
+                                <span className="text-muted-foreground text-xs">— {animal.tagNumber}</span>
+                              </div>
+                              <p className="text-sm text-muted-foreground">{animal.animalType} • {animal.breed}</p>
+                              <p className="text-xs text-muted-foreground/70">{animal.status}</p>
+                            </div>
+                            <Badge
+                              variant={isDeceased ? "destructive" : isSold ? "outline" : "secondary"}
+                              className={cn(
+                                isDeceased && "bg-red-500/10 text-red-500 border-red-500/20",
+                                isSold && "bg-amber-500/10 text-amber-500 border-amber-500/20"
+                              )}
+                            >
+                              {animal.status}
+                            </Badge>
+                          </div>
+                        );
+                      })
+                    )}
+                  </div>
+                )}
+
+                {selectedAnimalData && !isAnimalConfirmed && (
+                  <div className="mt-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
+                    <p className="text-sm font-bold text-primary uppercase">Selected Animal</p>
+                    <div className="flex items-center gap-4">
+                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
+                        {selectedAnimalData.name.charAt(0)}
+                      </div>
+                      <div>
+                        <p className="font-bold text-xl">{selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
+                        <p className="text-muted-foreground">{selectedAnimalData.animalType} • {selectedAnimalData.breed}</p>
+                      </div>
+                    </div>
+                    <div className="flex gap-3 pt-2">
+                      <Button variant="outline" onClick={() => setSelectedAnimal("")} className="flex-1">Change Animal</Button>
+                      <Button onClick={() => setIsAnimalConfirmed(true)} className="flex-1">Confirm & Continue</Button>
+                    </div>
+                  </div>
+                )}
+              </div>
+            ) : (
+              <>
+                {/* Selected Animal Display */}
+                {selectedAnimalData && (
+                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
+                    <div className="flex items-center gap-4">
+                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
+                        {selectedAnimalData.name.charAt(0)}
+                      </div>
+                      <div>
+                        <p className="font-bold text-lg">{selectedAnimalData.name}</p>
+                        <p className="text-sm text-muted-foreground">Tag: {selectedAnimalData.tagNumber} • {selectedAnimalData.animalType}</p>
+                      </div>
+                    </div>
+                    <Button
+                      variant="ghost"
+                      size="sm"
+                      onClick={() => setIsAnimalConfirmed(false)}
+                      className="text-xs text-muted-foreground hover:text-primary"
+                    >
+                      Change Animal
+                    </Button>
+                  </div>
+                )}
+
+                {/* Death Event Form */}
+                <div className="grid gap-6 sm:grid-cols-2">
+                  <div className="space-y-2">
+                    <Label>Date of Death *</Label>
+                    <Popover>
+                      <PopoverTrigger asChild>
+                        <Button variant="outline" className="w-full justify-start text-left font-normal">
+                          <CalendarIcon className="mr-2 h-4 w-4" />
+                          {dateOfDeath ? format(dateOfDeath, "PPP") : "Select date"}
+                        </Button>
+                      </PopoverTrigger>
+                      <PopoverContent className="w-auto p-0" align="start">
+                        <Calendar mode="single" selected={dateOfDeath} onSelect={setDateOfDeath} />
+                      </PopoverContent>
+                    </Popover>
+                  </div>
+                  <div className="space-y-2">
+                    <Label>Approximate Time</Label>
+                    <Input type="time" value={timeOfDeath} onChange={(e) => setTimeOfDeath(e.target.value)} />
+                  </div>
+                  <div className="space-y-2">
+                    <Label>Location at time of death</Label>
+                    <Input
+                      value={placeOfDeath}
+                      onChange={(e) => setPlaceOfDeath(e.target.value)}
+                      placeholder="Enter location (e.g. Main Barn, Pasture, Clinic...)"
+                    />
+                  </div>
+                  <div className="space-y-2">
+                    <Label>Reported Cause *</Label>
+                    <Select value={reportedCause} onValueChange={setReportedCause}>
+                      <SelectTrigger>
+                        <SelectValue placeholder="Select cause" />
+                      </SelectTrigger>
+                      <SelectContent>
+                        <SelectItem value="natural">Natural Causes</SelectItem>
+                        <SelectItem value="accident">Accident</SelectItem>
+                        <SelectItem value="disease">Disease</SelectItem>
+                        <SelectItem value="predation">Predation</SelectItem>
+                        <SelectItem value="unknown">Unknown</SelectItem>
+                        <SelectItem value="other">Other</SelectItem>
+                      </SelectContent>
+                    </Select>
+                  </div>
+                  <div className="space-y-2 sm:col-span-2">
+                    <Label>Circumstances & Observations</Label>
+                    <Textarea
+                      placeholder="Describe what happened, any unusual observations, etc."
+                      value={circumstances}
+                      onChange={(e) => setCircumstances(e.target.value)}
+                      className="min-h-[100px]"
+                    />
+                  </div>
+                  <div className="space-y-2 sm:col-span-2">
+                    <Label>Witnesses (if any)</Label>
+                    <div className="space-y-2">
+                      <div className="flex gap-2">
+                        <Input
+                          value={witnessInput}
+                          onChange={(e) => setWitnessInput(e.target.value)}
+                          placeholder="Enter witness name"
+                          onKeyDown={(e) => {
+                            if (e.key === 'Enter' && witnessInput.trim()) {
+                              e.preventDefault();
+                              setWitnesses([...witnesses, witnessInput.trim()]);
+                              setWitnessInput("");
+                            }
+                          }}
+                        />
+                        <Button
+                          type="button"
+                          variant="outline"
+                          onClick={() => {
+                            if (witnessInput.trim()) {
+                              setWitnesses([...witnesses, witnessInput.trim()]);
+                              setWitnessInput("");
+                            }
+                          }}
+                        >
+                          Add
+                        </Button>
+                      </div>
+                      {witnesses.length > 0 && (
+                        <div className="flex flex-wrap gap-2 mt-2">
+                          {witnesses.map((witness, index) => (
+                            <Badge key={index} variant="secondary" className="gap-1">
+                              {witness}
+                              <button
+                                onClick={() => setWitnesses(witnesses.filter((_, i) => i !== index))}
+                                className="ml-1 hover:text-destructive"
+                              >
+                                ×
+                              </button>
+                            </Badge>
+                          ))}
+                        </div>
+                      )}
+                    </div>
+                  </div>
+                </div>
+
+                {/* Role-specific next step info */}
+                {canRequestVet && (
+                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
+                    <p className="text-sm font-bold text-blue-500 flex items-center gap-2">
+                      <Stethoscope className="w-4 h-4" />
+                      Next Step: Request Veterinary Confirmation
+                    </p>
+                    <p className="text-xs text-blue-500/80 mt-1">
+                      After reporting, you'll have the option to request a veterinarian's confirmation.
+                    </p>
+                  </div>
+                )}
+              </>
+            )}
+          </>
+        )}
+      </CardContent>
+    </Card>
+  );
+}
h: boolean | null;
+  role: string | null;
+  isAnimalConfirmed: boolean;
+  setIsAnimalConfirmed: (v: boolean) => void;
+  searchQuery: string;
+  setSearchQuery: (v: string) => void;
+  isSearching: boolean;
+  searchResults: any[];
+  selectedAnimal: string;
+  setSelectedAnimal: (v: string) => void;
+  selectedAnimalData: any;
+  setSelectedAnimalData: (v: any) => void;
+  dateOfDeath: Date;
+  setDateOfDeath: (v: Date | undefined) => void;
+  timeOfDeath: string;
+  setTimeOfDeath: (v: string) => void;
+  placeOfDeath: string;
+  setPlaceOfDeath: (v: string) => void;
+  reportedCause: string;
+  setReportedCause: (v: string) => void;
+  circumstances: string;
+  setCircumstances: (v: string) => void;
+  witnesses: string[];
+  setWitnesses: (v: string[]) => void;
+  witnessInput: string;
+  setWitnessInput: (v: string) => void;
+  canRequestVet: boolean | null;
+}
+
+export function StepReportDeath({
+  canReportDeath,
+  role,
+  isAnimalConfirmed,
+  setIsAnimalConfirmed,
+  searchQuery,
+  setSearchQuery,
+  isSearching,
+  searchResults,
+  selectedAnimal,
+  setSelectedAnimal,
+  selectedAnimalData,
+  setSelectedAnimalData,
+  dateOfDeath,
+  setDateOfDeath,
+  timeOfDeath,
+  setTimeOfDeath,
+  placeOfDeath,
+  setPlaceOfDeath,
+  reportedCause,
+  setReportedCause,
+  circumstances,
+  setCircumstances,
+  witnesses,
+  setWitnesses,
+  witnessInput,
+  setWitnessInput,
+  canRequestVet,
+}: StepReportDeathProps) {
+  return (
+    <Card className="border-border/50 shadow-lg">
+      <CardHeader>
+        <CardTitle className="text-2xl">Report Animal Death</CardTitle>
+        <CardDescription>
+          {canReportDeath
+            ? "Provide initial details about the death event."
+            : "You do not have permission to report deaths. Please contact an administrator."}
+        </CardDescription>
+      </CardHeader>
+      <CardContent className="space-y-6">
+        {!canReportDeath ? (
+          <div className="p-8 text-center">
+            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
+            <h3 className="font-semibold mb-2">Permission Required</h3>
+            <p className="text-muted-foreground">
+              Your role ({role}) does not have permission to report deaths.
+            </p>
+          </div>
+        ) : (
+          <>
+            {/* Animal Selection */}
+            {!isAnimalConfirmed ? (
+              <div className="space-y-4">
+                <div className="space-y-2">
+                  <Label htmlFor="search">Search animal</Label>
+                  <div className="relative">
+                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
+                    <Input
+                      id="search"
+                      placeholder="Enter tag number or animal name"
+                      value={searchQuery}
+                      onChange={(e) => setSearchQuery(e.target.value)}
+                      className="pl-10"
+                    />
+                  </div>
+                </div>
+
+                {searchQuery.length >= 2 && (
+                  <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
+                    {isSearching ? (
+                      <div className="p-8 text-center">
+                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
+                        <p className="text-muted-foreground">Searching animals...</p>
+                      </div>
+                    ) : (
+                      searchResults.map((animal) => {
+                        const isDeceased = animal.status === "deceased";
+                        const isSold = animal.status === "sold";
+                        const isDisabled = isDeceased || isSold;
+
+                        return (
+                          <div
+                            key={animal._id}
+                            className={cn(
+                              "p-4 flex items-center justify-between transition-colors",
+                              isDisabled ? "opacity-50 cursor-not-allowed bg-muted/20" : "hover:bg-muted/50 cursor-pointer",
+                              selectedAnimal === animal._id && !isDisabled && "bg-primary/5 border-primary/20"
+                            )}
+                            onClick={() => !isDisabled && (setSelectedAnimal(animal._id), setSelectedAnimalData(animal))}
+                          >
+                            <div className="flex-1">
+                              <div className="flex items-center gap-2">
+                                <p className="font-bold">{animal.name}</p>
+                                <span className="text-muted-foreground text-xs">— {animal.tagNumber}</span>
+                              </div>
+                              <p className="text-sm text-muted-foreground">{animal.animalType} • {animal.breed}</p>
+                              <p className="text-xs text-muted-foreground/70">{animal.status}</p>
+                            </div>
+                            <Badge
+                              variant={isDeceased ? "destructive" : isSold ? "outline" : "secondary"}
+                              className={cn(
+                                isDeceased && "bg-red-500/10 text-red-500 border-red-500/20",
+                                isSold && "bg-amber-500/10 text-amber-500 border-amber-500/20"
+                              )}
+                            >
+                              {animal.status}
+                            </Badge>
+                          </div>
+                        );
+                      })
+                    )}
+                  </div>
+                )}
+
+                {selectedAnimalData && !isAnimalConfirmed && (
+                  <div className="mt-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
+                    <p className="text-sm font-bold text-primary uppercase">Selected Animal</p>
+                    <div className="flex items-center gap-4">
+                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
+                        {selectedAnimalData.name.charAt(0)}
+                      </div>
+                      <div>
+                        <p className="font-bold text-xl">{selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
+                        <p className="text-muted-foreground">{selectedAnimalData.animalType} • {selectedAnimalData.breed}</p>
+                      </div>
+                    </div>
+                    <div className="flex gap-3 pt-2">
+                      <Button variant="outline" onClick={() => setSelectedAnimal("")} className="flex-1">Change Animal</Button>
+                      <Button onClick={() => setIsAnimalConfirmed(true)} className="flex-1">Confirm & Continue</Button>
+                    </div>
+                  </div>
+                )}
+              </div>
+            ) : (
+              <>
+                {/* Selected Animal Display */}
+                {selectedAnimalData && (
+                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
+                    <div className="flex items-center gap-4">
+                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
+                        {selectedAnimalData.name.charAt(0)}
+                      </div>
+                      <div>
+                        <p className="font-bold text-lg">{selectedAnimalData.name}</p>
+                        <p className="text-sm text-muted-foreground">Tag: {selectedAnimalData.tagNumber} • {selectedAnimalData.animalType}</p>
+                      </div>
+                    </div>
+                    <Button
+                      variant="ghost"
+                      size="sm"
+                      onClick={() => setIsAnimalConfirmed(false)}
+                      className="text-xs text-muted-foreground hover:text-primary"
+                    >
+                      Change Animal
+                    </Button>
+                  </div>
+                )}
+
+                {/* Death Event Form */}
+                <div className="grid gap-6 sm:grid-cols-2">
+                  <div className="space-y-2">
+                    <Label>Date of Death *</Label>
+                    <Popover>
+                      <PopoverTrigger asChild>
+                        <Button variant="outline" className="w-full justify-start text-left font-normal">
+                          <CalendarIcon className="mr-2 h-4 w-4" />
+                          {dateOfDeath ? format(dateOfDeath, "PPP") : "Select date"}
+                        </Button>
+                      </PopoverTrigger>
+                      <PopoverContent className="w-auto p-0" align="start">
+                        <Calendar mode="single" selected={dateOfDeath} onSelect={setDateOfDeath} />
+                      </PopoverContent>
+                    </Popover>
+                  </div>
+                  <div className="space-y-2">
+                    <Label>Approximate Time</Label>
+                    <Input type="time" value={timeOfDeath} onChange={(e) => setTimeOfDeath(e.target.value)} />
+                  </div>
+                  <div className="space-y-2">
+                    <Label>Location at time of death</Label>
+                    <Input
+                      value={placeOfDeath}
+                      onChange={(e) => setPlaceOfDeath(e.target.value)}
+                      placeholder="Enter location (e.g. Main Barn, Pasture, Clinic...)"
+                    />
+                  </div>
+                  <div className="space-y-2">
+                    <Label>Reported Cause *</Label>
+                    <Select value={reportedCause} onValueChange={setReportedCause}>
+                      <SelectTrigger>
+                        <SelectValue placeholder="Select cause" />
+                      </SelectTrigger>
+                      <SelectContent>
+                        <SelectItem value="natural">Natural Causes</SelectItem>
+                        <SelectItem value="accident">Accident</SelectItem>
+                        <SelectItem value="disease">Disease</SelectItem>
+                        <SelectItem value="predation">Predation</SelectItem>
+                        <SelectItem value="unknown">Unknown</SelectItem>
+                        <SelectItem value="other">Other</SelectItem>
+                      </SelectContent>
+                    </Select>
+                  </div>
+                  <div className="space-y-2 sm:col-span-2">
+                    <Label>Circumstances & Observations</Label>
+                    <Textarea
+                      placeholder="Describe what happened, any unusual observations, etc."
+                      value={circumstances}
+                      onChange={(e) => setCircumstances(e.target.value)}
+                      className="min-h-[100px]"
+                    />
+                  </div>
+                  <div className="space-y-2 sm:col-span-2">
+                    <Label>Witnesses (if any)</Label>
+                    <div className="space-y-2">
+                      <div className="flex gap-2">
+                        <Input
+                          value={witnessInput}
+                          onChange={(e) => setWitnessInput(e.target.value)}
+                          placeholder="Enter witness name"
+                          onKeyDown={(e) => {
+                            if (e.key === 'Enter' && witnessInput.trim()) {
+                              e.preventDefault();
+                              setWitnesses([...witnesses, witnessInput.trim()]);
+                              setWitnessInput("");
+                            }
+                          }}
+                        />
+                        <Button
+                          type="button"
+                          variant="outline"
+                          onClick={() => {
+                            if (witnessInput.trim()) {
+                              setWitnesses([...witnesses, witnessInput.trim()]);
+                              setWitnessInput("");
+                            }
+                          }}
+                        >
+                          Add
+                        </Button>
+                      </div>
+                      {witnesses.length > 0 && (
+                        <div className="flex flex-wrap gap-2 mt-2">
+                          {witnesses.map((witness, index) => (
+                            <Badge key={index} variant="secondary" className="gap-1">
+                              {witness}
+                              <button
+                                onClick={() => setWitnesses(witnesses.filter((_, i) => i !== index))}
+                                className="ml-1 hover:text-destructive"
+                              >
+                                ×
+                              </button>
+                            </Badge>
+                          ))}
+                        </div>
+                      )}
+                    </div>
+                  </div>
+                </div>
+
+                {/* Role-specific next step info */}
+                {canRequestVet && (
+                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
+                    <p className="text-sm font-bold text-blue-500 flex items-center gap-2">
+                      <Stethoscope className="w-4 h-4" />
+                      Next Step: Request Veterinary Confirmation
+                    </p>
+                    <p className="text-xs text-blue-500/80 mt-1">
+                      After reporting, you'll have the option to request a veterinarian's confirmation.
+                    </p>
+                  </div>
+                )}
+              </>
+            )}
+          </>
+        )}
+      </CardContent>
+    </Card>
+  );
+}
