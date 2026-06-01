// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { generateCaseNumber } from "@/data/mockDeathCases";
// import { searchAnimals } from "@/api/searchAnimals";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import {
//   ArrowLeft,
//   Calendar as CalendarIcon,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   Clock,
//   ArrowRight,
//   ShieldCheck,
//   ClipboardList,
//   Check,
//   Search
// } from "lucide-react";
// import { Switch } from "@/components/ui/switch";
// import { toast } from "@/hooks/use-toast";
// import { Badge } from "@/components/ui/badge";
// import { fetchUser } from "@/utils/fetchUser";
// import { User } from "@/interface";
// import { UserRole } from "@/types/deathCase";
// import { fetchAnimalAbstractData } from "@/utils/fetchAnimalAbstractData";

// type Step = "identify" | "basic" | "decision" | "vet" | "disposal" | "review";

// export default function NewDeathCase() {
//   const navigate = useNavigate();
//   const { animalId: routeAnimalId } = useParams();
  
//   // Workflow state
//   const [user, setUser] = useState<User | null>(null);
//   const [role, setRole] = useState<UserRole | null>(null);
//   const [currentStep, setCurrentStep] = useState<Step>(routeAnimalId ? "basic" : "identify");
//   const [isVetRequired, setIsVetRequired] = useState<boolean | null>(null);
//   const [lastSaved, setLastSaved] = useState<number>(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isAnimalConfirmed, setIsAnimalConfirmed] = useState(!!routeAnimalId);
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // Form state
//   const [selectedAnimal, setSelectedAnimal] = useState<string>(routeAnimalId || "");
//   const [dateOfDeath, setDateOfDeath] = useState<Date>(new Date());
//   const [timeOfDeath, setTimeOfDeath] = useState("");
//   const [placeOfDeath, setPlaceOfDeath] = useState("");
//   const [notes, setNotes] = useState("");
  
//   // Vet state
//   const [causeOfDeath, setCauseOfDeath] = useState("");
//   const [vetFindings, setVetFindings] = useState("");
//   const [necropsyPerformed, setNecropsyPerformed] = useState(false);
  
//   // Disposal state
//   const [disposalMethod, setDisposalMethod] = useState("");
//   const [disposalDate, setDisposalDate] = useState<Date>(new Date());
//   const [disposalLocation, setDisposalLocation] = useState("");

//   const [selectedAnimalData, setSelectedAnimalData] = useState<any>(null);
//   const caseNumber = generateCaseNumber();

//   useEffect(() => {
//     try{
//       const init = async() => {
//         const userData = await fetchUser();
//         setUser(userData);
//         setRole(userData?.role ?? null);

//         if (routeAnimalId) {
//           try {
//             const animalData = await fetchAnimalAbstractData(routeAnimalId);
//             console.log('---------animalData', animalData);
//             setSelectedAnimal(routeAnimalId);
//             setSelectedAnimalData(animalData || null);
//             setIsAnimalConfirmed(true);
//           } catch (err) {
//             console.error('Failed to load animal data for routeAnimalId', routeAnimalId, err);
//           }
//         }
//       };

//       init();
//     }
//     catch(error) {
//       console.log('Error in fetching user', error);
//       throw error;
//     }
//   }, [routeAnimalId, navigate])
//   // Search animals when query changes
//   useEffect(() => {
//     const searchForAnimals = async () => {
//       if (searchQuery.length < 2) {
//         setSearchResults([]);
//         return;
//       }

//       setIsSearching(true);
//       try {
//         const results = await searchAnimals(searchQuery);
//         setSearchResults(results);
//       } catch (error) {
//         console.error('Error searching animals:', error);
//         setSearchResults([]);
//       } finally {
//         setIsSearching(false);
//       }
//     };

//     const timeoutId = setTimeout(searchForAnimals, 300); // Debounce search
//     return () => clearTimeout(timeoutId);
//   }, [searchQuery]);

