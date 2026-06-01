--- c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\pages\NewDeathCase.tsx
+++ c:\Users\91700\Desktop\projects\Animal Management System\animal-haven-auth\src\pages\NewDeathCase.tsx
@@ -1,25 +1,13 @@
-import { useState, useEffect } from "react";
+import { useEffect, useState } from "react";
 import { useNavigate, useParams } from "react-router-dom";
 import { Button } from "@/components/ui/button";
-import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
-import { Label } from "@/components/ui/label";
-import { Input } from "@/components/ui/input";
-import { Textarea } from "@/components/ui/textarea";
-import {
-  Select,
-  SelectContent,
-  SelectItem,
-  SelectTrigger,
-  SelectValue,
-} from "@/components/ui/select";
-import { Calendar } from "@/components/ui/calendar";
-import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
+import { StepDisposal } from "@/components/NewDeathCase/StepDisposal";
+import { StepReportDeath } from "@/components/NewDeathCase/StepReportDeath";
+import { StepRequestVet } from "@/components/NewDeathCase/StepRequestVet";
+import { StepReview } from "@/components/NewDeathCase/StepReview";
+import { StepVetConfirmation } from "@/components/NewDeathCase/StepVetConfirmation";
 import { generateCaseNumber } from "@/data/mockDeathCases";
 import { searchAnimals } from "@/api/searchAnimals";
-import { format } from "date-fns";
 import { cn } from "@/lib/utils";
 import {
   ArrowLeft,
-  Calendar as CalendarIcon,
   CheckCircle2,
-  AlertCircle,
   Loader2,
-  Clock,
-  ArrowRight,
-  ShieldCheck,
-  ClipboardList,
   Check,
-  Search,
   User,
   Stethoscope,
   Trash2,
   FileCheck
 } from "lucide-react";
-import { Switch } from "@/components/ui/switch";
 import { toast } from "@/hooks/use-toast";
 import { Badge } from "@/components/ui/badge";
 import { fetchUser } from "@/utils/fetchUser";
