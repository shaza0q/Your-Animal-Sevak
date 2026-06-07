import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  UserX, 
  User, 
  Stethoscope, 
  X, 
  Search,
  Loader2,
  AlertCircle,
  ShieldAlert
} from "lucide-react";

import { getAnimalAssignments } from "@/api/getAnimalAssignments";
import { assignAnimalUser } from "@/api/assignAnimalUser";
import { unassignAnimalUser } from "@/api/unassignAnimalUser";
import { searchFarmUsers } from "@/api/searchFarmUsers";

import {
  AnimalAssignmentSectionProps,
  Assignment,
  FarmUser,
} from "@/interface";

type AssignmentRole = "caretaker" | "veterinarian";

interface AssignmentWithDetails extends Assignment {
  worker: {
    id: string;
    name: string;
    email: string;
    role: AssignmentRole;
  };
}

// Sub-components for better organization
const AssignmentItem = ({ 
  assignment, 
  onUnassignClick,
  canUnassign,
  isOwner
}: { 
  assignment: AssignmentWithDetails;
  onUnassignClick: (assignment: AssignmentWithDetails) => void;
  canUnassign: boolean;
  isOwner: boolean;
}) => (
  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
    <div className="flex items-center gap-3">
      {assignment.role === "caretaker" ? (
        <User className="h-4 w-4 text-primary" />
      ) : (
        <Stethoscope className="h-4 w-4 text-blue-600" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{assignment.worker.name}</p>
        <p className="text-sm text-muted-foreground truncate">
          {assignment.worker.email}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Badge 
        variant={assignment.role === "caretaker" ? "default" : "secondary"}
        className="capitalize"
      >
        {assignment.role}
      </Badge>
      {canUnassign && isOwner && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnassignClick(assignment)}
          aria-label={`Remove ${assignment.worker.name} as ${assignment.role}`}
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      {!isOwner && (
        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  </div>
);

const SearchResultItem = ({ 
  user, 
  onClick,
  isSelected 
}: { 
  user: FarmUser;
  onClick: () => void;
  isSelected: boolean;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    className={`flex justify-between p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent ${
      isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
    }`}
    aria-label={`Assign ${user.name} as ${user.role}`}
  >
    <div className="min-w-0 flex-1">
      <p className="font-medium truncate">{user.name}</p>
      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
    </div>
    <Badge 
      variant={user.role.toLowerCase() === "caretaker" ? "outline" : "secondary"}
      className="capitalize shrink-0"
    >
      {user.role}
    </Badge>
  </div>
);

const AnimalAssignmentSection = ({
  animal,
  farmId,
  userId,
  isOwner = false, // Add isOwner prop to enforce owner-only unassign
}: AnimalAssignmentSectionProps & { isOwner?: boolean }) => {
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FarmUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AssignmentRole>("caretaker");
  const [selectedUser, setSelectedUser] = useState<FarmUser | null>(null);
  const [assigning, setAssigning] = useState(false);
  
  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [assignmentToUnassign, setAssignmentToUnassign] = useState<AssignmentWithDetails | null>(null);
  const [unassigning, setUnassigning] = useState(false);

  // Memoized computed values
  const caretakerAssignments = useMemo(() => 
    assignments.filter(a => a.role === "caretaker"), 
    [assignments]
  );

  const veterinarianAssignments = useMemo(() => 
    assignments.filter(a => a.role === "veterinarian"), 
    [assignments]
  );

  const isAlreadyAssigned = useMemo(() => {
    if (!selectedUser) return false;
    return assignments.some(
      assignment =>
        assignment.worker.id === selectedUser.id &&
        assignment.role === selectedRole
    );
  }, [selectedUser, selectedRole, assignments]);

  /* ---------------- Fetch Assignments ---------------- */
  const fetchAssignments = useCallback(async () => {
    if (!animal?.id) return;
    
    setLoadingAssignments(true);
    setLoadingError(null);
    try {
      const data = await getAnimalAssignments(animal.id);
      setAssignments(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      setLoadingError(message);
      toast({
        title: "Failed to load assignments",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingAssignments(false);
    }
  }, [animal?.id, toast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  /* ---------------- Search Users ---------------- */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (!farmId) {
      toast({
        title: "Error",
        description: "Farm ID is required for search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchFarmUsers(
        farmId,
        searchQuery.trim(),
        [selectedRole]
      );
      setSearchResults(results);

    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }

  }, [searchQuery, selectedRole, farmId, toast]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(handleSearch, 400);
    return () => clearTimeout(timeout);
  }, [handleSearch]);

  /* ---------------- Assign ---------------- */
  const handleAssign = async () => {
    if (!selectedUser || !animal?.id) {
      toast({
        title: "Invalid selection",
        description: "Please select a user to assign",
        variant: "destructive",
      });
      return;
    }

    if (isAlreadyAssigned) {
      toast({
        title: "Already assigned",
        description: `${selectedUser.name} is already assigned as ${selectedRole}`,
        variant: "destructive",
      });
      setAssignDialogOpen(false);
      return;
    }

    setAssigning(true);
    try {
      await assignAnimalUser(animal.id, selectedUser.id, selectedRole);

      toast({
        title: "Assignment successful",
        description: `${selectedUser.name} has been assigned as ${selectedRole}`,
      });

      setAssignDialogOpen(false);
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);

      // Refresh assignments
      await fetchAssignments();
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

  /* ---------------- Unassign ---------------- */
  const handleUnassign = async () => {
    if (!animal?.id || !assignmentToUnassign) return;

    setUnassigning(true);
    try {
      await unassignAnimalUser(animal.id, assignmentToUnassign.id);
      
      toast({ 
        title: "Assignment removed",
        description: `${assignmentToUnassign.worker.name} has been unassigned as ${assignmentToUnassign.role}`,
      });

      // Update local state immediately for better UX
      setAssignments(prev => prev.filter(a => a.id !== assignmentToUnassign.id));
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove assignment";
      toast({ 
        title: "Failed to remove",
        description: message,
        variant: "destructive" 
      });
      // Refresh to ensure consistency
      await fetchAssignments();
    } finally {
      setUnassigning(false);
      setUnassignDialogOpen(false);
      setAssignmentToUnassign(null);
    }
  };

  /* ---------------- Unassign Click Handler ---------------- */
  const handleUnassignClick = (assignment: AssignmentWithDetails) => {
    if (!isOwner) {
      toast({
        title: "Permission denied",
        description: "Only the farm owner can remove assignments",
        variant: "destructive",
      });
      return;
    }
    
    setAssignmentToUnassign(assignment);
    setUnassignDialogOpen(true);
  };

  /* ---------------- Render Helpers ---------------- */
  const renderAssignmentsList = () => {
    if (loadingAssignments) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (loadingError) {
      return (
        <div className="text-center py-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground mb-3">{loadingError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAssignments}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No staff assigned yet</p>
          <p className="text-sm mt-1">Use the form below to assign staff</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {caretakerAssignments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">will update this layout</h4>
            <div className="space-y-2">
              {caretakerAssignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onUnassignClick={handleUnassignClick}
                  canUnassign={!!userId}
                  isOwner={isOwner}
                />
              ))}
            </div>
          </div>
        )}

        {veterinarianAssignments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Veterinarians</h4>
            <div className="space-y-2">
              {veterinarianAssignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onUnassignClick={handleUnassignClick}
                  canUnassign={!!userId}
                  isOwner={isOwner}
                />
              ))}
            </div>
          </div>
        )}

        {!isOwner && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded bg-muted/50">
            <ShieldAlert className="h-3 w-3" />
            <span>Only farm owner can remove assignments</span>
          </div>
        )}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!userId) return null;

    if (isSearching) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim()) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <Search className="h-5 w-5 mx-auto mb-2" />
          <p className="text-sm">No users found for "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {searchResults.map((user) => (
          <SearchResultItem
            key={user.id}
            user={user}
            onClick={() => {
              setSelectedUser(user);
              setAssignDialogOpen(true);
            }}
            isSelected={selectedUser?.id === user.id}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Staff Assignments
          {assignments.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {assignments.length} assigned
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Assignments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Current Assignments</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAssignments}
              disabled={loadingAssignments}
            >
              {loadingAssignments ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          {renderAssignmentsList()}
        </div>

        {/* Assign New Staff */}
        {userId && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold">Assign New Staff</h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v: AssignmentRole) => {
                      setSelectedRole(v);
                      setSearchResults([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caretaker">Caretaker</SelectItem>
                      <SelectItem value="veterinarian">Veterinarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Staff</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${selectedRole}s...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {renderSearchResults()}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Assign Confirmation Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Assign <span className="font-semibold">{selectedUser?.name}</span> as{" "}
              <span className="font-semibold capitalize">{selectedRole}</span>?
              {assignments.length > 0 && (
                <div className="mt-2 text-sm">
                  This animal currently has {assignments.length} assignment(s)
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAssignDialogOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={assigning}
            >
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Confirm Assignment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <X className="h-5 w-5" />
              Remove Assignment
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-semibold">{assignmentToUnassign?.worker.name}</span> as{" "}
                <span className="font-semibold capitalize">{assignmentToUnassign?.role}</span>?
              </p>
              
              {assignments.length > 1 && (
                <div className="p-3 bg-muted rounded text-sm">
                  <p className="font-medium mb-1">This animal will have:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      {caretakerAssignments.length - (assignmentToUnassign?.role === "caretaker" ? 1 : 0)} caretaker(s)
                    </li>
                    <li>
                      {veterinarianAssignments.length - (assignmentToUnassign?.role === "veterinarian" ? 1 : 0)} veterinarian(s)
                    </li>
                  </ul>
                </div>
              )}
              
              <p className="text-destructive text-sm font-medium">
                This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUnassignDialogOpen(false)}
              disabled={unassigning}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleUnassign} 
              disabled={unassigning}
            >
              {unassigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Assignment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AnimalAssignmentSection;