//   // Auto-save simulation
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setLastSaved(0);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleNext = () => {
//     if (currentStep === "identify") {
//       setCurrentStep("basic");
//       setIsAnimalConfirmed(true);
//     } else if (currentStep === "basic") {
//       setCurrentStep("decision");
//     } else if (currentStep === "decision") {
//       if (isVetRequired) setCurrentStep("vet");
//       else setCurrentStep("disposal");
//     } else if (currentStep === "vet") {
//       setCurrentStep("disposal");
//     } else if (currentStep === "disposal") {
//       setCurrentStep("review");
//     }
//   };

//   const handleBack = () => {
//     if (currentStep === "basic") {
//       if (!routeAnimalId) {
//         setCurrentStep("identify");
//         setIsAnimalConfirmed(false);
//       }
//     } else if (currentStep === "decision") setCurrentStep("basic");
//     else if (currentStep === "vet") setCurrentStep("decision");
//     else if (currentStep === "disposal") {
//       if (isVetRequired) setCurrentStep("vet");
//       else setCurrentStep("decision");
//     }
//     else if (currentStep === "review") setCurrentStep("disposal");
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     await new Promise((r) => setTimeout(r, 1500));
//     setIsSubmitting(false);
//     toast({
//       title: "Death case submitted",
//       description: `Case ${caseNumber} has been finalized and submitted for approval.`,
//     });
//     navigate("/compliance/death-cases");
//   };

//   const steps = [
//     { id: "identify", label: "Identify Animal", active: currentStep === "identify", completed: isAnimalConfirmed || ["basic", "decision", "vet", "disposal", "review"].includes(currentStep) },
//     { id: "basic", label: "Basic Info", active: currentStep === "basic", completed: ["decision", "vet", "disposal", "review"].includes(currentStep) },
//     { id: "vet", label: "Vet Review", active: currentStep === "vet", completed: ["disposal", "review"].includes(currentStep), disabled: !isVetRequired && currentStep !== "vet" },
//     { id: "disposal", label: "Disposal", active: currentStep === "disposal", completed: currentStep === "review" },
//     { id: "review", label: "Review & Submit", active: currentStep === "review", completed: false },
//   ];

//   return (
//     <div className="min-h-screen bg-background text-foreground dark">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-card border-b">
//         <div className="container max-w-4xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Button variant="ghost" size="icon" onClick={() => navigate("/compliance/death-cases")}>
//                 <ArrowLeft className="w-5 h-5" />
//               </Button>
//               <div>
//                 <h1 className="text-xl font-bold">Create Death Case</h1>
//                 <p className="text-sm text-muted-foreground">
//                   {currentStep === "identify" ? "Start by identifying the animal involved" : `Guided workflow • Case #${caseNumber}`}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4 text-xs text-muted-foreground">
//               <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Auto-saved</span>
//               <span>Last saved: {lastSaved}s ago</span>
//             </div>
//           </div>
//           {currentStep === "identify" && (
//             <div className="mt-2">
//               <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit">
//                 <ShieldCheck className="w-3 h-3" />
//                 This information helps ensure accurate records and compliance.
//               </Badge>
//             </div>
//           )}
//         </div>
//       </header>

//       <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
//         {/* Progress Bar */}
//         <div className="flex items-center justify-between px-2">
//           {steps.map((step, idx) => (
//             <div key={step.id} className="flex items-center flex-1 last:flex-none">
//               <div className={cn(
//                 "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors",
//                 step.active ? "bg-primary text-primary-foreground" : 
//                 step.completed ? "text-primary" : "text-muted-foreground opacity-50"
//               )}>
//                 <div className={cn(
//                   "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
//                   step.active ? "bg-primary-foreground text-primary border-primary-foreground" :
//                   step.completed ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"
//                 )}>
//                   {step.completed ? <Check className="w-4 h-4" /> : idx}
//                 </div>
//                 <span className="hidden sm:inline">{step.label}</span>
//               </div>
//               {idx < steps.length - 1 && (
//                 <div className="h-px bg-border flex-1 mx-4" />
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="bg-muted/30 border rounded-lg p-2 text-xs flex items-center gap-2 w-fit mx-auto">
//           <ShieldCheck className="w-3 h-3 text-primary" />
//           <span>Viewing as: <span className="font-bold">Caretaker / Staff</span></span>
//           <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 ml-2">DRAFT</span>
//         </div>

//         {/* STEP 0: Identify Animal */}
//         {currentStep === "identify" && (
//           <Card className="border-border/50 shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-2xl">Which animal is this case for?</CardTitle>
//               <CardDescription>Search by tag number or animal name to identify the animal before continuing.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {!selectedAnimalData || !isAnimalConfirmed ? (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="search">Search animal</Label>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                       <Input
//                         id="search"
//                         placeholder="Enter tag number or animal name (e.g. SV-011 or Clover)"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="pl-10"
//                       />
//                     </div>
//                   </div>

//                   {searchQuery.length >= 2 && (
//                     <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
//                       {isSearching ? (
//                         <div className="p-8 text-center">
//                           <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
//                           <p className="text-muted-foreground">Searching animals...</p>
//                         </div>
//                       ) : (
//                         searchResults.map((animal) => {
//                         const isDeceased = animal.status === "deceased";
//                         const isSold = animal.status === "sold";
//                         const isDisabled = isDeceased;
                        
//                         return (
//                           <div 
//                             key={animal._id}
//                             className={cn(
//                               "p-4 flex items-center justify-between transition-colors",
//                               isDisabled ? "opacity-50 cursor-not-allowed bg-muted/20" : "hover:bg-muted/50 cursor-pointer",
//                               selectedAnimal === animal._id && !isDisabled && "bg-primary/5 border-primary/20"
//                             )}
//                             onClick={() => !isDisabled && (setSelectedAnimal(animal._id), setSelectedAnimalData(animal))}
//                           >
//                             <div className="flex-1">
//                               <div className="flex items-center gap-2">
//                                 <p className="font-bold">{animal.name}</p>
//                                 <span className="text-muted-foreground text-xs">— {animal.tagNumber}</span>
//                               </div>
//                               <p className="text-sm text-muted-foreground">{animal.animalType} • {animal.breed}</p>
//                               <p className="text-xs text-muted-foreground/70">{animal.status}</p>
//                             </div>
//                             <div className="flex flex-col items-end gap-2">
//                               <Badge 
//                                 variant={isDeceased ? "destructive" : isSold ? "outline" : "secondary"}
//                                 className={cn(
//                                   isDeceased && "bg-red-500/10 text-red-500 border-red-500/20",
//                                   isSold && "bg-amber-500/10 text-amber-500 border-amber-500/20"
//                                 )}
//                               >
//                                 {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
//                               </Badge>
//                               {isDeceased && (
//                                 <span className="text-[10px] text-destructive">A death record already exists</span>
//                               )}
//                               {isSold && (
//                                 <span className="text-[10px] text-amber-500">Animal is marked as sold</span>
//                               )}
//                             </div>
//                           </div>
//                         );
//                         })
//                       )}
//                       {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
//                         <div className="p-8 text-center text-muted-foreground italic">
//                           No animals found matching "{searchQuery}"
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {selectedAnimalData && !isAnimalConfirmed && (
//                     <div className="mt-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
//                       <p className="text-sm font-bold text-primary uppercase tracking-wider">You are creating a death case for:</p>
//                       <div className="flex items-center gap-4">
//                         <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
//                           {selectedAnimalData.name.charAt(0)}
//                         </div>
//                         <div>
//                           <p className="font-bold text-xl">{selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
//                           <p className="text-muted-foreground">{selectedAnimalData.animalType} • {selectedAnimalData.breed}</p>
//                           <p className="text-sm text-muted-foreground">{selectedAnimalData.status}</p>
//                         </div>
//                       </div>
//                       <div className="flex gap-3 pt-2">
//                         <Button variant="outline" onClick={() => setSelectedAnimal("")} className="flex-1">Change Animal</Button>
//                         <Button onClick={handleNext} className="flex-1">Confirm & Continue</Button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : null}
//             </CardContent>
//           </Card>
//         )}

//         {/* STEP 1: Basic Info */}
//         {currentStep === "basic" && (
//           <Card className="border-border/50 shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-2xl">What happened?</CardTitle>
//               <CardDescription>Provide basic details about the event.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {selectedAnimalData && (
//                 <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
//                       {selectedAnimalData.name.charAt(0)}
//                     </div>
//                     <div>
//                       <p className="font-bold text-lg">{selectedAnimalData.name}</p>
//                       <p className="text-sm text-muted-foreground">Tag: {selectedAnimalData.tagNumber} • {selectedAnimalData.animalType}</p>
//                     </div>
//                   </div>
//                   {!routeAnimalId && (
//                     <Button variant="ghost" size="sm" onClick={() => { setCurrentStep("identify"); setIsAnimalConfirmed(false); }} className="text-xs text-muted-foreground hover:text-primary">
//                       Change Animal
//                     </Button>
//                   )}
//                 </div>
//               )}

//               <div className="grid gap-6 sm:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Date of Death (Required)</Label>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant="outline" className="w-full justify-start text-left font-normal">
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {dateOfDeath ? format(dateOfDeath, "PPP") : "Select date"}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar mode="single" selected={dateOfDeath} onSelect={(d) => d && setDateOfDeath(d)} />
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Approximate Time (Optional)</Label>
//                   <Input type="time" value={timeOfDeath} onChange={(e) => setTimeOfDeath(e.target.value)} />
//                 </div>
//                 <div className="space-y-2 sm:col-span-2">
//                   <Label>Location at time of death</Label>
//                   <Input
//                     value={placeOfDeath}
//                     onChange={(e) => setPlaceOfDeath(e.target.value)}
//                     placeholder="Enter location (e.g. Main Barn, Pasture, Clinic...)"
//                   />
//                 </div>
//                 <div className="space-y-2 sm:col-span-2">
//                   <Label>Notes (Optional)</Label>
//                   <Textarea 
//                     placeholder="Anything unusual you noticed..." 
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     className="min-h-[100px]"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* DECISION STEP */}
//         {currentStep === "decision" && (
//           <Card className="border-primary/20 bg-primary/5 shadow-xl">
//             <CardHeader className="text-center pb-2">
//               <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
//                 <ShieldCheck className="w-6 h-6 text-primary" />
//               </div>
//               <CardTitle className="text-2xl">Veterinary Review</CardTitle>
//               <CardDescription>Was a veterinarian required or involved in this case?</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4 p-8">
//               <Button 
//                 variant={isVetRequired === true ? "default" : "outline"}
//                 className="h-20 text-lg gap-4 justify-start px-8"
//                 onClick={() => setIsVetRequired(true)}
//               >
//                 <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0">
//                   {isVetRequired === true && <div className="w-4 h-4 rounded-full bg-current" />}
//                 </div>
//                 <div className="text-left">
//                   <p className="font-bold">Yes, vet confirmation needed</p>
//                   <p className="text-xs opacity-70">Requires official signature and medical cause of death</p>
//                 </div>
//               </Button>
//               <Button 
//                 variant={isVetRequired === false ? "default" : "outline"}
//                 className="h-20 text-lg gap-4 justify-start px-8"
//                 onClick={() => setIsVetRequired(false)}
//               >
//                 <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0">
//                   {isVetRequired === false && <div className="w-4 h-4 rounded-full bg-current" />}
//                 </div>
//                 <div className="text-left">
//                   <p className="font-bold">No, not required</p>
//                   <p className="text-xs opacity-70">Directly proceed to disposal documentation</p>
//                 </div>
//               </Button>
//             </CardContent>
//           </Card>
//         )}

//         {/* STEP 2: Vet Review */}
//         {currentStep === "vet" && (
//           <Card className="border-border/50 shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-2xl">Veterinary Confirmation</CardTitle>
//               <CardDescription>Medical assessment of the mortality case.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
//                 <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
//                 <div>
//                   <p className="font-bold text-amber-500">Awaiting vet confirmation</p>
//                   <p className="text-sm opacity-80">This section must be completed by an authorized veterinarian.</p>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Cause of Death</Label>
//                 <Input placeholder="Enter medical cause..." value={causeOfDeath} onChange={(e) => setCauseOfDeath(e.target.value)} />
//               </div>

//               <div className="space-y-2">
//                 <Label>Findings & Observations</Label>
//                 <Textarea placeholder="Medical findings..." value={vetFindings} onChange={(e) => setVetFindings(e.target.value)} />
//               </div>

//               <div className="flex items-center justify-between p-4 border rounded-lg">
//                 <div className="space-y-0.5">
//                   <Label>Necropsy Performed</Label>
//                   <p className="text-xs text-muted-foreground">Was a post-mortem examination conducted?</p>
//                 </div>
//                 <Switch
//                   checked={necropsyPerformed}
//                   onCheckedChange={setNecropsyPerformed}
//                 />
//               </div>

//               {necropsyPerformed && (
//                 <div className="space-y-2">
//                   <Label>Necropsy Report</Label>
//                   <Input 
//                     type="file"
//                     accept=".pdf,.doc,.doc,.jpg,.jpeg,.png"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (file) {
//                         console.log('Necropsy report selected:', file.name);
//                         // TODO: Handle file upload
//                       }
//                     }}
//                     placeholder="Upload necropsy report..."
//                     className="cursor-pointer hover:bg-muted/50 transition-colors"
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         {/* STEP 3: Disposal */}
//         {currentStep === "disposal" && (
//           <Card className="border-border/50 shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-2xl">Disposal Information</CardTitle>
//               <CardDescription>Document how the remains were handled for compliance.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid gap-6 sm:grid-cols-2">
//                 <div className="space-y-2 sm:col-span-2">
//                   <Label>Disposal Method</Label>
//                   <Select value={disposalMethod} onValueChange={setDisposalMethod}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select method..." />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="burial">On-site Burial</SelectItem>
//                       <SelectItem value="incineration">Incineration</SelectItem>
//                       <SelectItem value="rendering">Rendering Service</SelectItem>
//                       <SelectItem value="compost">Composting</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Disposal Date</Label>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant="outline" className="w-full justify-start text-left font-normal">
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {disposalDate ? format(disposalDate, "PPP") : "Select date"}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar mode="single" selected={disposalDate} onSelect={(d) => d && setDisposalDate(d)} />
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Disposal Location</Label>
//                   <Input value={disposalLocation} onChange={(e) => setDisposalLocation(e.target.value)} placeholder="Specific area or facility..." />
//                 </div>
//               </div>
              
//               <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
//                 <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground" />
//                 <p className="text-sm font-medium">Upload Disposal Certificate (Optional)</p>
//                 <p className="text-xs text-muted-foreground">PDF, JPG or PNG up to 5MB</p>
//                 <Button variant="outline" size="sm" className="mt-2">Browse Files</Button>
//               </div>
//               <p className="text-xs text-muted-foreground text-center italic">This helps with compliance and future audits.</p>
//             </CardContent>
//           </Card>
//         )}

//         {/* STEP 4: Review */}
//         {currentStep === "review" && (
//           <div className="space-y-6">
//             <Card className="border-primary/20 shadow-xl overflow-hidden">
//               <CardHeader className="bg-primary/5">
//                 <CardTitle className="text-xl">Case Summary</CardTitle>
//                 <CardDescription>Review all information before final submission.</CardDescription>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <div className="divide-y">
//                   <div className="p-6 grid sm:grid-cols-2 gap-8">
//                     <div className="space-y-4">
//                       <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Animal Details</h4>
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center font-bold text-primary">
//                           {selectedAnimalData?.name.charAt(0)}
//                         </div>
//                         <div>
//                           <p className="font-bold">{selectedAnimalData?.name}</p>
//                           <p className="text-xs text-muted-foreground">#{selectedAnimalData?.tagNumber}</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Death Details</h4>
//                       <div className="text-sm space-y-1">
//                         <p><span className="text-muted-foreground">Date:</span> {dateOfDeath ? format(dateOfDeath, "PPP") : "N/A"}</p>
//                         <p><span className="text-muted-foreground">Location:</span> {placeOfDeath || "Not specified"}</p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="p-6">
//                     <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Compliance Path</h4>
//                     <div className="flex items-center gap-3 p-4 rounded bg-muted/50 border">
//                       <ShieldCheck className="w-5 h-5 text-primary" />
//                       <div>
//                         <p className="text-sm font-bold">{isVetRequired ? "Veterinarian Review Required" : "Standard Management Path"}</p>
//                         <p className="text-xs text-muted-foreground">{isVetRequired ? "Case remains pending until vet signature" : "Direct compliance approval"}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Disposal Summary</h4>
//                     <div className="text-sm space-y-1">
//                       <p><span className="text-muted-foreground">Method:</span> {disposalMethod || "N/A"}</p>
//                       <p><span className="text-muted-foreground">Location:</span> {disposalLocation || "N/A"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
//               <p className="text-sm text-amber-500">After submission, this case will become read-only. Further changes will require a correction request.</p>
//             </div>
//           </div>
//         )}

//         {/* Footer Actions */}
//         <div className="flex items-center justify-between pt-8 border-t">
//           <Button 
//             variant="outline" 
//             onClick={handleBack} 
//             disabled={currentStep === "identify"}
//             className="gap-2"
//           >
//             Back
//           </Button>
          
//           <div className="flex items-center gap-4">
//             <p className="text-xs text-muted-foreground hidden sm:block italic">All progress is auto-saved</p>
//             {currentStep === "review" ? (
//               <Button 
//                 onClick={handleSubmit} 
//                 disabled={isSubmitting}
//                 className="gap-2 px-8 bg-primary hover:bg-primary/90"
//               >
//                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
//                 Submit for Approval
//               </Button>
//             ) : (
//               <Button 
//                 onClick={handleNext} 
//                 disabled={
//                   (currentStep === "identify" && (!selectedAnimal || !isAnimalConfirmed)) ||
//                   (currentStep === "decision" && isVetRequired === null)
//                 }
//                 className="gap-2 px-8"
//               >
//                 Continue
//                 <ArrowRight className="w-4 h-4" />
//               </Button>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generateCaseNumber } from "@/data/mockDeathCases";
import { searchAnimals } from "@/api/searchAnimals";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Check,
  Search,
  User,
  Stethoscope,
  Trash2,
  FileCheck
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { fetchUser } from "@/utils/fetchUser";
import { User as UserType } from "@/interface";
import { UserRole, WorkflowStatus } from "@/types/deathCase";
import { fetchAnimalAbstractData } from "@/utils/fetchAnimalAbstractData";
import { DeathCaseAPI } from "@/api/deathCases";

// Define workflow steps based on role
type Step = "report" | "request-vet" | "vet-confirmation" | "disposal" | "review";

// Role permissions mapping
const ROLE_PERMISSIONS = {
  // Who can report death
  canReportDeath: ["owner", "staff", "caretaker", "admin"],
  
  // Who can request vet confirmation
  canRequestVet: ["owner", "staff", "admin"], // NOT caretaker
  
  // Who can fill vet section
  canFillVetSection: ["veterinarian", "admin"],
  
  // Who can fill disposal
  canFillDisposal: ["staff", "caretaker", "owner", "admin"],
  
  // Who can review and submit
  canReviewSubmit: ["staff", "caretaker", "owner", "admin"],
};

export default function NewDeathCase() {
  const navigate = useNavigate();
  const { animalId: routeAnimalId } = useParams();
  
  // User and role state
  const [user, setUser] = useState<UserType | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("report");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Animal selection
  const [selectedAnimal, setSelectedAnimal] = useState<string>(routeAnimalId || "");
  const [selectedAnimalData, setSelectedAnimalData] = useState<any>(null);
  const [isAnimalConfirmed, setIsAnimalConfirmed] = useState(!!routeAnimalId);
  
  // Form state - Death Event (Step 1)
  const [dateOfDeath, setDateOfDeath] = useState<Date>(new Date());
  const [timeOfDeath, setTimeOfDeath] = useState("");
  const [placeOfDeath, setPlaceOfDeath] = useState("");
  const [reportedCause, setReportedCause] = useState("");
  const [circumstances, setCircumstances] = useState("");
  const [witnesses, setWitnesses] = useState<string[]>([]);
  const [witnessInput, setWitnessInput] = useState("");
  
  // Vet Request state (Step 2)
  const [vetRequired, setVetRequired] = useState<boolean>(false);
  const [vetRequestReason, setVetRequestReason] = useState("");
  const [assignedVetId, setAssignedVetId] = useState<string>("");
  const [availableVets, setAvailableVets] = useState<any[]>([]);
  
  // Vet Confirmation state (Step 3)
  const [confirmedCause, setConfirmedCause] = useState("");
  const [confirmedCauseDetails, setConfirmedCauseDetails] = useState("");
  const [necropsyRequired, setNecropsyRequired] = useState(false);
  const [necropsyPerformed, setNecropsyPerformed] = useState(false);
  const [necropsyFindings, setNecropsyFindings] = useState("");
  const [necropsyFiles, setNecropsyFiles] = useState<File[]>([]);
  const [vetNotes, setVetNotes] = useState("");
  
  // Disposal state (Step 4)
  const [disposalMethod, setDisposalMethod] = useState("");
  const [disposalDate, setDisposalDate] = useState<Date>(new Date());
  const [disposalLocation, setDisposalLocation] = useState("");
  const [disposalCertificate, setDisposalCertificate] = useState<File | null>(null);
  const [disposalWitness, setDisposalWitness] = useState("");
  
  // Case metadata
  const [caseNumber, setCaseNumber] = useState(generateCaseNumber());
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("draft");
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await fetchUser();
        setUser(userData);
        setRole(userData?.role ?? null);
        
        // If animalId is provided in route, fetch animal data
        if (routeAnimalId) {
          const animalData = await fetchAnimalAbstractData(routeAnimalId);
          setSelectedAnimal(routeAnimalId);
          setSelectedAnimalData(animalData || null);
          setIsAnimalConfirmed(true);
        }
        
        // Fetch available vets if user has permission
        if (userData?.role && ROLE_PERMISSIONS.canRequestVet.includes(userData.role)) {
          fetchAvailableVets();
        }
      } catch (error) {
        console.error('Error initializing:', error);
        toast({
          title: "Error",
          description: "Failed to initialize death case form",
          variant: "destructive",
        });
      }
    };

    init();
  }, [routeAnimalId]);

  // Search animals when query changes
  useEffect(() => {
    const searchForAnimals = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchAnimals(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching animals:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchForAnimals, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchAvailableVets = async () => {
    try {
      // This should be an API call to fetch veterinarians
      // For now, mock data
      const mockVets = [
        { id: "vet1", name: "Dr. Jane Smith", specialty: "Large Animal" },
        { id: "vet2", name: "Dr. John Doe", specialty: "Small Animal" },
        { id: "vet3", name: "Dr. Sarah Johnson", specialty: "Poultry" },
      ];
      setAvailableVets(mockVets);
    } catch (error) {
      console.error('Error fetching vets:', error);
    }
  };

  // Check role permissions
  const canReportDeath = role && ROLE_PERMISSIONS.canReportDeath.includes(role);
  const canRequestVet = role && ROLE_PERMISSIONS.canRequestVet.includes(role);
  const canFillVetSection = role && ROLE_PERMISSIONS.canFillVetSection.includes(role);
  const canFillDisposal = role && ROLE_PERMISSIONS.canFillDisposal.includes(role);
  const canReviewSubmit = role && ROLE_PERMISSIONS.canReviewSubmit.includes(role);

  // Determine available steps based on role
  const getAvailableSteps = (): Step[] => {
    const steps: Step[] = ["report"];
    
    // Add vet request step only if user can request vet
    if (canRequestVet) {
      steps.push("request-vet");
    }
    
    // Add vet confirmation step only if user can fill vet section
    if (canFillVetSection) {
      steps.push("vet-confirmation");
    }
    
    // Add disposal step if user can fill disposal
    if (canFillDisposal) {
      steps.push("disposal");
    }
    
    // Add review step if user can review/submit
    if (canReviewSubmit) {
      steps.push("review");
    }
    
    return steps;
  };

  const availableSteps = getAvailableSteps();

  // Helper function to map place of death to correct type
  const mapPlaceOfDeath = (place: string): "barn" | "field" | "clinic" | "hospital" | "transport" | "unknown" => {
    const normalizedPlace = place.toLowerCase().trim();
    switch (normalizedPlace) {
      case "barn":
      case "main barn":
      case "shed":
        return "barn";
      case "field":
      case "pasture":
      case "paddock":
        return "field";
      case "clinic":
      case "vet clinic":
      case "hospital":
      case "vet hospital":
        return "clinic";
      case "transport":
      case "transit":
      case "moving":
        return "transport";
      default:
        return "unknown";
    }
  };

  // Save draft function
  const saveDraft = async () => {
    if (!selectedAnimalData || !role) return;
    
    setIsSavingDraft(true);
    try {
      const draftData = {
        animalId: selectedAnimal,
        caseNumber,
        workflowStatus: "draft" as WorkflowStatus,
        snapshot: {
          id: selectedAnimal,
          name: selectedAnimalData.name,
          tagNumber: selectedAnimalData.tagNumber,
          species: selectedAnimalData.animalType,
          breed: selectedAnimalData.breed,
          gender: selectedAnimalData.gender || "male" as const,
          farmId: selectedAnimalData.farmId,
          farmName: selectedAnimalData.farmName,
        },
        eventInfo: {
          dateOfDeath: dateOfDeath.toISOString(),
          timeOfDeath: timeOfDeath || undefined,
          placeOfDeath: mapPlaceOfDeath(placeOfDeath),
          reportedCause: reportedCause || "unknown",
          discoveredBy: user?.fullName || "Unknown",
          discoveredById: user?.id || "unknown",
          circumstances: circumstances || undefined,
          witnesses: witnesses.length > 0 ? witnesses : undefined,
        },
        // Only include if set
        ...(vetRequired && { assignedVetId }),
        ...(vetRequestReason && { vetRequestReason }),
      };

      let response;
      if (caseId) {
        // Update existing draft - use updateEventInfo for event info
        response = await DeathCaseAPI.updateEventInfo(caseId, draftData);
      } else {
        // Create new draft
        response = await DeathCaseAPI.createForAnimal(selectedAnimal, draftData);
        setCaseId(response.data.id);
      }

      toast({
        title: "Draft saved",
        description: "Your progress has been saved as a draft.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit death report (initial submission)
  const submitDeathReport = async () => {
    if (!selectedAnimalData || !user) return;
    
    setIsSubmitting(true);
    try {
      const reportData = {
        animalId: selectedAnimal,
        caseNumber,
        workflowStatus: "reported" as WorkflowStatus,
        snapshot: {
          id: selectedAnimal,
          name: selectedAnimalData.name,
          tagNumber: selectedAnimalData.tagNumber,
          species: selectedAnimalData.animalType,
          breed: selectedAnimalData.breed,
          gender: selectedAnimalData.gender || "male" as const,
          farmId: selectedAnimalData.farmId,
          farmName: selectedAnimalData.farmName,
        },
        eventInfo: {
          dateOfDeath: dateOfDeath.toISOString(),
          timeOfDeath: timeOfDeath || undefined,
          placeOfDeath: mapPlaceOfDeath(placeOfDeath),
          reportedCause: reportedCause || "unknown",
          discoveredBy: user.fullName,
          discoveredById: user.id,
          circumstances: circumstances || undefined,
          witnesses: witnesses.length > 0 ? witnesses : undefined,
        },
      };

      let response;
      if (caseId) {
        // Update existing case to reported status - use updateEventInfo
        response = await DeathCaseAPI.updateEventInfo(caseId, {
          ...reportData,
          workflowStatus: "reported",
        });
      } else {
        // Create new case and mark as reported
        response = await DeathCaseAPI.createForAnimal(selectedAnimal, reportData);
        setCaseId(response.data.id);
        // Submit the report
        await DeathCaseAPI.submitReport(response.data.id);
      }

      setWorkflowStatus("reported");
      
      // Move to next step based on role
      if (canRequestVet && availableSteps.includes("request-vet")) {
        setCurrentStep("request-vet");
      } else if (canFillDisposal && availableSteps.includes("disposal")) {
        setCurrentStep("disposal");
      } else if (canReviewSubmit && availableSteps.includes("review")) {
        setCurrentStep("review");
      }

      toast({
        title: "Death reported",
        description: `Case ${caseNumber} has been reported successfully.`,
      });
    } catch (error) {
      console.error('Error submitting death report:', error);
      toast({
        title: "Error",
        description: "Failed to submit death report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request vet confirmation
  const requestVetConfirmation = async () => {
    if (!caseId || !assignedVetId) return;
    
    setIsSubmitting(true);
    try {
      await DeathCaseAPI.requestVet(caseId, assignedVetId);
      setWorkflowStatus("vet_requested");
      
      toast({
        title: "Vet requested",
        description: "A veterinarian has been requested to confirm the cause of death.",
      });
      
      // Navigate back to death cases list
      navigate("/compliance/death-cases");
    } catch (error) {
      console.error('Error requesting vet:', error);
      toast({
        title: "Error",
        description: "Failed to request veterinarian confirmation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vet confirmation submission
  const submitVetConfirmation = async () => {
    if (!caseId || !user) return;
    
    setIsSubmitting(true);
    try {
      const vetData = {
        confirmedBy: user.fullName,
        confirmedById: user.id,
        confirmedAt: new Date().toISOString(),
        confirmedCause,
        confirmedCauseDetails,
        necropsyRequired,
        necropsyPerformed,
        necropsyFindings: necropsyPerformed ? necropsyFindings : undefined,
        additionalNotes: vetNotes,
      };

      await DeathCaseAPI.vetConfirm(caseId, vetData);
      setWorkflowStatus("vet_confirmed");
      
      // Upload necropsy files if any
      if (necropsyFiles.length > 0) {
        for (const file of necropsyFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'necropsy_report');
          formData.append('section', 'vet');
          
          await DeathCaseAPI.addAttachment(caseId, formData);
        }
      }

      toast({
        title: "Vet confirmation submitted",
        description: "Veterinary confirmation has been recorded.",
      });
      
      // Move to disposal step
      if (availableSteps.includes("disposal")) {
        setCurrentStep("disposal");
      } else {
        navigate("/compliance/death-cases");
      }
    } catch (error) {
      console.error('Error submitting vet confirmation:', error);
      toast({
        title: "Error",
        description: "Failed to submit veterinary confirmation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle disposal submission
  const submitDisposal = async () => {
    if (!caseId || !user) return;
    
    setIsSubmitting(true);
    try {
      const disposalData = {
        method: disposalMethod,
        date: disposalDate.toISOString(),
        location: disposalLocation || undefined,
        handledBy: user.fullName,
        handledById: user.id,
        witnessedBy: disposalWitness || undefined,
      };

      await DeathCaseAPI.updateDisposalInfo(caseId, disposalData);
      setWorkflowStatus("disposal_recorded");
      
      // Upload disposal certificate if provided
      if (disposalCertificate) {
        const formData = new FormData();
        formData.append('file', disposalCertificate);
        formData.append('type', 'disposal_certificate');
        formData.append('section', 'disposal');
        
        await DeathCaseAPI.addAttachment(caseId, formData);
      }

      toast({
        title: "Disposal recorded",
        description: "Disposal information has been saved.",
      });
      
      // Move to review step or submit for review
      if (availableSteps.includes("review")) {
        setCurrentStep("review");
      } else {
        // Submit for manager review
        await DeathCaseAPI.submitForReview(caseId);
        navigate("/compliance/death-cases");
      }
    } catch (error) {
      console.error('Error submitting disposal:', error);
      toast({
        title: "Error",
        description: "Failed to submit disposal information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final submission for review
  const submitForReview = async () => {
    if (!caseId) return;
    
    setIsSubmitting(true);
    try {
      await DeathCaseAPI.submitForReview(caseId);
      setWorkflowStatus("review_pending");
      
      toast({
        title: "Case submitted for review",
        description: `Case ${caseNumber} has been submitted for manager review.`,
      });
      
      navigate("/compliance/death-cases");
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast({
        title: "Error",
        description: "Failed to submit case for review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsConfig = [
    { id: "report", label: "Report Death", icon: FileCheck },
    { id: "request-vet", label: "Request Vet", icon: Stethoscope },
    { id: "vet-confirmation", label: "Vet Confirmation", icon: User },
    { id: "disposal", label: "Disposal", icon: Trash2 },
    { id: "review", label: "Review", icon: CheckCircle2 },
  ];

  // Filter steps based on user role
  const visibleSteps = stepsConfig.filter(step => 
    availableSteps.includes(step.id as Step)
  );

  // Render role-specific instruction
  const renderRoleInstructions = () => {
    if (!role) return null;
    
    const instructions: Record<string, string> = {
      caretaker: "You can report deaths and record disposal information.",
      staff: "You can report deaths, request vet confirmation, record disposal, and submit for review.",
      owner: "You have full access to all death case functions.",
      veterinarian: "You can confirm causes of death and provide veterinary findings.",
      admin: "You have full administrative access to all death case functions.",
    };

    return (
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
        <Badge variant="secondary" className={cn(
          role === "caretaker" && "bg-blue-500/15 text-blue-600",
          role === "owner" && "bg-purple-500/15 text-purple-600",
          role === "veterinarian" && "bg-amber-500/15 text-amber-600",
          role === "admin" && "bg-red-500/15 text-red-600",
        )}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {instructions[role] || "Role permissions loading..."}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/compliance/death-cases")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Create Death Case</h1>
                <p className="text-sm text-muted-foreground">
                  Case #{caseNumber} • {workflowStatus}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={saveDraft}
              disabled={isSavingDraft || !selectedAnimalData}
            >
              {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Role indicator */}
        {renderRoleInstructions()}

        {/* Progress Bar */}
        <div className="flex items-center justify-between px-2">
          {visibleSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = availableSteps.indexOf(currentStep as Step) > availableSteps.indexOf(step.id as Step);
            const isDisabled = !availableSteps.includes(step.id as Step);
            
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : 
                    isCompleted ? "text-primary" : "text-muted-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isDisabled && setCurrentStep(step.id as Step)}
                  disabled={isDisabled}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                    isActive ? "bg-primary-foreground text-primary" :
                    isCompleted ? "bg-primary text-primary-foreground" : "border-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline">{step.label}</span>
                </Button>
                {idx < visibleSteps.length - 1 && (
                  <div className="h-px bg-border flex-1 mx-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Report Death (Visible to: owner, staff, caretaker, admin) */}
        {currentStep === "report" && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Report Animal Death</CardTitle>
              <CardDescription>
                {canReportDeath 
                  ? "Provide initial details about the death event."
                  : "You do not have permission to report deaths. Please contact an administrator."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!canReportDeath ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Permission Required</h3>
                  <p className="text-muted-foreground">
                    Your role ({role}) does not have permission to report deaths.
                  </p>
                </div>
              ) : (
                <>
                  {/* Animal Selection */}
                  {!isAnimalConfirmed ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="search">Search animal</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Enter tag number or animal name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {searchQuery.length >= 2 && (
                        <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                          {isSearching ? (
                            <div className="p-8 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                              <p className="text-muted-foreground">Searching animals...</p>
                            </div>
                          ) : (
                            searchResults.map((animal) => {
                              const isDeceased = animal.status === "deceased";
                              const isSold = animal.status === "sold";
                              const isDisabled = isDeceased || isSold;
                              
                              return (
                                <div 
                                  key={animal._id}
                                  className={cn(
                                    "p-4 flex items-center justify-between transition-colors",
                                    isDisabled ? "opacity-50 cursor-not-allowed bg-muted/20" : "hover:bg-muted/50 cursor-pointer",
                                    selectedAnimal === animal._id && !isDisabled && "bg-primary/5 border-primary/20"
                                  )}
                                  onClick={() => !isDisabled && (setSelectedAnimal(animal._id), setSelectedAnimalData(animal))}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold">{animal.name}</p>
                                      <span className="text-muted-foreground text-xs">— {animal.tagNumber}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{animal.animalType} • {animal.breed}</p>
                                    <p className="text-xs text-muted-foreground/70">{animal.status}</p>
                                  </div>
                                  <Badge 
                                    variant={isDeceased ? "destructive" : isSold ? "outline" : "secondary"}
                                    className={cn(
                                      isDeceased && "bg-red-500/10 text-red-500 border-red-500/20",
                                      isSold && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    )}
                                  >
                                    {animal.status}
                                  </Badge>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {selectedAnimalData && !isAnimalConfirmed && (
                        <div className="mt-6 p-6 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
                          <p className="text-sm font-bold text-primary uppercase">Selected Animal</p>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                              {selectedAnimalData.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-xl">{selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
                              <p className="text-muted-foreground">{selectedAnimalData.animalType} • {selectedAnimalData.breed}</p>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setSelectedAnimal("")} className="flex-1">Change Animal</Button>
                            <Button onClick={() => setIsAnimalConfirmed(true)} className="flex-1">Confirm & Continue</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Selected Animal Display */}
                      {selectedAnimalData && (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                              {selectedAnimalData.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-lg">{selectedAnimalData.name}</p>
                              <p className="text-sm text-muted-foreground">Tag: {selectedAnimalData.tagNumber} • {selectedAnimalData.animalType}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsAnimalConfirmed(false)}
                            className="text-xs text-muted-foreground hover:text-primary"
                          >
                            Change Animal
                          </Button>
                        </div>
                      )}

                      {/* Death Event Form */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Date of Death *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(dateOfDeath, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={dateOfDeath} onSelect={(d) => d && setDateOfDeath(d)} />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Approximate Time</Label>
                          <Input type="time" value={timeOfDeath} onChange={(e) => setTimeOfDeath(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Location at time of death</Label>
                          <Input
                            value={placeOfDeath}
                            onChange={(e) => setPlaceOfDeath(e.target.value)}
                            placeholder="Enter location (e.g. Main Barn, Pasture, Clinic...)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reported Cause *</Label>
                          <Select value={reportedCause} onValueChange={setReportedCause}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cause" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="natural">Natural Causes</SelectItem>
                              <SelectItem value="accident">Accident</SelectItem>
                              <SelectItem value="disease">Disease</SelectItem>
                              <SelectItem value="predation">Predation</SelectItem>
                              <SelectItem value="unknown">Unknown</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Circumstances & Observations</Label>
                          <Textarea 
                            placeholder="Describe what happened, any unusual observations, etc."
                            value={circumstances}
                            onChange={(e) => setCircumstances(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Witnesses (if any)</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={witnessInput}
                                onChange={(e) => setWitnessInput(e.target.value)}
                                placeholder="Enter witness name"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && witnessInput.trim()) {
                                    e.preventDefault();
                                    setWitnesses([...witnesses, witnessInput.trim()]);
                                    setWitnessInput("");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (witnessInput.trim()) {
                                    setWitnesses([...witnesses, witnessInput.trim()]);
                                    setWitnessInput("");
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                            {witnesses.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {witnesses.map((witness, index) => (
                                  <Badge key={index} variant="secondary" className="gap-1">
                                    {witness}
                                    <button
                                      onClick={() => setWitnesses(witnesses.filter((_, i) => i !== index))}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Role-specific next step info */}
                      {canRequestVet && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                          <p className="text-sm font-bold text-blue-500 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Next Step: Request Veterinary Confirmation
                          </p>
                          <p className="text-xs text-blue-500/80 mt-1">
                            After reporting, you'll have the option to request a veterinarian's confirmation.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Request Vet (Visible to: owner, staff, admin - NOT caretaker) */}
        {currentStep === "request-vet" && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Request Veterinary Confirmation</CardTitle>
              <CardDescription>
                {canRequestVet
                  ? "Request a veterinarian to confirm the cause of death."
                  : "You do not have permission to request veterinarian confirmation."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!canRequestVet ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Permission Required</h3>
                  <p className="text-muted-foreground">
                    Only owners, staff, and administrators can request veterinarian confirmation.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setCurrentStep("disposal")}
                  >
                    Skip to Disposal
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                    <Stethoscope className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-500">Professional Confirmation</p>
                      <p className="text-sm opacity-80">
                        Requesting a veterinarian is recommended for unclear causes, disease outbreaks, 
                        or when professional documentation is required for compliance.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Do you require veterinarian confirmation?</Label>
                      <div className="flex gap-4">
                        <Button
                          variant={vetRequired ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setVetRequired(true)}
                        >
                          Yes, request vet
                        </Button>
                        <Button
                          variant={!vetRequired ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setVetRequired(false)}
                        >
                          No, skip vet review
                        </Button>
                      </div>
                    </div>

                    {vetRequired && (
                      <>
                        <div className="space-y-2">
                          <Label>Reason for Veterinarian Request *</Label>
                          <Textarea
                            placeholder="Explain why veterinarian confirmation is needed..."
                            value={vetRequestReason}
                            onChange={(e) => setVetRequestReason(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Assign to Veterinarian</Label>
                          <Select value={assignedVetId} onValueChange={setAssignedVetId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a veterinarian" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableVets.map((vet) => (
                                <SelectItem key={vet.id} value={vet.id}>
                                  {vet.name} - {vet.specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 border rounded-lg bg-muted/30">
                          <p className="text-sm font-medium mb-2">What happens next:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Selected veterinarian will receive a notification</li>
                            <li>• Case status will change to "Awaiting Vet Confirmation"</li>
                            <li>• You can proceed with disposal after vet confirms</li>
                            <li>• Case will be paused until veterinarian responds</li>
                          </ul>
                        </div>
                      </>
                    )}

                    {!vetRequired && (
                      <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/20">
                        <p className="text-sm font-medium text-green-500 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Proceeding without veterinarian confirmation
                        </p>
                        <p className="text-xs text-green-500/80 mt-1">
                          You can continue directly to disposal documentation.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Vet Confirmation (Visible to: veterinarian, admin) */}
        {currentStep === "vet-confirmation" && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Veterinary Confirmation</CardTitle>
              <CardDescription>
                {canFillVetSection
                  ? "Provide professional confirmation of the cause of death."
                  : "Only veterinarians can access this section."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!canFillVetSection ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Veterinarian Access Only</h3>
                  <p className="text-muted-foreground">
                    This section requires veterinarian privileges.
                  </p>
                </div>
              ) : (
                <>
                  {selectedAnimalData && (
                    <div className="p-4 border rounded-lg bg-card">
                      <p className="font-medium">Animal: {selectedAnimalData.name} ({selectedAnimalData.tagNumber})</p>
                      <p className="text-sm text-muted-foreground">
                        Reported cause: {reportedCause} • Date: {format(dateOfDeath, "PPP")}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Confirmed Cause of Death *</Label>
                    <Textarea
                      placeholder="Enter the official medical cause of death..."
                      value={confirmedCause}
                      onChange={(e) => setConfirmedCause(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Detailed Findings & Observations</Label>
                    <Textarea
                      placeholder="Describe clinical findings, examination results, any tests performed..."
                      value={confirmedCauseDetails}
                      onChange={(e) => setConfirmedCauseDetails(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Necropsy Section */}
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Necropsy Required?</Label>
                        <p className="text-sm text-muted-foreground">Was a post-mortem examination needed or performed?</p>
                      </div>
                      <Switch
                        checked={necropsyRequired}
                        onCheckedChange={setNecropsyRequired}
                      />
                    </div>

                    {necropsyRequired && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">Necropsy Performed?</Label>
                            <p className="text-sm text-muted-foreground">Was the necropsy actually conducted?</p>
                          </div>
                          <Switch
                            checked={necropsyPerformed}
                            onCheckedChange={setNecropsyPerformed}
                          />
                        </div>

                        {necropsyPerformed && (
                          <>
                            <div className="space-y-2">
                              <Label>Necropsy Findings</Label>
                              <Textarea
                                placeholder="Describe necropsy findings, tissue samples taken, lab results..."
                                value={necropsyFindings}
                                onChange={(e) => setNecropsyFindings(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Upload Necropsy Report</Label>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  setNecropsyFiles(files);
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload necropsy reports, lab results, or photos. Max 10MB per file.
                              </p>
                              {necropsyFiles.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {necropsyFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <span>{file.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setNecropsyFiles(necropsyFiles.filter((_, i) => i !== index))}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes & Recommendations</Label>
                    <Textarea
                      placeholder="Any additional veterinary recommendations, treatment history, or notes..."
                      value={vetNotes}
                      onChange={(e) => setVetNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                    <p className="text-sm font-bold text-amber-500">Professional Responsibility</p>
                    <p className="text-xs text-amber-500/80 mt-1">
                      By submitting, you confirm that you have professionally examined this case 
                      and the information provided is accurate to the best of your knowledge.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Disposal (Visible to: staff, caretaker, owner, admin) */}
        {currentStep === "disposal" && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Disposal Information</CardTitle>
              <CardDescription>
                {canFillDisposal
                  ? "Document how the remains were handled for compliance."
                  : "You do not have permission to record disposal information."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!canFillDisposal ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Permission Required</h3>
                  <p className="text-muted-foreground">
                    This section requires staff, caretaker, owner, or admin privileges.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Disposal Method *</Label>
                      <Select value={disposalMethod} onValueChange={setDisposalMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="burial">On-site Burial</SelectItem>
                          <SelectItem value="incineration">Incineration</SelectItem>
                          <SelectItem value="rendering">Rendering Service</SelectItem>
                          <SelectItem value="composting">Composting</SelectItem>
                          <SelectItem value="landfill">Landfill</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Disposal Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(disposalDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={disposalDate} onSelect={(d) => d && setDisposalDate(d)} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Disposal Location</Label>
                      <Input
                        value={disposalLocation}
                        onChange={(e) => setDisposalLocation(e.target.value)}
                        placeholder="Specific area, facility, or coordinates..."
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Witness (if applicable)</Label>
                      <Input
                        value={disposalWitness}
                        onChange={(e) => setDisposalWitness(e.target.value)}
                        placeholder="Name of person who witnessed disposal"
                      />
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed rounded-lg">
                    <Label className="block mb-2">Upload Disposal Certificate (Optional)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDisposalCertificate(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload certificate from rendering service, landfill, or other disposal facility.
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                    <p className="text-sm font-bold text-green-500">Compliance Note</p>
                    <p className="text-xs text-green-500/80 mt-1">
                      Proper disposal documentation is required for regulatory compliance and audit trails.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 5: Review & Submit (Visible to: staff, caretaker, owner, admin) */}
        {currentStep === "review" && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Review & Submit</CardTitle>
              <CardDescription>
                {canReviewSubmit
                  ? "Review all information before final submission."
                  : "You do not have permission to submit death cases."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!canReviewSubmit ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Permission Required</h3>
                  <p className="text-muted-foreground">
                    This section requires staff, caretaker, owner, or admin privileges.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Animal Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Name:</span> {selectedAnimalData?.name}</p>
                          <p><span className="text-muted-foreground">Tag:</span> {selectedAnimalData?.tagNumber}</p>
                          <p><span className="text-muted-foreground">Type:</span> {selectedAnimalData?.animalType}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Death Event</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Date:</span> {format(dateOfDeath, "PPP")}</p>
                          <p><span className="text-muted-foreground">Location:</span> {placeOfDeath}</p>
                          <p><span className="text-muted-foreground">Reported Cause:</span> {reportedCause}</p>
                        </div>
                      </div>
                    </div>

                    {vetRequired && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Veterinary Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Status:</span> {assignedVetId ? "Vet Assigned" : "Vet Requested"}</p>
                          {vetRequestReason && (
                            <p><span className="text-muted-foreground">Reason:</span> {vetRequestReason}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Disposal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Method:</span> {disposalMethod || "Not specified"}</p>
                        <p><span className="text-muted-foreground">Date:</span> {disposalDate ? format(disposalDate, "PPP") : "Not specified"}</p>
                        <p><span className="text-muted-foreground">Location:</span> {disposalLocation || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-sm text-amber-500">
                      After submission, this case will be sent for manager review and become read-only. 
                      Any further changes will require a formal correction request.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                const currentIndex = availableSteps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(availableSteps[currentIndex - 1]);
                }
              }}
              disabled={availableSteps.indexOf(currentStep) === 0}
            >
              Back
            </Button>
            
            {currentStep === "report" && (
              <Button 
                variant="outline"
                onClick={() => saveDraft()}
                disabled={isSavingDraft || !selectedAnimalData}
              >
                {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save as Draft"}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep === "report" && (
              <Button 
                onClick={submitDeathReport}
                disabled={isSubmitting || !selectedAnimalData || !placeOfDeath || !reportedCause}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Death Report"}
              </Button>
            )}

            {currentStep === "request-vet" && canRequestVet && (
              <Button 
                onClick={requestVetConfirmation}
                disabled={isSubmitting || (vetRequired && (!assignedVetId || !vetRequestReason))}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Vet Request"}
              </Button>
            )}

            {currentStep === "vet-confirmation" && canFillVetSection && (
              <Button 
                onClick={submitVetConfirmation}
                disabled={isSubmitting || !confirmedCause}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Vet Confirmation"}
              </Button>
            )}

            {currentStep === "disposal" && canFillDisposal && (
              <Button 
                onClick={submitDisposal}
                disabled={isSubmitting || !disposalMethod}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Record Disposal"}
              </Button>
            )}

            {currentStep === "review" && canReviewSubmit && (
              <Button 
                onClick={submitForReview}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Review"}
              </Button>
            )}

            {currentStep !== "report" && currentStep !== "review" && (
              <Button 
                variant="ghost"
                onClick={() => {
                  const currentIndex = availableSteps.indexOf(currentStep);
                  if (currentIndex < availableSteps.length - 1) {
                    setCurrentStep(availableSteps[currentIndex + 1]);
                  }
                }}
              >
                Skip for Now
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}