@@ -627,222 +615,69 @@
 
         {/* STEP 1: Report Death (Visible to: owner, staff, caretaker, admin) */}
         {currentStep === "report" && (
-          <Card className="border-border/50 shadow-lg">
-            <CardHeader>
-              <CardTitle className="text-2xl">Report Animal Death</CardTitle>
-              <CardDescription>
-                {canReportDeath 
-                  ? "Provide initial details about the death event."
-                  : "You do not have permission to report deaths. Please contact an administrator."
-                }
-              </CardDescription>
-            </CardHeader>
-            <CardContent className="space-y-6">
-              {!canReportDeath ? (
-                <div className="p-8 text-center">
-                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
-                  <h3 className="font-semibold mb-2">Permission Required</h3>
-                  <p className="text-muted-foreground">
-                    Your role ({role}) does not have permission to report deaths.
-                  </p>
-                </div>
-              ) : (
-                <>
-                  {/* Animal Selection */}
-                  {!isAnimalConfirmed ? (
-                    <div className="space-y-4">
-                      <div className="space-y-2">
-                        <Label htmlFor="search">Search animal</Label>
-                        <div className="relative">
-                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
-                          <Input
-                            id="search"
-                            placeholder="Enter tag number or animal name"
-                            value={searchQuery}
-                            onChange={(e) => setSearchQuery(e.target.value)}
-                            className="pl-10"
-                          />
-                        </div>
-                      </div>
-
-                      {searchQuery.length >= 2 && (
-                        <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
-                          {isSearching ? (
-                            <div className="p-8 text-center">
-                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
-                              <p className="text-muted-foreground">Searching animals...</p>
-                            </div>
-                          ) : (
-                            searchResults.map((animal) => {
-                              const isDeceased = animal.status === "deceased";
-                              const isSold = animal.status === "sold";
-                              const isDisabled = isDeceased || isSold;
-                              
-                              return (
-                                <div 
-                                  key={animal._id}
-                                  className={cn(
-                                    "p-4 flex items-center justify-between transition-colors",
-                                    isDisabled ? "opacity-50 cursor-not-allowed bg-muted/20" : "hover:bg-muted/50 cursor-pointer",
-                                    selectedAnimal === animal._id && !isDisabled && "bg-primary/5 border-primary/20"
-                                  )}
-                                  onClick={() => !isDisabled && (setSelectedAnimal(animal._id), setSelectedAnimalData(animal))}
-                                >
-                                  <div className="flex-1">
-                                    <div className="flex items-center gap-2">
-                                      <p className="font-bold">{animal.name}</p>
-                                      <span className="text-muted-foreground text-xs">— {animal.tagNumber}</span>
-                                    </div>
-                                    <p className="text-sm text-muted-foreground">{animal.animalType} • {animal.breed}</p>
-                                    <p className="text-xs text-muted-foreground/70">{animal.status}</p>
-                                  </div>
-                                  <Badge 
-                                    variant={isDeceased ? "destructive" : isSold ? "outline" : "secondary"}
-                                    className={cn(
-                                      isDeceased && "bg-red-500/10 text-red-500 border-red-500/20",
-                                      isSold && "bg-amber-500/10 text-amber-500 border-amber-500/20"
-                                    )}
-                                  >
-                                    {animal.status}
-                                  </Badge>
-                                </div>
-                              );
-                            })
-                          )}
-                        </div>
-                      )}
-
-                      {selectedAnimalData && !isAnimalConfirmed && (
-                        <div className="mt-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
-                          <p className="text-sm font-bold text-primary uppercase">Selected Animal</p>
-                          <div className="flex items-center gap-4">
-                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
-                              {selectedAnimalData.name.charAt(0)}
-                            </div>
-                            <div>
-                              <p className="font-bold text-xl">{selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
-                              <p className="text-muted-foreground">{selectedAnimalData.animalType} • {selectedAnimalData.breed}</p>
-                            </div>
-                          </div>
-                          <div className="flex gap-3 pt-2">
-                            <Button variant="outline" onClick={() => setSelectedAnimal("")} className="flex-1">Change Animal</Button>
-                            <Button onClick={() => setIsAnimalConfirmed(true)} className="flex-1">Confirm & Continue</Button>
-                          </div>
-                        </div>
-                      )}
-                    </div>
-                  ) : (
-                    <>
-                      {/* Selected Animal Display */}
-                      {selectedAnimalData && (
-                        <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
-                          <div className="flex items-center gap-4">
-                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
-                              {selectedAnimalData.name.charAt(0)}
-                            </div>
-                            <div>
-                              <p className="font-bold text-lg">{selectedAnimalData.name}</p>
-                              <p className="text-sm text-muted-foreground">Tag: {selectedAnimalData.tagNumber} • {selectedAnimalData.animalType}</p>
-                            </div>
-                          </div>
-                          <Button 
-                            variant="ghost" 
-                            size="sm" 
-                            onClick={() => setIsAnimalConfirmed(false)}
-                            className="text-xs text-muted-foreground hover:text-primary"
-                          >
-                            Change Animal
-                          </Button>
-                        </div>
-                      )}
-
-                      {/* Death Event Form */}
-                      <div className="grid gap-6 sm:grid-cols-2">
-                        <div className="space-y-2">
-                          <Label>Date of Death *</Label>
-                          <Popover>
-                            <PopoverTrigger asChild>
-                              <Button variant="outline" className="w-full justify-start text-left font-normal">
-                                <CalendarIcon className="mr-2 h-4 w-4" />
-                                {format(dateOfDeath, "PPP")}
-                              </Button>
-                            </PopoverTrigger>
-                            <PopoverContent className="w-auto p-0" align="start">
-                              <Calendar mode="single" selected={dateOfDeath} onSelect={(d) => d && setDateOfDeath(d)} />
-                            </PopoverContent>
-                          </Popover>
-                        </div>
-                        <div className="space-y-2">
-                          <Label>Approximate Time</Label>
-                          <Input type="time" value={timeOfDeath} onChange={(e) => setTimeOfDeath(e.target.value)} />
-                        </div>
-                        <div className="space-y-2">
-                          <Label>Location at time of death</Label>
-                          <Input
-                            value={placeOfDeath}
-                            onChange={(e) => setPlaceOfDeath(e.target.value)}
-                            placeholder="Enter location (e.g. Main Barn, Pasture, Clinic...)"
-                          />
-                        </div>
-                        <div className="space-y-2">
-                          <Label>Reported Cause *</Label>
-                          <Select value={reportedCause} onValueChange={setReportedCause}>
-                            <SelectTrigger>
-                              <SelectValue placeholder="Select cause" />
-                            </SelectTrigger>
-                            <SelectContent>
-                              <SelectItem value="natural">Natural Causes</SelectItem>
-                              <SelectItem value="accident">Accident</SelectItem>
-                              <SelectItem value="disease">Disease</SelectItem>
-                              <SelectItem value="predation">Predation</SelectItem>
-                              <SelectItem value="unknown">Unknown</SelectItem>
-                              <SelectItem value="other">Other</SelectItem>
-                            </SelectContent>
-                          </Select>
-                        </div>
-                        <div className="space-y-2 sm:col-span-2">
-                          <Label>Circumstances & Observations</Label>
-                          <Textarea 
-                            placeholder="Describe what happened, any unusual observations, etc."
-                            value={circumstances}
-                            onChange={(e) => setCircumstances(e.target.value)}
-                            className="min-h-[100px]"
-                          />
-                        </div>
-                        <div className="space-y-2 sm:col-span-2">
-                          <Label>Witnesses (if any)</Label>
-                          <div className="space-y-2">
-                            <div className="flex gap-2">
-                              <Input
-                                value={witnessInput}
-                                onChange={(e) => setWitnessInput(e.target.value)}
-                                placeholder="Enter witness name"
-                                onKeyDown={(e) => {
-                                  if (e.key === 'Enter' && witnessInput.trim()) {
-                                    e.preventDefault();
-                                    setWitnesses([...witnesses, witnessInput.trim()]);
-                                    setWitnessInput("");
-                                  }
-                                }}
-                              />
-                              <Button
-                                type="button"
-                                variant="outline"
-                                onClick={() => {
-                                  if (witnessInput.trim()) {
-                                    setWitnesses([...witnesses, witnessInput.trim()]);
-                                    setWitnessInput("");
-                                  }
-                                }}
-                              >
-                                Add
-                              </Button>
-                            </div>
-                            {witnesses.length > 0 && (
-                              <div className="flex flex-wrap gap-2 mt-2">
-                                {witnesses.map((witness, index) => (
-                                  <Badge key={index} variant="secondary" className="gap-1">
-                                    {witness}
-                                    <button
-                                      onClick={() => setWitnesses(witnesses.filter((_, i) => i !== index))}
-                                      className="ml-1 hover:text-destructive"
-                                    >
-                                      ×
-                                    </button>
-                                  </Badge>
-                                ))}
-                              </div>
-                            )}
-                          </div>
-                        </div>
-                      </div>
-
-                      {/* Role-specific next step info */}
-                      {canRequestVet && (
-                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
-                          <p className="text-sm font-bold text-blue-500 flex items-center gap-2">
-                            <Stethoscope className="w-4 h-4" />
-                            Next Step: Request Veterinary Confirmation
-                          </p>
-                          <p className="text-xs text-blue-500/80 mt-1">
-                            After reporting, you'll have the option to request a veterinarian's confirmation.
-                          </p>
-                        </div>
-                      )}
-                    </>
-                  )}
-                </>
-              )}
-            </CardContent>
-          </Card>
+          <StepReportDeath
+            canReportDeath={canReportDeath}
+            role={role}
+            isAnimalConfirmed={isAnimalConfirmed}
+            setIsAnimalConfirmed={setIsAnimalConfirmed}
+            searchQuery={searchQuery}
+            setSearchQuery={setSearchQuery}
+            isSearching={isSearching}
+            searchResults={searchResults}
+            selectedAnimal={selectedAnimal}
+            setSelectedAnimal={setSelectedAnimal}
+            selectedAnimalData={selectedAnimalData}
+            setSelectedAnimalData={setSelectedAnimalData}
+            dateOfDeath={dateOfDeath}
+            setDateOfDeath={(d) => d && setDateOfDeath(d)}
+            timeOfDeath={timeOfDeath}
+            setTimeOfDeath={setTimeOfDeath}
+            placeOfDeath={placeOfDeath}
+            setPlaceOfDeath={setPlaceOfDeath}
+            reportedCause={reportedCause}
+            setReportedCause={setReportedCause}
+            circumstances={circumstances}
+            setCircumstances={setCircumstances}
+            witnesses={witnesses}
+            setWitnesses={setWitnesses}
+            witnessInput={witnessInput}
+            setWitnessInput={setWitnessInput}
+            canRequestVet={canRequestVet}
+          />
         )}
 
         {/* STEP 2: Request Vet (Visible to: owner, staff, admin - NOT caretaker) */}
         {currentStep === "request-vet" && (
-          <Card className="border-border/50 shadow-lg">
-            <CardHeader>
-              <CardTitle className="text-2xl">Request Veterinary Confirmation</CardTitle>
-              <CardDescription>
-                {canRequestVet
-                  ? "Request a veterinarian to confirm the cause of death."
-                  : "You do not have permission to request veterinarian confirmation."
-                }
-              </CardDescription>
-            </CardHeader>
-            <CardContent className="space-y-6">
-              {!canRequestVet ? (
-                <div className="p-8 text-center">
-                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
-                  <h3 className="font-semibold mb-2">Permission Required</h3>
-                  <p className="text-muted-foreground">
-                    Only owners, staff, and administrators can request veterinarian confirmation.
-                  </p>
-                  <Button 
-                    variant="outline" 
-                    className="mt-4"
-                    onClick={() => setCurrentStep("disposal")}
-                  >
-                    Skip to Disposal
-                  </Button>
-                </div>
-              ) : (
-                <>
-                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
-                    <Stethoscope className="w-5 h-5 text-blue-500 mt-0.5" />
-                    <div>
-                      <p className="font-bold text-blue-500">Professional Confirmation</p>
-                      <p className="text-sm opacity-80">
-                        Requesting a veterinarian is recommended for unclear causes, disease outbreaks, 
-                        or when professional documentation is required for compliance.
-                      </p>
-                    </div>
-                  </div>
-
-                  <div className="space-y-4">
-                    <div className="space-y-2">
-                      <Label>Do you require veterinarian confirmation?</Label>
-                      <div className="flex gap-4">
-                        <Button
-                          variant={vetRequired ? "default" : "outline"}
-                          className="flex-1"
-                          onClick={() => setVetRequired(true)}
-                        >
-                          Yes, request vet
-                        </Button>
-                        <Button
-                          variant={!vetRequired ? "default" : "outline"}
-                          className="flex-1"
-                          onClick={() => setVetRequired(false)}
-                        >
-                          No, skip vet review
-                        </Button>
-                      </div>
-                    </div>
-
-                    {vetRequired && (
-                      <>
-                        <div className="space-y-2">
-                          <Label>Reason for Veterinarian Request *</Label>
-                          <Textarea
-                            placeholder="Explain why veterinarian confirmation is needed..."
-                            value={vetRequestReason}
-                            onChange={(e) => setVetRequestReason(e.target.value)}
-                            className="min-h-[80px]"
-                          />
-                        </div>
-
-                        <div className="space-y-2">
-                          <Label>Assign to Veterinarian</Label>
-                          <Select value={assignedVetId} onValueChange={setAssignedVetId}>
-                            <SelectTrigger>
-                              <SelectValue placeholder="Select a veterinarian" />
-                            </SelectTrigger>
-                            <SelectContent>
-                              {availableVets.map((vet) => (
-                                <SelectItem key={vet.id} value={vet.id}>
-                                  {vet.name} - {vet.specialty}
-                                </SelectItem>
-                              ))}
-                            </SelectContent>
-                          </Select>
-                        </div>
-
-                        <div className="p-4 border rounded-lg bg-muted/30">
-                          <p className="text-sm font-medium mb-2">What happens next:</p>
-                          <ul className="text-xs text-muted-foreground space-y-1">
-                            <li>• Selected veterinarian will receive a notification</li>
-                            <li>• Case status will change to "Awaiting Vet Confirmation"</li>
-                            <li>• You can proceed with disposal after vet confirms</li>
-                            <li>• Case will be paused until veterinarian responds</li>
-                          </ul>
-                        </div>
-                      </>
-                    )}
-
-                    {!vetRequired && (
-                      <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/20">
-                        <p className="text-sm font-medium text-green-500 flex items-center gap-2">
-                          <Check className="w-4 h-4" />
-                          Proceeding without veterinarian confirmation
-                        </p>
-                        <p className="text-xs text-green-500/80 mt-1">
-                          You can continue directly to disposal documentation.
-                        </p>
-                      </div>
-                    )}
-                  </div>
-                </>
-              )}
-            </CardContent>
-          </Card>
+          <StepRequestVet
+            canRequestVet={canRequestVet}
+            vetRequired={vetRequired}
+            setVetRequired={setVetRequired}
+            vetRequestReason={vetRequestReason}
+            setVetRequestReason={setVetRequestReason}
+            assignedVetId={assignedVetId}
+            setAssignedVetId={setAssignedVetId}
+            availableVets={availableVets}
+            onSkip={() => setCurrentStep("disposal")}
+          />
         )}
 
         {/* STEP 3: Vet Confirmation (Visible to: veterinarian, admin) */}
         {currentStep === "vet-confirmation" && (
-          <Card className="border-border/50 shadow-lg">
-            <CardHeader>
-              <CardTitle className="text-2xl">Veterinary Confirmation</CardTitle>
-              <CardDescription>
-                {canFillVetSection
-                  ? "Provide professional confirmation of the cause of death."
-                  : "Only veterinarians can access this section."
-                }
-              </CardDescription>
-            </CardHeader>
-            <CardContent className="space-y-6">
-              {!canFillVetSection ? (
-                <div className="p-8 text-center">
-                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
-                  <h3 className="font-semibold mb-2">Veterinarian Access Only</h3>
-                  <p className="text-muted-foreground">
-                    This section requires veterinarian privileges.
-                  </p>
-                </div>
-              ) : (
-                <>
-                  {selectedAnimalData && (
-                    <div className="p-4 border rounded-lg bg-card">
-                      <p className="font-medium">Animal: {selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
-                      <p className="text-sm text-muted-foreground">
-                        Reported cause: {reportedCause} • Date: {format(dateOfDeath, "PPP")}
-                      </p>
-                    </div>
-                  )}
-
-                  <div className="space-y-2">
-                    <Label>Confirmed Cause of Death *</Label>
-                    <Textarea
-                      placeholder="Enter the official medical cause of death..."
-                      value={confirmedCause}
-                      onChange={(e) => setConfirmedCause(e.target.value)}
-                      className="min-h-[100px]"
-                    />
-                  </div>
-
-                  <div className="space-y-2">
-                    <Label>Detailed Findings & Observations</Label>
-                    <Textarea
-                      placeholder="Describe clinical findings, examination results, any tests performed..."
-                      value={confirmedCauseDetails}
-                      onChange={(e) => setConfirmedCauseDetails(e.target.value)}
-                      className="min-h-[120px]"
-                    />
-                  </div>
-
-                  {/* Necropsy Section */}
-                  <div className="space-y-4 border rounded-lg p-4">
-                    <div className="flex items-center justify-between">
-                      <div>
-                        <Label className="font-medium">Necropsy Required?</Label>
-                        <p className="text-sm text-muted-foreground">Was a post-mortem examination needed or performed?</p>
-                      </div>
-                      <Switch
-                        checked={necropsyRequired}
-                        onCheckedChange={setNecropsyRequired}
-                      />
-                    </div>
-
-                    {necropsyRequired && (
-                      <>
-                        <div className="flex items-center justify-between">
-                          <div>
-                            <Label className="font-medium">Necropsy Performed?</Label>
-                            <p className="text-sm text-muted-foreground">Was the necropsy actually conducted?</p>
-                          </div>
-                          <Switch
-                            checked={necropsyPerformed}
-                            onCheckedChange={setNecropsyPerformed}
-                          />
-                        </div>
-
-                        {necropsyPerformed && (
-                          <>
-                            <div className="space-y-2">
-                              <Label>Necropsy Findings</Label>
-                              <Textarea
-                                placeholder="Describe necropsy findings, tissue samples taken, lab results..."
-                                value={necropsyFindings}
-                                onChange={(e) => setNecropsyFindings(e.target.value)}
-                                className="min-h-[100px]"
-                              />
-                            </div>
-
-                            <div className="space-y-2">
-                              <Label>Upload Necropsy Report</Label>
-                              <Input
-                                type="file"
-                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
-                                multiple
-                                onChange={(e) => {
-                                  const files = Array.from(e.target.files || []);
-                                  setNecropsyFiles(files);
-                                }}
-                              />
-                              <p className="text-xs text-muted-foreground">
-                                Upload necropsy reports, lab results, or photos. Max 10MB per file.
-                              </p>
-                              {necropsyFiles.length > 0 && (
-                                <div className="mt-2 space-y-1">
-                                  {necropsyFiles.map((file, index) => (
-                                    <div key={index} className="flex items-center justify-between text-sm">
-                                      <span>{file.name}</span>
-                                      <Button
-                                        variant="ghost"
-                                        size="sm"
-                                        onClick={() => setNecropsyFiles(necropsyFiles.filter((_, i) => i !== index))}
-                                      >
-                                        Remove
-                                      </Button>
-                                    </div>
-                                  ))}
-                                </div>
-                              )}
-                            </div>
-                          </>
-                        )}
-                      </>
-                    )}
-                  </div>
-
-                  <div className="space-y-2">
-                    <Label>Additional Notes & Recommendations</Label>
-                    <Textarea
-                      placeholder="Any additional veterinary recommendations, treatment history, or notes..."
-                      value={vetNotes}
-                      onChange={(e) => setVetNotes(e.target.value)}
-                      className="min-h-[80px]"
-                    />
-                  </div>
-
-                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
-                    <p className="text-sm font-bold text-amber-500">Professional Responsibility</p>
-                    <p className="text-xs text-amber-500/80 mt-1">
-                      By submitting, you confirm that you have professionally examined this case 
-                      and the information provided is accurate to the best of your knowledge.
-                    </p>
-                  </div>
-                </>
-              )}
-            </CardContent>
-          </Card>
+          <StepVetConfirmation
+            canFillVetSection={canFillVetSection}
+            selectedAnimalData={selectedAnimalData}
+            reportedCause={reportedCause}
+            dateOfDeath={dateOfDeath}
+            confirmedCause={confirmedCause}
+            setConfirmedCause={setConfirmedCause}
+            confirmedCauseDetails={confirmedCauseDetails}
+            setConfirmedCauseDetails={setConfirmedCauseDetails}
+            necropsyRequired={necropsyRequired}
+            setNecropsyRequired={setNecropsyRequired}
+            necropsyPerformed={necropsyPerformed}
+            setNecropsyPerformed={setNecropsyPerformed}
+            necropsyFindings={necropsyFindings}
+            setNecropsyFindings={setNecropsyFindings}
+            necropsyFiles={necropsyFiles}
+            setNecropsyFiles={setNecropsyFiles}
+            vetNotes={vetNotes}
+            setVetNotes={setVetNotes}
+          />
         )}
 
         {/* STEP 4: Disposal (Visible to: staff, caretaker, owner, admin) */}
         {currentStep === "disposal" && (
-          <Card className="border-border/50 shadow-lg">
-            <CardHeader>
-              <CardTitle className="text-2xl">Disposal Information</CardTitle>
-              <CardDescription>
-                {canFillDisposal
-                  ? "Document how the remains were handled for compliance."
-                  : "You do not have permission to record disposal information."
-                }
-              </CardDescription>
-            </CardHeader>
-            <CardContent className="space-y-6">
-              {!canFillDisposal ? (
-                <div className="p-8 text-center">
-                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
-                  <h3 className="font-semibold mb-2">Permission Required</h3>
-                  <p className="text-muted-foreground">
-                    This section requires staff, caretaker, owner, or admin privileges.
-                  </p>
-                </div>
-              ) : (
-                <>
-                  <div className="grid gap-6 sm:grid-cols-2">
-                    <div className="space-y-2">
-                      <Label>Disposal Method *</Label>
-                      <Select value={disposalMethod} onValueChange={setDisposalMethod}>
-                        <SelectTrigger>
-                          <SelectValue placeholder="Select method" />
-                        </SelectTrigger>
-                        <SelectContent>
-                          <SelectItem value="burial">On-site Burial</SelectItem>
-                          <SelectItem value="incineration">Incineration</SelectItem>
-                          <SelectItem value="rendering">Rendering Service</SelectItem>
-                          <SelectItem value="composting">Composting</SelectItem>
-                          <SelectItem value="landfill">Landfill</SelectItem>
-                          <SelectItem value="other">Other</SelectItem>
-                        </SelectContent>
-                      </Select>
-                    </div>
-                    <div className="space-y-2">
-                      <Label>Disposal Date *</Label>
-                      <Popover>
-                        <PopoverTrigger asChild>
-                          <Button variant="outline" className="w-full justify-start text-left font-normal">
-                            <CalendarIcon className="mr-2 h-4 w-4" />
-                            {format(disposalDate, "PPP")}
-                          </Button>
-                        </PopoverTrigger>
-                        <PopoverContent className="w-auto p-0" align="start">
-                          <Calendar mode="single" selected={disposalDate} onSelect={(d) => d && setDisposalDate(d)} />
-                        </PopoverContent>
-                      </Popover>
-                    </div>
-                    <div className="space-y-2 sm:col-span-2">
-                      <Label>Disposal Location</Label>
-                      <Input
-                        value={disposalLocation}
-                        onChange={(e) => setDisposalLocation(e.target.value)}
-                        placeholder="Specific area, facility, or coordinates..."
-                      />
-                    </div>
-                    <div className="space-y-2 sm:col-span-2">
-                      <Label>Witness (if applicable)</Label>
-                      <Input
-                        value={disposalWitness}
-                        onChange={(e) => setDisposalWitness(e.target.value)}
-                        placeholder="Name of person who witnessed disposal"
-                      />
-                    </div>
-                  </div>
-
-                  <div className="p-4 border-2 border-dashed rounded-lg">
-                    <Label className="block mb-2">Upload Disposal Certificate (Optional)</Label>
-                    <Input
-                      type="file"
-                      accept=".pdf,.jpg,.jpeg,.png"
-                      onChange={(e) => setDisposalCertificate(e.target.files?.[0] || null)}
-                    />
-                    <p className="text-xs text-muted-foreground mt-2">
-                      Upload certificate from rendering service, landfill, or other disposal facility.
-                    </p>
-                  </div>
-
-                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
-                    <p className="text-sm font-bold text-green-500">Compliance Note</p>
-                    <p className="text-xs text-green-500/80 mt-1">
-                      Proper disposal documentation is required for regulatory compliance and audit trails.
-                    </p>
-                  </div>
-                </>
-              )}
-            </CardContent>
-          </Card>
+          <StepDisposal
+            canFillDisposal={canFillDisposal}
+            disposalMethod={disposalMethod}
+            setDisposalMethod={setDisposalMethod}
+            disposalDate={disposalDate}
+            setDisposalDate={(d) => d && setDisposalDate(d)}
+            disposalLocation={disposalLocation}
+            setDisposalLocation={setDisposalLocation}
+            disposalWitness={disposalWitness}
+            setDisposalWitness={setDisposalWitness}
+            setDisposalCertificate={setDisposalCertificate}
+          />
         )}
 
         {/* STEP 5: Review & Submit (Visible to: staff, caretaker, owner, admin) */}
         {currentStep === "review" && (
-          <Card className="border-border/50 shadow-lg">
-            <CardHeader>
-              <CardTitle className="text-2xl">Review & Submit</CardTitle>
-              <CardDescription>
-                {canReviewSubmit
-                  ? "Review all information before final submission."
-                  : "You do not have permission to submit death cases."
-                }
-              </CardDescription>
-            </CardHeader>
-            <CardContent className="space-y-6">
-              {!canReviewSubmit ? (
-                <div className="p-8 text-center">
-                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
-                  <h3 className="font-semibold mb-2">Permission Required</h3>
-                  <p className="text-muted-foreground">
-                    This section requires staff, caretaker, owner, or admin privileges.
-                  </p>
-                </div>
-              ) : (
-                <>
-                  <div className="space-y-4">
-                    <div className="grid sm:grid-cols-2 gap-6">
-                      <div>
-                        <h4 className="font-semibold mb-3">Animal Details</h4>
-                        <div className="space-y-2 text-sm">
-                          <p><span className="text-muted-foreground">Name:</span> {selectedAnimalData?.name}</p>
-                          <p><span className="text-muted-foreground">Tag:</span> {selectedAnimalData?.tagNumber}</p>
-                          <p><span className="text-muted-foreground">Type:</span> {selectedAnimalData?.animalType}</p>
-                        </div>
-                      </div>
-                      <div>
-                        <h4 className="font-semibold mb-3">Death Event</h4>
-                        <div className="space-y-2 text-sm">
-                          <p><span className="text-muted-foreground">Date:</span> {format(dateOfDeath, "PPP")}</p>
-                          <p><span className="text-muted-foreground">Location:</span> {placeOfDeath}</p>
-                          <p><span className="text-muted-foreground">Reported Cause:</span> {reportedCause}</p>
-                        </div>
-                      </div>
-                    </div>
-
-                    {vetRequired && (
-                      <div className="border-t pt-4">
-                        <h4 className="font-semibold mb-3">Veterinary Information</h4>
-                        <div className="space-y-2 text-sm">
-                          <p><span className="text-muted-foreground">Status:</span> {assignedVetId ? "Vet Assigned" : "Vet Requested"}</p>
-                          {vetRequestReason && (
-                            <p><span className="text-muted-foreground">Reason:</span> {vetRequestReason}</p>
-                          )}
-                        </div>
-                      </div>
-                    )}
-
-                    <div className="border-t pt-4">
-                      <h4 className="font-semibold mb-3">Disposal Information</h4>
-                      <div className="space-y-2 text-sm">
-                        <p><span className="text-muted-foreground">Method:</span> {disposalMethod || "Not specified"}</p>
-                        <p><span className="text-muted-foreground">Date:</span> {disposalDate ? format(disposalDate, "PPP") : "Not specified"}</p>
-                        <p><span className="text-muted-foreground">Location:</span> {disposalLocation || "Not specified"}</p>
-                      </div>
-                    </div>
-                  </div>
-
-                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
-                    <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
-                    <p className="text-sm text-amber-500">
-                      After submission, this case will be sent for manager review and become read-only. 
-                      Any further changes will require a formal correction request.
-                    </p>
-                  </div>
-                </>
-              )}
-            </CardContent>
-          </Card>
+          <StepReview
+            canReviewSubmit={canReviewSubmit}
+            selectedAnimalData={selectedAnimalData}
+            dateOfDeath={dateOfDeath}
+            placeOfDeath={placeOfDeath}
+            reportedCause={reportedCause}
+            vetRequired={vetRequired}
+            assignedVetId={assignedVetId}
+            vetRequestReason={vetRequestReason}
+            disposalMethod={disposalMethod}
+            disposalDate={disposalDate}
+            disposalLocation={disposalLocation}
+          />
         )}
 
         {/* Navigation Buttons */}
