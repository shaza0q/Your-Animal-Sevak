import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Beef, 
  Heart, 
  DollarSign, 
  Camera, 
  ArrowLeft,
  Save
} from "lucide-react";

const AddAnimal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Information
    animalId: "",
    animalType: "",
    breed: "",
    gender: "",
    age: "",
    generation: "",
    weight: "",
    color: "",
    dateOfBirth: "",
    
    // Health & Care
    vaccinationStatus: "",
    lastVetCheckup: "",
    healthNotes: "",
    pregnancyStatus: "",
    numberOfOffspring: "",
    feedType: "",
    wateringSchedule: "",
    
    // Sales Information
    estimatedPrice: "",
    forSale: false,
    dateListedForSale: "",
    buyerInfo: "",
    meatYield: "",
    purpose: "",
    
    // Media
    animalPhoto: null as File | null,
    healthDocument: null as File | null,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.animalType || !formData.breed || !formData.gender) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Type, Breed, Gender)",
        variant: "destructive",
      });
      return;
    }

    console.log("Form Data Submitted:", formData);
    
    toast({
      title: "Animal Added Successfully!",
      description: `${formData.breed} has been added to the system.`,
    });
    
    // Navigate back to dashboard after submission
    setTimeout(() => navigate("/dashboard"), 1500);
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Add New Animal</h1>
            <p className="text-muted-foreground mt-1">
              Enter the details of the new animal to add it to your livestock system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beef className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about the animal
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalId">Animal ID / Tag Number</Label>
                  <Input
                    id="animalId"
                    placeholder="e.g., A-001"
                    value={formData.animalId}
                    onChange={(e) => handleInputChange("animalId", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animalType">Type of Animal *</Label>
                  <Select
                    value={formData.animalType}
                    onValueChange={(value) => handleInputChange("animalType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cow">Cow</SelectItem>
                      <SelectItem value="goat">Goat</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="pig">Pig</SelectItem>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="horse">Horse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed *</Label>
                  <Input
                    id="breed"
                    placeholder="e.g., Holstein"
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generation">Generation</Label>
                  <Input
                    id="generation"
                    placeholder="e.g., F1, F2"
                    value={formData.generation}
                    onChange={(e) => handleInputChange("generation", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 450"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color / Markings</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Black and white spotted"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dateOfBirth">Date of Birth / Acquisition</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Health & Care Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health & Care Information
                </CardTitle>
                <CardDescription>
                  Medical and care details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vaccinationStatus">Vaccination Status</Label>
                  <Select
                    value={formData.vaccinationStatus}
                    onValueChange={(value) => handleInputChange("vaccinationStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up-to-date">Up to date</SelectItem>
                      <SelectItem value="due">Due</SelectItem>
                      <SelectItem value="not-started">Not started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastVetCheckup">Last Vet Checkup Date</Label>
                  <Input
                    id="lastVetCheckup"
                    type="date"
                    value={formData.lastVetCheckup}
                    onChange={(e) => handleInputChange("lastVetCheckup", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="healthNotes">Health Notes / Conditions</Label>
                  <Textarea
                    id="healthNotes"
                    placeholder="Any health conditions, allergies, or special notes..."
                    value={formData.healthNotes}
                    onChange={(e) => handleInputChange("healthNotes", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pregnancyStatus">Pregnancy Status</Label>
                  <Select
                    value={formData.pregnancyStatus}
                    onValueChange={(value) => handleInputChange("pregnancyStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfOffspring">Number of Offspring</Label>
                  <Input
                    id="numberOfOffspring"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.numberOfOffspring}
                    onChange={(e) => handleInputChange("numberOfOffspring", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="feedType">Feed Type / Diet Plan</Label>
                  <Textarea
                    id="feedType"
                    placeholder="Describe the feed type and diet plan..."
                    value={formData.feedType}
                    onChange={(e) => handleInputChange("feedType", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="wateringSchedule">Watering Schedule</Label>
                  <Input
                    id="wateringSchedule"
                    placeholder="e.g., Twice daily - 6 AM and 6 PM"
                    value={formData.wateringSchedule}
                    onChange={(e) => handleInputChange("wateringSchedule", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sales Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Sales Information
                </CardTitle>
                <CardDescription>
                  Pricing and sales details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedPrice">Estimated Price ($)</Label>
                  <Input
                    id="estimatedPrice"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.estimatedPrice}
                    onChange={(e) => handleInputChange("estimatedPrice", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => handleInputChange("purpose", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breeding">Breeding</SelectItem>
                      <SelectItem value="milk">Milk</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meatYield">Meat Yield (kg)</Label>
                  <Input
                    id="meatYield"
                    type="number"
                    placeholder="e.g., 300"
                    value={formData.meatYield}
                    onChange={(e) => handleInputChange("meatYield", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateListedForSale">Date Listed for Sale</Label>
                  <Input
                    id="dateListedForSale"
                    type="date"
                    value={formData.dateListedForSale}
                    onChange={(e) => handleInputChange("dateListedForSale", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="buyerInfo">Buyer Information (Optional)</Label>
                  <Input
                    id="buyerInfo"
                    placeholder="Buyer name and contact details"
                    value={formData.buyerInfo}
                    onChange={(e) => handleInputChange("buyerInfo", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="forSale"
                      checked={formData.forSale}
                      onChange={(e) => handleInputChange("forSale", e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="forSale" className="cursor-pointer">
                      Mark as For Sale
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Media Attachments
                </CardTitle>
                <CardDescription>
                  Upload photos and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="animalPhoto">Animal Photo</Label>
                  <Input
                    id="animalPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("animalPhoto", e.target.files?.[0] || null)}
                  />
                  {formData.animalPhoto && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.animalPhoto.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthDocument">Vaccination Certificate / Health Document</Label>
                  <Input
                    id="healthDocument"
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => handleFileChange("healthDocument", e.target.files?.[0] || null)}
                  />
                  {formData.healthDocument && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.healthDocument.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Animal
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddAnimal;
