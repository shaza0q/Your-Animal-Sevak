import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/api/registerUser"; // Import the API function
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Lock, Loader2 } from "lucide-react";

// --- FORM VALIDATION FUNCTION (Extracted for cleaner code) ---
const validateForm = (formData, agreed) => {
  const newErrors = {};

  if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
  if (!formData.email.trim()) newErrors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

  if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
  else if (!/^\+?[\d\s-]{10,}$/.test(formData.mobile)) newErrors.mobile = "Invalid mobile number";

  if (!formData.password) newErrors.password = "Password is required";
  else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

  if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

  if (!formData.role) newErrors.role = "Please select a role";
  if (!agreed) newErrors.terms = "You must agree to the terms and conditions";

  return newErrors;
};


const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "", email: "", mobile: "", password: "", confirmPassword: "", role: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // New loading state

  // Generic handler for all input fields
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Dedicated handler for the Select component
  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = validateForm(formData, agreed);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    // Prepare data for API (excluding confirmPassword)
    const { confirmPassword, ...dataToSend } = formData;

    try {
      const response = await registerUser(dataToSend);

      toast({
        title: "Account created successfully!",
        description: `Welcome, ${response.fullName} as a ${response.role}.`,
      });

      console.log(response);
      navigate("/dashboard");

    } catch (error) {
      // Handle API errors
      const errorMessage = error.message || "Registration failed. Please try again.";
      setErrors({ api: errorMessage }); // Display a general API error

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Example: If the server sends a 409 (Conflict) for existing email
      if (error.status === 409) { 
        setErrors({ email: "User already registered, please sign in" });
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Create an Account</CardTitle>
          <CardDescription className="text-base">
            Join Animal Management System to manage and track animal health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobile"
                  placeholder="+1 234 567 8900"
                  className="pl-10"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>
              {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* Role Select Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="caretaker">Caretaker</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to Terms & Conditions
              </label>
            </div>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
            {errors.api && <p className="text-sm text-destructive text-center font-medium">{errors.api}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;