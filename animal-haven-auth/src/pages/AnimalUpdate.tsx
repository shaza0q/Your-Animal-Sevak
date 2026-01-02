import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { updateAnimalData, getVaccineData, getDiseaseData } from "@/api"

// Types
type UpdateType = "Health" | "Weight" | "Vaccination" | "Breeding" | "Sale";
type AnimalStatus = "Healthy" | "Injured" | "Diseased" | "Pregnant" | "Sold" | "Dead";
type RiskLevel = "Low" | "Moderate" | "High";

interface Disease {
  animalType: string;
  diseaseName: string;
  _id?: string;
}

interface Vaccine {
  animalType: string;
  vaccineName: string;
  _id?: string;
}

interface Animal {
  id: string;

  // Identification
  tagNumber: string;
  name: string;

  // Ownership
  farmId: string;

  // Classification
  animalType:
    | 'Cow'
    | 'Buffalo'
    | 'Goat'
    | 'Sheep'
    | 'Chicken'
    | 'Duck'
    | 'Rabbit'
    | 'Dog'
    | 'Cat'
    | 'Camel'
    | 'Donkey'
    | 'Horse'
    | 'Pigeon'
    | 'Turkey'
    | 'Other';

  breed: string;
  gender: 'Male' | 'Female';

  // Lineage
  motherId?: string;
  fatherId?: string;
  generation?: number;

  // Dates
  dateOfBirth?: string;      // ISO string
  acquisitionDate?: string; // ISO string

  // Snapshot (derived from AnimalUpdate)
  currentStatus:
    | 'Healthy'
    | 'Injured'
    | 'Diseased'
    | 'Pregnant'
    | 'Dead';

  // Cached latest values (optional but useful)
  currentWeight?: number;

  // Lifecycle
  lifecycleStatus: 'Active' | 'Sold' | 'Deceased';

  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  animalId: string;
  date: Date;
  updateType: UpdateType | "";
  status: AnimalStatus | "";
  weight: string;
  vaccineName: string;
  customVaccineName: string;
  nextVaccineDate: Date | null;
  diseaseName: string;
  customDiseaseName: string;
  riskLevel: RiskLevel | "";
  maleAnimalId: string;
  expectedDeliveryDate: Date | null;
  price: string;
  buyerName: string;
  buyerEmail: string;
  buyerContact: string;
  buyerAddress: string;
  notes: string;
  mediaFile: File | null;
}

interface FormErrors {
  [key: string]: string;
}

// Mock API data
const DISEASES = ["Foot and Mouth Disease", "Bovine Tuberculosis", "Mastitis", "Bloat", "Parasitic Infection", "Other"];
const VACCINES = ["FMD Vaccine", "Brucellosis Vaccine", "Anthrax Vaccine", "Rabies Vaccine", "Blackleg Vaccine", "Other"];
const MALE_ANIMALS = [
  { id: "BULL-001", name: "Thunder" },
  { id: "BULL-002", name: "Storm" },
  { id: "BULL-003", name: "Duke" },
  { id: "RAM-001", name: "Atlas" },
];

const UPDATE_TYPES: { value: UpdateType; label: string; description: string }[] = [
  { value: "Health", label: "Health Update", description: "Log health condition changes" },
  { value: "Weight", label: "Weight Update", description: "Record weight measurements" },
  { value: "Vaccination", label: "Vaccination", description: "Log vaccine administration" },
  { value: "Breeding", label: "Breeding", description: "Record breeding activity" },
  { value: "Sale", label: "Sale", description: "Log animal sale" },
];

const HEALTH_STATUSES: { value: AnimalStatus; label: string }[] = [
  { value: "Healthy", label: "Healthy" },
  { value: "Injured", label: "Injured" },
  { value: "Diseased", label: "Diseased" },
  { value: "Dead", label: "Dead" },
];

const RISK_LEVELS: RiskLevel[] = ["Low", "Moderate", "High"];

const initialFormData: FormData = {
  animalId: "",
  date: new Date(),
  updateType: "",
  status: "",
  weight: "",
  vaccineName: "",
  customVaccineName: "",
  nextVaccineDate: null,
  diseaseName: "",
  customDiseaseName: "",
  riskLevel: "",
  maleAnimalId: "",
  expectedDeliveryDate: null,
  price: "",
  buyerName: "",
  buyerEmail: "",
  buyerContact: "",
  buyerAddress: "",
  notes: "",
  mediaFile: null,
};

