import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, UserX, Loader2, X } from "lucide-react";
import { FarmUser } from "@/types/animal";

// Interface for API response which uses _id
interface SearchFarmUser {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "staff" | "caretaker" | "veterinarian";
}
import { useToast } from "@/hooks/use-toast";
import { searchFarmUsers } from "@/api/searchFarmUsers";
import { assignAnimalUser } from "@/api/assignAnimalUser";
import { unassignAnimalUser } from "@/api/unassignAnimalUser";

interface AssignPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "caretaker" | "veterinarian";
  animalName: string;
  animalId: string;
  farmId: string;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
  onAssignmentChange?: () => void;
}

const AssignPersonDialog = ({
  open,
  onOpenChange,
  role,
  animalName,
  animalId,
  farmId,
  currentAssigneeId,
  currentAssigneeName,
  onAssignmentChange,
}: AssignPersonDialogProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchFarmUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchFarmUser | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Search users with API call
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for users with:', { farmId, query: searchQuery.trim(), role });
      const results = await searchFarmUsers(farmId, searchQuery.trim(), [role]) as SearchFarmUser[];
      console.log('Search results:', results);
      // Filter out already assigned user
      const filteredResults = results.filter(u => u._id !== currentAssigneeId);
      console.log('Filtered results:', filteredResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, role, farmId, currentAssigneeId, toast]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(handleSearch, 800);
    return () => clearTimeout(timeout);
  }, [handleSearch]);

  const handleAssign = async () => {
    if (!selectedUser || !animalId) return;
    
    setAssigning(true);
    try {
      await assignAnimalUser(animalId, selectedUser._id, role);
      
      toast({
        title: "Assignment successful",
        description: `${selectedUser.name} has been assigned as ${role}`,
      });
      
      handleClose();
      onAssignmentChange?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Assignment failed";
      toast({
        title: "Assignment failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  // Add debug log to track searchResults
  useEffect(() => {
    console.log('searchResults state updated:', searchResults);
  }, [searchResults]);

  const handleClose = () => {
    onOpenChange(false);
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage {role === "caretaker" ? "Caretaker" : "Veterinarian"} Assignment</DialogTitle>
          <DialogDescription>
            {currentAssigneeId 
              ? `Currently assigned: ${currentAssigneeName}. Search to reassign or remove current assignment.`
              : `Search and select a user to assign as ${role} for ${animalName}.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {/* Current Assignment */}
            {currentAssigneeId && (
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{currentAssigneeName}</p>
                    <p className="text-xs text-muted-foreground">Currently assigned</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {isSearching ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No matching users found</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => (
                <div
                  key={u._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedUser?._id === u._id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-border/50 hover:bg-muted/50 hover:border-border"
                  }`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {u.role}
                    </Badge>
                  </div>
                </div>
              ))
            ) : !currentAssigneeId && !searchQuery.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start typing to search users</p>
              </div>
            ) : null}
          </div>

          <div className="flex justify-between gap-2 pt-2 border-t border-border/30">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedUser || assigning}
            >
              {assigning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Assigning...</>
              ) : (
                "Assign"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPersonDialog;