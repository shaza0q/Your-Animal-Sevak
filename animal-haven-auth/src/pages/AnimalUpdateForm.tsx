import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateAnimalData } from "@/api/updateAnimalData"
import imageCompression from "browser-image-compression"
import { Progress } from "@/components/ui/progress";
import { getDiseaseData } from "@/api/getDiseaseData";
import { getVaccineData } from "@/api/getVaccineData"
import { STATUS_OPTIONS } from "../../cache"


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

const imageOptimisationOptions = {
  maxSizeMB: 0.5,
  maxWidhtOrHeiht: 1280,
  useWebWorker: true,
}

// const STATUS_OPTIONS = [
//   { value: "Healthy", label: "🟢 Healthy" },
//   { value: "Injured", label: "🟠 Injured" },
//   { value: "Diseased", label: "🔴 Diseased" },
//   { value: "Pregnant", label: "🟣 Pregnant" },
//   { value: "Vaccined", label: "🔵 Vaccined" },
//   { value: "Sold", label: "⚫ Sold" },
// ];


const FEED_OPTIONS = [
  "Green Fodder",
  "Dry Fodder",
  "Mixed Feed",
  "Mineral Mix",
  "Other",
];

const MALE_ANIMALS = [
];

const RISK_LEVELS = ["Low", "Moderate", "High"];

