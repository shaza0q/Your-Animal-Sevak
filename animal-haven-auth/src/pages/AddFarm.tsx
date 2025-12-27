import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { addFarm } from "@/api/addAsset";
import { ThemeToggle } from "@/components/ThemeToggle";
const ANIMAL_TYPES = ["Cow", "Goat", "Horse", "Dog", "Sheep", "Chicken", "Other"];

const AddFarm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    animalTypes: [] as string[],
  });

  const [customAnimalType, setCustomAnimalType] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    animalTypes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAnimalTypeChange = (animalType: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      animalTypes: checked
        ? [...prev.animalTypes, animalType]
        : prev.animalTypes.filter((type) => type !== animalType),
    }));
    
    // Clear custom animal type if "Other" is unchecked
    if (animalType === "Other" && !checked) {
      setCustomAnimalType("");
    }
    
    // Clear error when user selects an animal type
    if (errors.animalTypes) {
      setErrors((prev) => ({ ...prev, animalTypes: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      animalTypes: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required";
    }

    if (formData.animalTypes.length === 0) {
      newErrors.animalTypes = "Please select at least one animal type";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.animalTypes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Include custom animal type if "Other" is selected
      const animalTypes = formData.animalTypes.map(type => 
        type === "Other" && customAnimalType ? customAnimalType : type
      ).filter(type => type !== "Other" || !customAnimalType);

      const response = await addFarm(formData);

      console.log(response)

      toast({
        title: "Success!",
        description: "Farm added successfully!",
      });

      // Clear form
      setFormData({
        name: "",
        location: "",
        capacity: "",
        animalTypes: [],
      });
      setCustomAnimalType("");

      // Navigate back to dashboard after a short delay
   
   
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
   
   
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add farm. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding farm:", error);
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
              <h1 className="text-2xl font-bold">Add New Farm</h1>
              <p className="text-sm text-muted-foreground">
                Register a new farm in the system
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Farm Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Farm Information
              </CardTitle>
              <CardDescription>
                Enter the basic details about the farm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Farm Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Sunshine Farm"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., California"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of animals the farm can accommodate
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Animal Types */}
          <Card>
            <CardHeader>
              <CardTitle>
                Animal Types <span className="text-destructive">*</span>
              </CardTitle>
              <CardDescription>
                Select the types of animals this farm will manage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {ANIMAL_TYPES.map((animalType) => (
                  <div key={animalType} className="flex items-center space-x-2">
                    <Checkbox
                      id={animalType}
                      checked={formData.animalTypes.includes(animalType)}
                      onCheckedChange={(checked) =>
                        handleAnimalTypeChange(animalType, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={animalType}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {animalType}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Custom Animal Type Input */}
              {formData.animalTypes.includes("Other") && (
                <div className="space-y-2">
                  <Label htmlFor="customAnimalType">
                    Specify Animal Type <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customAnimalType"
                    type="text"
                    placeholder="e.g., Rabbit, Duck, Turkey"
                    value={customAnimalType}
                    onChange={(e) => setCustomAnimalType(e.target.value)}
                  />
                </div>
              )}

              {errors.animalTypes && (
                <p className="text-sm text-destructive">{errors.animalTypes}</p>
              )}

              {/* Preview Selected Animal Types */}
              {formData.animalTypes.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Animal Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.animalTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                      >
                        {type === "Other" && customAnimalType ? customAnimalType : type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
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
              Add Farm
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddFarm;