// Animation variants
const fieldVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { 
    opacity: 1, 
    height: "auto", 
    marginTop: 16,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const }
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    marginTop: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const }
  }
};

// Image compression utility
const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Compression failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AnimalUpdate = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [diseaseData, setDiseaseData] = useState<[Disease] | null>()
  const [vaccineData, setVaccineData] = useState<[Vaccine] | null>()
  const [maleAnimalData, setMaleAnimalData] = useState<[Animal] | null>()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [diseaseResponse, vaccineResponse] = await Promise.all([
          getDiseaseData(),
          getVaccineData(),
        ]);

        setDiseaseData(diseaseResponse);
        setVaccineData(vaccineResponse);
      } catch (err) {
        console.error("Error fetching master data:", err);

        toast({
          title: "Failed to load master data",
          description: "Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchMasterData();
  }, []);


  // Get the derived/auto-set status based on update type
  const getDerivedStatus = useCallback((): AnimalStatus | "" => {
    switch (formData.updateType) {
      case "Breeding":
        return "Pregnant";
      case "Sale":
        return "Sold";
      case "Health":
        return formData.status; // User-selected
      case "Weight":
      case "Vaccination":
        // These inherit from previous status - return empty to indicate inherited
        return "";
      default:
        return "";
    }
  }, [formData.updateType, formData.status]);

  // Check if status should be shown for current update type
  const shouldShowStatusSelector = formData.updateType === "Health";

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset dependent fields when update type changes
    if (field === "updateType") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        status: "",
        weight: "",
        vaccineName: "",
        customVaccineName: "",
        nextVaccineDate: null,
        diseaseName: "",
        customDiseaseName: "",
        riskLevel: "",
        maleAnimalId: "",
        expectedDeliveryDate: null,
        price: "",
        buyerName: "",
        buyerEmail: "",
        buyerContact: "",
        buyerAddress: "",
        notes: "",
      }));
      setErrors({});
    }

    // Reset custom disease name if disease changes
    if (field === "diseaseName" && value !== "Other") {
      setFormData((prev) => ({ ...prev, customDiseaseName: "" }));
    }

    // Reset custom vaccine name if vaccine changes
    if (field === "vaccineName" && value !== "Other") {
      setFormData((prev) => ({ ...prev, customVaccineName: "" }));
    }
  };

  // Handle media upload with compression
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      setFormData((prev) => ({ ...prev, mediaFile: compressedFile }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      toast({
        title: "Image processed",
        description: `Compressed from ${(file.size / 1024).toFixed(1)}KB to ${(compressedFile.size / 1024).toFixed(1)}KB`,
      });
    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Failed to compress the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Remove uploaded media
  const removeMedia = () => {
    setFormData((prev) => ({ ...prev, mediaFile: null }));
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form based on update type
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Base validations
    if (!formData.animalId.trim()) {
      newErrors.animalId = "Animal ID is required";
    }

    if (!formData.updateType) {
      newErrors.updateType = "Please select an update type";
    }

    // Update type specific validations
    switch (formData.updateType) {
      case "Health":
        if (!formData.status) {
          newErrors.status = "Please select a health status";
        }
        if (formData.status === "Diseased") {
          if (!formData.diseaseName) {
            newErrors.diseaseName = "Please select a disease";
          }
          if (formData.diseaseName === "Other" && !formData.customDiseaseName.trim()) {
            newErrors.customDiseaseName = "Please specify the disease";
          }
          if (!formData.riskLevel) {
            newErrors.riskLevel = "Please select a risk level";
          }
          if (!formData.notes.trim()) {
            newErrors.notes = "Notes are required for diseased animals";
          }
        }
        if (formData.status === "Injured" && !formData.notes.trim()) {
          newErrors.notes = "Notes are required for injured animals";
        }
        break;

      case "Weight":
        if (!formData.weight || parseFloat(formData.weight) <= 0) {
          newErrors.weight = "Please enter a valid weight";
        }
        break;

      case "Vaccination":
        if (!formData.vaccineName) {
          newErrors.vaccineName = "Please select a vaccine";
        }
        if (formData.vaccineName === "Other" && !formData.customVaccineName.trim()) {
          newErrors.customVaccineName = "Please specify the vaccine name";
        }
        break;

      case "Breeding":
        if (!formData.maleAnimalId) {
          newErrors.maleAnimalId = "Please select a male animal";
        }
        if (!formData.expectedDeliveryDate) {
          newErrors.expectedDeliveryDate = "Please select expected delivery date";
        }
        break;

      case "Sale":
        if (!formData.price || parseFloat(formData.price) <= 0) {
          newErrors.price = "Please enter a valid price";
        }
        if (!formData.buyerName.trim()) {
          newErrors.buyerName = "Buyer name is required";
        }
        if (!formData.buyerContact.trim()) {
          newErrors.buyerContact = "Buyer contact is required";
        }
        if (formData.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
          newErrors.buyerEmail = "Please enter a valid email address";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build the final payload
  const buildPayload = () => {
    let finalStatus: AnimalStatus | "" = getDerivedStatus();
    
    // For Weight and Vaccination, we'd normally fetch the last known status
    // For now, we'll set a placeholder that backend would handle
    if (formData.updateType === "Weight" || formData.updateType === "Vaccination") {
      finalStatus = "Healthy"; // This would be inherited from DB in real implementation
    }

    const payload: any = {
      animalId: formData.animalId,
      date: format(formData.date, "yyyy-MM-dd"),
      updateType: formData.updateType,
      status: finalStatus,
    };

    switch (formData.updateType) {
      case "Health":
        if (formData.status === "Diseased") {
          payload.diseaseName = formData.diseaseName === "Other" 
            ? formData.customDiseaseName 
            : formData.diseaseName;
          payload.riskLevel = formData.riskLevel;
        }
        break;

      case "Weight":
        payload.weight = parseFloat(formData.weight);
        break;

      case "Vaccination":
        payload.vaccineName = formData.vaccineName === "Other"
          ? formData.customVaccineName
          : formData.vaccineName;
        if (formData.nextVaccineDate) {
          payload.nextVaccineDate = format(formData.nextVaccineDate, "yyyy-MM-dd");
        }
        break;

      case "Breeding":
        payload.maleAnimalId = formData.maleAnimalId;
        payload.expectedDeliveryDate = format(formData.expectedDeliveryDate!, "yyyy-MM-dd");
        break;

      case "Sale":
        payload.price = parseFloat(formData.price);
        payload.buyerName = formData.buyerName;
        payload.buyerContact = formData.buyerContact;
        if (formData.buyerEmail) payload.buyerEmail = formData.buyerEmail;
        if (formData.buyerAddress) payload.buyerAddress = formData.buyerAddress;
        break;
    }

    if (formData.notes.trim()) {
      payload.notes = formData.notes;
    }

    if (formData.mediaFile) {
      payload.mediaFile = formData.mediaFile;
    }

    return payload;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const response = await updateAnimalData(formData, setUploadProgress);

      console.log("-----------------------", response);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const payload = buildPayload();
      console.log("Submitting payload:", payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Update Logged Successfully",
        description: `${formData.updateType} update for ${formData.animalId} has been recorded.`,
      });

      // Reset form
      setTimeout(() => {
        setFormData(initialFormData);
        setMediaPreview(null);
        setUploadProgress(0);
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to log update. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setMediaPreview(null);
    toast({
      title: "Form reset",
      description: "Enter new data as you wish",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Animal Update</h1>
                <p className="text-sm text-muted-foreground">
                  Log health, weight, vaccination, breeding, or sale updates
                </p>
              </div>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">        <Card className="border-border">
          {/* <CardHeader>
            <CardTitle>Log Update</CardTitle>
            <CardDescription>
              Select the type of update you want to record. Fields will adapt based on your selection.
            </CardDescription>
          </CardHeader> */}
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Base Fields - Always Visible */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Animal ID */}
                <div className="space-y-2">
                  <Label htmlFor="animalId">
                    Animal ID / Tag Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="animalId"
                    placeholder="e.g., COW-001"
                    value={formData.animalId}
                    onChange={(e) => handleInputChange("animalId", e.target.value)}
                    className={cn(errors.animalId && "border-destructive")}
                  />
                  {errors.animalId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.animalId}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && handleInputChange("date", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Update Type Selector */}
              <div className="space-y-2">
                <Label>
                  Update Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.updateType}
                  onValueChange={(value) => handleInputChange("updateType", value as UpdateType)}
                >
                  <SelectTrigger className={cn(errors.updateType && "border-destructive")}>
                    <SelectValue placeholder="Select update type" />
                  </SelectTrigger>
                  <SelectContent>
                    {UPDATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.updateType && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.updateType}
                  </p>
                )}
              </div>

              {/* Conditional Fields */}
              <AnimatePresence mode="wait">
                {/* Health Update Fields */}
                {formData.updateType === "Health" && (
                  <motion.div
                    key="health-fields"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Status Selector */}
                    <div className="space-y-2">
                      <Label>
                        Status <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange("status", value as AnimalStatus)}
                      >
                        <SelectTrigger className={cn(errors.status && "border-destructive")}>
                          <SelectValue placeholder="Select health status" />
                        </SelectTrigger>
                        <SelectContent>
                          {HEALTH_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.status}
                        </p>
                      )}
                    </div>

                    {/* Disease Fields - Only show when status is Diseased */}
                    <AnimatePresence>
                      {formData.status === "Diseased" && (
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>
                                Disease Name <span className="text-destructive">*</span>
                              </Label>
                              <Select
                                value={formData.diseaseName}
                                onValueChange={(value) => handleInputChange("diseaseName", value)}
                              >
                                <SelectTrigger className={cn(errors.diseaseName && "border-destructive")}>
                                  <SelectValue placeholder="Select disease" />
                                </SelectTrigger>
                                <SelectContent>
                                  {diseaseData && diseaseData.length > 0 ? [...new Set(diseaseData.map(b => b.diseaseName))].map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))
                                  : (
                                      <SelectItem value="NA">No Disease found</SelectItem>
                                    )}
                                      <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.diseaseName && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.diseaseName}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>
                                Risk Level <span className="text-destructive">*</span>
                              </Label>
                              <Select
                                value={formData.riskLevel}
                                onValueChange={(value) => handleInputChange("riskLevel", value as RiskLevel)}
                              >
                                <SelectTrigger className={cn(errors.riskLevel && "border-destructive")}>
                                  <SelectValue placeholder="Select risk level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {RISK_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                      {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.riskLevel && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.riskLevel}
                                </p>
                              )}
                            </div>
                          </div>

                          {formData.diseaseName === "Other" && (
                            <motion.div
                              variants={fieldVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="space-y-2"
                            >
                              <Label>
                                Specify Disease <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                placeholder="Enter disease name"
                                value={formData.customDiseaseName}
                                onChange={(e) => handleInputChange("customDiseaseName", e.target.value)}
                                className={cn(errors.customDiseaseName && "border-destructive")}
                              />
                              {errors.customDiseaseName && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.customDiseaseName}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Notes - Required for Injured or Diseased */}
                    <div className="space-y-2">
                      <Label>
                        Notes{" "}
                        {(formData.status === "Injured" || formData.status === "Diseased") && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <Textarea
                        placeholder="Add notes about the animal's condition..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        className={cn(errors.notes && "border-destructive")}
                        rows={3}
                      />
                      {errors.notes && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.notes}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Weight Update Fields */}
                {formData.updateType === "Weight" && (
                  <motion.div
                    key="weight-fields"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Note:</span> Weight updates do not change the animal's health status.
                        The current status will be preserved.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Weight (kg) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Enter weight in kg"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className={cn(errors.weight && "border-destructive")}
                      />
                      {errors.weight && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.weight}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Add notes about the weight measurement..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Vaccination Update Fields */}
                {formData.updateType === "Vaccination" && (
                  <motion.div
                    key="vaccination-fields"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Note:</span> Vaccination is an event, not a status change.
                        The animal's current health status will be preserved.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Vaccine Name <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.vaccineName}
                        onValueChange={(value) => handleInputChange("vaccineName", value)}
                      >
                        <SelectTrigger className={cn(errors.vaccineName && "border-destructive")}>
                          <SelectValue placeholder="Select vaccine" />
                        </SelectTrigger>
                         <SelectContent>
                          {vaccineData && vaccineData.length > 0 ? [...new Set(vaccineData.map(b => b.vaccineName))].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))
                          : (
                              <SelectItem value="NA">No Vaccine found</SelectItem>
                            )}
                              <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vaccineName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.vaccineName}
                        </p>
                      )}
                    </div>

                    <AnimatePresence>
                      {formData.vaccineName === "Other" && (
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="space-y-2"
                        >
                          <Label>
                            Specify Vaccine <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="Enter vaccine name"
                            value={formData.customVaccineName}
                            onChange={(e) => handleInputChange("customVaccineName", e.target.value)}
                            className={cn(errors.customVaccineName && "border-destructive")}
                          />
                          {errors.customVaccineName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.customVaccineName}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label>Next Vaccine Date (optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.nextVaccineDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {formData.nextVaccineDate
                              ? format(formData.nextVaccineDate, "PPP")
                              : "Select next vaccine date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={formData.nextVaccineDate || undefined}
                            onSelect={(date) => handleInputChange("nextVaccineDate", date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Add notes about the vaccination..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Breeding Update Fields */}
                {formData.updateType === "Breeding" && (
                  <motion.div
                    key="breeding-fields"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Status Auto-Set:</span> Recording a breeding event will automatically
                        set the animal's status to <span className="font-semibold text-primary">Pregnant</span>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Male Animal <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.maleAnimalId}
                        onValueChange={(value) => handleInputChange("maleAnimalId", value)}
                      >
                        <SelectTrigger className={cn(errors.maleAnimalId && "border-destructive")}>
                          <SelectValue placeholder="Select male animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {MALE_ANIMALS.map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.name} ({animal.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.maleAnimalId && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.maleAnimalId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Expected Delivery Date <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.expectedDeliveryDate && "text-muted-foreground",
                              errors.expectedDeliveryDate && "border-destructive"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {formData.expectedDeliveryDate
                              ? format(formData.expectedDeliveryDate, "PPP")
                              : "Select expected delivery date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={formData.expectedDeliveryDate || undefined}
                            onSelect={(date) => handleInputChange("expectedDeliveryDate", date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.expectedDeliveryDate && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.expectedDeliveryDate}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Add notes about the breeding..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Sale Update Fields */}
                {formData.updateType === "Sale" && (
                  <motion.div
                    key="sale-fields"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Terminal Update:</span> Recording a sale will set the animal's
                        status to <span className="font-semibold text-amber-600 dark:text-amber-400">Sold</span>.
                        No further updates can be logged after this.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Price <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter sale price"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          className={cn(errors.price && "border-destructive")}
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Buyer Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="Enter buyer's name"
                          value={formData.buyerName}
                          onChange={(e) => handleInputChange("buyerName", e.target.value)}
                          className={cn(errors.buyerName && "border-destructive")}
                        />
                        {errors.buyerName && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.buyerName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Buyer Contact <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="Phone number"
                          value={formData.buyerContact}
                          onChange={(e) => handleInputChange("buyerContact", e.target.value)}
                          className={cn(errors.buyerContact && "border-destructive")}
                        />
                        {errors.buyerContact && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.buyerContact}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Buyer Email (optional)</Label>
                        <Input
                          type="email"
                          placeholder="buyer@example.com"
                          value={formData.buyerEmail}
                          onChange={(e) => handleInputChange("buyerEmail", e.target.value)}
                          className={cn(errors.buyerEmail && "border-destructive")}
                        />
                        {errors.buyerEmail && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.buyerEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Buyer Address (optional)</Label>
                      <Textarea
                        placeholder="Enter buyer's address"
                        value={formData.buyerAddress}
                        onChange={(e) => handleInputChange("buyerAddress", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Media Upload Section - Show when update type is selected */}
              <AnimatePresence>
                {formData.updateType && (
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-3"
                  >
                    <Label>Upload Image (optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      {mediaPreview ? (
                        <div className="relative">
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeMedia}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB (will be compressed)
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleMediaUpload}
                          />
                        </label>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              <AnimatePresence>
                {isSubmitting && uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.updateType}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Update
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </main>
    </div>
  );
};

export default AnimalUpdate;