const AnimalUpdate = () => {

  const [diseaseData, setDiseaseData] = useState<[Disease] | null>()
  const [vaccineData, setVaccineData] = useState<[Vaccine] | null>()

  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate()

  const [uploadProgress, setProgress] = useState(0)
  
  const [formData, setFormData] = useState({
    date: today,
    animalId: "",
    weight: "",
    notes: "",
    status: "",
    mediaFile: null as File | null,
    
    // Injured fields
    riskLevel: "",
    
    // Diseased fields
    diseaseName: "",
    customDiseaseName: "",
    
    // Pregnant fields
    maleAnimalId: "",
    expectedDeliveryDate: "",
    
    // Vaccined fields
    vaccineName: "",
    customVaccineName: "",
    nextVaccineDate: "",
    
    // FeedUpdate fields
    feedType: "",
    customFeedType: "",
    
    // Sold fields
    price: "",
    buyerName: "",
    buyerEmail: "",
    buyerContact: "",
    buyerAddress: "",
  });

  useEffect(() => {
    /*DISEASE DATA*/
    const getData = async() => {
      try{
        const response = await getDiseaseData();
        setDiseaseData(response);

      }
      catch(err){
        console.log("Error in fetching breed data ", err)

        toast({
          title: "Failed to load Disease data",
          description: "Please refresh the page.",
          variant: "destructive",
        });

      }
    }

    getData()

  }, [])

  useEffect(() => {
    /*Vaccine DATA*/
    const getData = async() => {
      try{
        const response = await getVaccineData();
        setVaccineData(response);

      }
      catch(err){
        console.log("Error in fetching breed data ", err)

        toast({
          title: "Failed to load Vaccine data",
          description: "Please refresh the page.",
          variant: "destructive",
        });

      }
    }

    getData()

  }, [])

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };


  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // console.log("Original size:", (file.size / 1024).toFixed(2), "KB");

      // 🔽 compress file before preview or upload
      const compressedFile = await imageCompression(file, imageOptimisationOptions);
      // console.log("Compressed size:", (compressedFile.size / 1024).toFixed(2), "KB");

      // ✅ store compressed file in your form state
      setFormData(prev => ({ ...prev, mediaFile: compressedFile }));

      // 📸 show preview from compressed file
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error("Image compression failed:", error);
    }
  };


  const removeMedia = () => {
    setFormData(prev => ({ ...prev, mediaFile: null }));
    setMediaPreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    // Status-specific validation
    if (formData.status === "Injured" && !formData.notes) {
      newErrors.notes = "Notes are required for injured status";
    }

    if (formData.status === "Diseased" && !formData.diseaseName) {
      newErrors.diseaseName = "Disease name is required";
    }

    if (formData.status === "Diseased" && formData.diseaseName === "Other" && !formData.customDiseaseName) {
      newErrors.customDiseaseName = "Please specify the disease name";
    }

    if (formData.status === "Pregnant" && !formData.maleAnimalId) {
      newErrors.maleAnimalId = "Male animal ID is required";
    }

    if (formData.status === "Pregnant" && !formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = "Expected delivery date is required";
    }

    if (formData.status === "Vaccined" && !formData.vaccineName) {
      newErrors.vaccineName = "Vaccine name is required";
    }

    if (formData.status === "Vaccined" && formData.vaccineName === "Other" && !formData.customVaccineName) {
      newErrors.customVaccineName = "Please specify the vaccine name";
    }

    if (formData.status === "FeedUpdate" && !formData.feedType) {
      newErrors.feedType = "Feed type is required";
    }

    if (formData.status === "FeedUpdate" && formData.feedType === "Other" && !formData.customFeedType) {
      newErrors.customFeedType = "Please specify the feed type";
    }

    if (formData.status === "Sold") {
      if (!formData.price) newErrors.price = "Price is required";
      if (!formData.buyerName) newErrors.buyerName = "Buyer name is required";
      if (!formData.buyerContact) newErrors.buyerContact = "Buyer contact is required";
      if (formData.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
        newErrors.buyerEmail = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    // console.log(formData.mediaFile)
    
    if (!validateForm()) {
      toast({
          title: "Please enter correct data",
          description: "Please refresh the page.",
          variant: "destructive",
      });
      return;
    }

    try{
      const response = await updateAnimalData(formData, setProgress);
      
      console.log(uploadProgress, "%")

      console.log(response)
      
      // console.log("Form submitted:", formData);


       toast({
        title: "Update logged successfully!",
        description: `${response.data.name} data has been updated to the system`,
      });
      
      setProgress(0);
      setTimeout(() => navigate("/dashboard"), 1000);
    }
    catch(err){
      console.log("Error in updating the data ", err)

      toast({
        title: "Failed in updating the data",
        description: err?.response?.data?.message || err.message || "Something went wrong.",
        variant: "destructive",
      });

    }
    
  };

  const handleCancel = () => {
    setFormData({
      date: today,
      animalId: "",
      weight: "",
      notes: "",
      status: "",
      mediaFile: null,
      riskLevel: "",
      diseaseName: "",
      customDiseaseName: "",
      maleAnimalId: "",
      expectedDeliveryDate: "",
      vaccineName: "",
      customVaccineName: "",
      nextVaccineDate: "",
      feedType: "",
      customFeedType: "",
      price: "",
      buyerName: "",
      buyerEmail: "",
      buyerContact: "",
      buyerAddress: "",
    });
    setMediaPreview(null);
    setErrors({});
    toast({
      title: "Form reset",
      description: "Enter new data as you wish",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Log Animal Update
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Base Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label htmlFor="date">Animal Id/ Tag Number <span className="text-destructive">*</span></Label>
                <Input
                  id="animalId"
                  value={formData.animalId}
                  onChange={(e) => handleInputChange("animalId", e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => {
                      const Icon = option.icon; // get the icon component
                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="flex justify-between items-center"
                        >
                          <span>{option.label}</span>
                          <Icon className={`${option.color} w-4 h-4`} />
                        </SelectItem>
                      );
                    })}
                    </SelectContent>

                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
              </div>

              {formData.status !== "Sold" && (
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Dynamic Fields Based on Status */}
            <AnimatePresence mode="wait">
              {/* Injured Fields */}
              {formData.status === "Injured" && (
                <motion.div
                  key="injured"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange("riskLevel", value)}>
                      <SelectTrigger>
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
                  </div>
                </motion.div>
              )}

              {/* Diseased Fields */}
              {formData.status === "Diseased" && (
                <motion.div
                  key="diseased"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="diseaseName">
                      Disease Name <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.diseaseName} onValueChange={(value) => handleInputChange("diseaseName", value)}>
                      <SelectTrigger className={errors.diseaseName ? "border-destructive" : ""}>
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
                    {errors.diseaseName && <p className="text-sm text-destructive">{errors.diseaseName}</p>}
                  </div>

                  {formData.diseaseName === "Other" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="customDiseaseName">
                        Enter Disease Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customDiseaseName"
                        placeholder="Specify disease name"
                        value={formData.customDiseaseName}
                        onChange={(e) => handleInputChange("customDiseaseName", e.target.value)}
                        className={errors.customDiseaseName ? "border-destructive" : ""}
                      />
                      {errors.customDiseaseName && <p className="text-sm text-destructive">{errors.customDiseaseName}</p>}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange("riskLevel", value)}>
                      <SelectTrigger>
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
                  </div>

                </motion.div>
              )}

              {/* Pregnant Fields */}
              {formData.status === "Pregnant" && (
                <motion.div
                  key="pregnant"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maleAnimalId">
                        Male Animal ID <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.maleAnimalId} onValueChange={(value) => handleInputChange("maleAnimalId", value)}>
                        <SelectTrigger className={errors.maleAnimalId ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select male animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {MALE_ANIMALS.map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.maleAnimalId && <p className="text-sm text-destructive">{errors.maleAnimalId}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedDeliveryDate">
                        Expected Delivery Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="expectedDeliveryDate"
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => handleInputChange("expectedDeliveryDate", e.target.value)}
                        className={errors.expectedDeliveryDate ? "border-destructive" : ""}
                      />
                      {errors.expectedDeliveryDate && <p className="text-sm text-destructive">{errors.expectedDeliveryDate}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vaccined Fields */}
              {formData.status === "Vaccined" && (
                <motion.div
                  key="vaccined"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vaccineName">
                        Vaccine Name <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.vaccineName} onValueChange={(value) => handleInputChange("vaccineName", value)}>
                        <SelectTrigger className={errors.vaccineName ? "border-destructive" : ""}>
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
                      {errors.vaccineName && <p className="text-sm text-destructive">{errors.vaccineName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextVaccineDate">Next Vaccine Date</Label>
                      <Input
                        id="nextVaccineDate"
                        type="date"
                        value={formData.nextVaccineDate}
                        onChange={(e) => handleInputChange("nextVaccineDate", e.target.value)}
                      />
                    </div>
                  </div>

                  {formData.vaccineName === "Other" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="customVaccineName">
                        Enter Vaccine Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customVaccineName"
                        placeholder="Specify vaccine name"
                        value={formData.customVaccineName}
                        onChange={(e) => handleInputChange("customVaccineName", e.target.value)}
                        className={errors.customVaccineName ? "border-destructive" : ""}
                      />
                      {errors.customVaccineName && <p className="text-sm text-destructive">{errors.customVaccineName}</p>}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* FeedUpdate Fields */}
              {formData.status === "FeedUpdate" && (
                <motion.div
                  key="feedupdate"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="feedType">
                      Feed Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.feedType} onValueChange={(value) => handleInputChange("feedType", value)}>
                      <SelectTrigger className={errors.feedType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select feed type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEED_OPTIONS.map((feed) => (
                          <SelectItem key={feed} value={feed}>
                            {feed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.feedType && <p className="text-sm text-destructive">{errors.feedType}</p>}
                  </div>

                  {formData.feedType === "Other" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="customFeedType">
                        Enter Feed Type <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customFeedType"
                        placeholder="Specify feed type"
                        value={formData.customFeedType}
                        onChange={(e) => handleInputChange("customFeedType", e.target.value)}
                        className={errors.customFeedType ? "border-destructive" : ""}
                      />
                      {errors.customFeedType && <p className="text-sm text-destructive">{errors.customFeedType}</p>}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Sold Fields */}
              {formData.status === "Sold" && (
                <motion.div
                  key="sold"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Price <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="Enter price"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className={errors.price ? "border-destructive" : ""}
                      />
                      {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerName">
                        Buyer Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="buyerName"
                        placeholder="Enter buyer name"
                        value={formData.buyerName}
                        onChange={(e) => handleInputChange("buyerName", e.target.value)}
                        className={errors.buyerName ? "border-destructive" : ""}
                      />
                      {errors.buyerName && <p className="text-sm text-destructive">{errors.buyerName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerEmail">Buyer Email</Label>
                      <Input
                        id="buyerEmail"
                        type="email"
                        placeholder="buyer@example.com"
                        value={formData.buyerEmail}
                        onChange={(e) => handleInputChange("buyerEmail", e.target.value)}
                        className={errors.buyerEmail ? "border-destructive" : ""}
                      />
                      {errors.buyerEmail && <p className="text-sm text-destructive">{errors.buyerEmail}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerContact">
                        Buyer Contact <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="buyerContact"
                        placeholder="Enter contact number"
                        value={formData.buyerContact}
                        onChange={(e) => handleInputChange("buyerContact", e.target.value)}
                        className={errors.buyerContact ? "border-destructive" : ""}
                      />
                      {errors.buyerContact && <p className="text-sm text-destructive">{errors.buyerContact}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="buyerAddress">Buyer Address</Label>
                      <Textarea
                        id="buyerAddress"
                        placeholder="Enter buyer address"
                        value={formData.buyerAddress}
                        onChange={(e) => handleInputChange("buyerAddress", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes Field */}
            {formData.status && formData.status !== "Sold" && (
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Notes {formData.status === "Injured" && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                  className={errors.notes ? "border-destructive" : ""}
                />
                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
              </div>
            )}

            {/* Media Upload */}
            <div className="space-y-2">
              <Label htmlFor="media">Upload Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("media")?.click()}
                  className="w-full md:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  id="media"
                  type="file"
                  accept="image/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                {formData.mediaFile && (
                  <span className="text-sm text-muted-foreground">{formData.mediaFile.name}</span>
                )}
              </div>

              {mediaPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative mt-4"
                >
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
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
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <motion.div
                  key="uploadProgress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
                    

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Save Update
              </Button>
            </div>
          </form>
        </CardContent>

      </Card>
    </main>
    </div>
  );
}


export default AnimalUpdate