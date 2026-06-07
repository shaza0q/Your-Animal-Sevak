import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AddAnimal from "./pages/AddAnimal";
import AddFarm from "./pages/AddFarm";
import FarmInsights from "./pages/FarmInsights";
import AnimalUpdate from "./pages/AnimalUpdate";
import Directory from "./pages/Directory";
import AnimalsOverview from "./pages/AnimalsOverview";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalsByCategory from "./pages/AnimalsByCategory";
import AnimalHistoryPage from "./components/history/AnimalHistoryPage";
import DeceasedAnimals from "./pages/DeceasedAnimals";
import DeathCasesDashboard from "./pages/DeathCases"
import DeathCaseDetail from "./pages/DeathCaseDetail";
import NewDeathCase from "./pages/NewDeathCase";
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/addFarm" element={<AddFarm/>} />
            <Route path="/addAnimal" element={<AddAnimal/>} />
            <Route path="/farmInsights/:id" element={<FarmInsights/>} />
            <Route path="/animalUpdate" element={<AnimalUpdate/>} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/farms/:farmId/animals" element={<AnimalsOverview />} />
            <Route path="/farms/:farmId/animals/type/:animalType" element={<AnimalsByCategory />} />
            <Route path="/farms/:farmId/animals/:animalId" element={<AnimalDetail />} />
            <Route path="/farms/:farmId/animals/deceased" element={<DeceasedAnimals />} />
            <Route path="/farms/:farmId/animals/:animalId/history" element={<AnimalHistoryPage />} />
            <Route path="/compliance/death-cases" element={<DeathCasesDashboard/>}/>
            <Route path="/compliance/death-cases/new" element={<NewDeathCase />} />
            <Route path="/compliance/death-cases/new/:animalId" element={<NewDeathCase />} />
            <Route path="/compliance/death-cases/:id" element={<DeathCaseDetail />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
