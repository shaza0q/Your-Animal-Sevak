import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getUserFarm } from "@/api/getUserFarms"
import { registerAnimal } from "@/api/registerAnimal"
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
  const location = useLocation();

  const preselectedFarmId = location.state?.farmId || "";

  const [farmData, setFarmData] = useState<[] | null>()
  
  const [formData, setFormData] = useState({
    farmId: "",
    tagNumber: "",
    name: "",
    animalType: "",
    motherId: "",
    fatherId: "",
    otherAnimalType: "",
    breed: "",
    gender: "",
    weight: "",
    dateOfBirth: "",
    acquisitionDate: "",
  });


  useEffect(() => {
    const getFarms = async() => {
      try{
        const response = await getUserFarm();
    
        setFarmData(response);

        if (preselectedFarmId && response.some((f: any) => f._id === preselectedFarmId)) {
          setFormData(prev => ({ ...prev, farmId: preselectedFarmId }));
        }
  
      }
      catch(err){
        console.log("Error in getting farm Data in the addAnimal Page")
      }
    }

    getFarms()

  }, [navigate])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async(e: React.FormEvent) => {
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
    
    try{

      const res = await registerAnimal(formData)

      toast({
        title: "Animal Added Successfully!",
        description: `${formData.name} has been added to the system.`,
      });
      
      // Navigate back to dashboard after submission
      setTimeout(() => navigate("/dashboard"), 1000);
    }
    catch (err: any) {
      console.error("Error while registering animal:", err);

      toast({
        title: "Failed to Add Animal Data",
        description: err?.message || "An unexpected error occurred while adding the animal.",
        variant: "destructive",
      });
    }

    
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Add New Animal</h1>
          <p className="text-muted-foreground mb-6">
            Enter the animal’s details below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beef className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential details about the animal</CardDescription>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                {/* Farm */}
                <div className="space-y-2">
                  <Label>Farm Name *</Label>
                  <Select
                    value={formData.farmId}
                    onValueChange={(value) => handleInputChange("farmId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Farm Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmData && farmData.length > 0 ? (
                        farmData.map((f: any) => (
                          <SelectItem key={f._id} value={f._id}>
                            {f.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="NA">No farm found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Animal ID */}
                <div className="space-y-2">
                  <Label>Animal ID / Tag</Label>
                  <Input
                    placeholder="e.g., A-001"
                    value={formData.tagNumber}
                    onChange={(e) => handleInputChange("tagNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Animal Name</Label>
                  <Input
                    placeholder="e.g., Bhuri"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* parent ID */}
                

                {/* Animal Type */}
                <div className="space-y-2">
                  <Label>Animal Type *</Label>
                  <Select
                    value={formData.animalType}
                    onValueChange={(value) => handleInputChange("animalType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Animal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cow">Cow</SelectItem>
                      <SelectItem value="Buffalo">Buffalo</SelectItem>
                      <SelectItem value="Goat">Goat</SelectItem>
                      <SelectItem value="Sheep">Sheep</SelectItem>
                      <SelectItem value="Chicken">Chicken</SelectItem>
                      <SelectItem value="Duck">Duck</SelectItem>
                      <SelectItem value="Rabbit">Rabbit</SelectItem>
                      <SelectItem value="Horse">Horse</SelectItem>
                      <SelectItem value="Camel">Camel</SelectItem>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.animalType === "Other" && (
                  <div className="mt-2">
                    <Label>Other Animal Type</Label>
                    <Input
                      placeholder="Enter animal type"
                      value={formData.otherAnimalType || ""}
                      onChange={(e) => handleInputChange("otherBreedName", e.target.value)}
                    />
                  </div>
                )}

                {/* Breed */}
                <div className="space-y-2">
                  <Label>Breed *</Label>
                  <Input
                    placeholder="e.g., Barbari"
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                
                {/* Weight */}
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 450"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>

                {/* Date of acquisition */}
                <div className="space-y-2">
                  <Label>Date of Acquisition</Label>
                  <Input
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => handleInputChange("acquisitionDate", e.target.value)}
                  />
                </div>
               
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Parent Information
                </CardTitle>
                <CardDescription>
                  Parent details
                </CardDescription>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Mother ID / Tag</Label>
                    <Input
                      placeholder="e.g., A-001"
                      value={formData.motherId}
                      onChange={(e) => handleInputChange("motherId", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Father ID / Tag</Label>
                    <Input
                      placeholder="e.g., A-001"
                      value={formData.fatherId}
                      onChange={(e) => handleInputChange("fatherId", e.target.value)}
                    />
                  </div>

              </CardContent>

            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
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
            {/* Sales Information
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
 */}


export default AddAnimal;
