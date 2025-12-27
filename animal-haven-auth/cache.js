import {
  CheckCircle,
  Bandage,
  AlertOctagon,
  Baby,
  Syringe,
  BadgeDollarSign,
  Skull,
} from "lucide-react";

export const STATUS_OPTIONS = [
  { value: "Healthy", label: "Healthy", icon: CheckCircle, color: "text-green-600" },
  { value: "Injured", label: "Injured", icon: Bandage, color: "text-orange-500" },
  { value: "Diseased", label: "Diseased", icon: AlertOctagon, color: "text-red-600" },
  { value: "Pregnant", label: "Pregnant", icon: Baby, color: "text-purple-500" },
  { value: "Vaccined", label: "Vaccined", icon: Syringe, color: "text-blue-600" },
  { value: "Sold", label: "Sold", icon: BadgeDollarSign, color: "text-gray-700" },
  { value: "Dead", label: "Dead", icon: Skull, color: "text-gray-700" },
];

export const API_BASE_URL = "http://localhost:8000";
