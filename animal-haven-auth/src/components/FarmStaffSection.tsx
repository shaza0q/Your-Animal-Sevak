import { useState, useEffect, useMemo } from "react";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Search, X, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFarmUsers } from "@/api/getFarmUsers";
import { assignFarmUser } from "@/api/assignFarmUser";
import { removeFarmUser } from "@/api/removeFarmUser";
import { searchUsers } from "@/api/searchUsers";
import { updateFarmUserRole } from "@/api/updateUserFarmRole";

console.log("FarmStaffSection: Module loaded!");

type UserRole = "Staff" | "Caretaker" | "Veterinarian";

interface FarmUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedDate: string;
  avatar?: string;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Mock data for assigned staff
const mockAssignedStaff: FarmUser[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@farm.com",
    role: "Caretaker",
    assignedDate: "2024-08-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@farm.com",
    role: "Veterinarian",
    assignedDate: "2024-09-01",
  },
  {
    id: "3",
    name: "Mike Brown",
    email: "mike.b@farm.com",
    role: "Staff",
    assignedDate: "2024-10-20",
  },
];

// Mock data for user search
// const mockAllUsers: SearchUser[] = [
//   { id: "4", name: "Emily Davis", email: "emily.d@farm.com" },
//   { id: "5", name: "Robert Wilson", email: "robert.w@farm.com" },
//   { id: "6", name: "Lisa Anderson", email: "lisa.a@farm.com" },
//   { id: "7", name: "David Martinez", email: "david.m@farm.com" },
//   { id: "8", name: "Jennifer Taylor", email: "jen.t@farm.com" },
// ];

interface FarmStaffSectionProps {
  farmId: string;
  isOwner?: boolean;
}

const FarmStaffSection = ({ farmId, isOwner = true }: FarmStaffSectionProps) => {
  console.log("FarmStaffSection: Component rendering with farmId:", farmId);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [assignedStaff, setAssignedStaff] = useState<FarmUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [userToRemove, setUserToRemove] = useState<FarmUser | null>(null);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    const fetchFarmUsers = async () => {
      try {
        setIsLoading(true);

        const users = await getFarmUsers(farmId); // already array
        setAssignedStaff(users);

      } catch (err) {
        console.error("Error fetching farm user data:", err);

        toast({
          title: "Failed to load farm users",
          description: "Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmUsers();
  }, [farmId]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
    try {
      const results = await searchUsers({
        query: searchQuery,
        farmId,
      });

      setSearchResults(results);
    } catch (err) {
      console.error(err);
      toast({
        title: "Search failed",
        description: "Unable to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [searchQuery, farmId]);

  const handleAssignUser = async (user: SearchUser) => {
    const role = selectedRoles[user.id] || "Staff";
    
    try {
      const createdAssignment = await assignFarmUser(
        farmId,
        user.id,
        role
      );

      setAssignedStaff((prev) => [
        ...prev,
        {
          id: createdAssignment.id,
          name: createdAssignment.name,
          email: createdAssignment.email,
          role: createdAssignment.role,
          assignedDate: createdAssignment.assignedDate,
        },
      ]);

      toast({
        title: "User Assigned",
        description: `${createdAssignment.name} assigned as ${role}`,
      });

      setIsModalOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err: any) {
      toast({
        title: "Assignment failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (user: FarmUser) => {
    try {

      await removeFarmUser(farmId, user.id);

      setAssignedStaff((prev) =>
        prev.filter((u) => u.id !== user.id)
      );

      toast({
        title: "User Removed",
        description: `${user.name} no longer has access to this farm`,
      });
    } catch (err: any) {
      toast({
        title: "Removal failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUserToRemove(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "Veterinarian":
        return "default";
      case "Caretaker":
        return "secondary";
      case "Staff":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  console.log("FarmStaffSection: Rendering - isLoading:", isLoading, "assignedStaff.length:", assignedStaff.length);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Farm Staff & Veterinarians
            </CardTitle>
            {isOwner ? (
              <Button onClick={() => setIsModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Assign User
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" disabled className="opacity-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign User
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Only farm owners can assign users</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : assignedStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No staff assigned to this farm yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Assign User" to add staff members, caretakers, or veterinarians
              </p>
              {isOwner && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Your First User
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedStaff.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium truncate">{user.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        {isOwner ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => setUserToRemove(user)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-50 cursor-not-allowed flex-shrink-0"
                                disabled
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Only farm owners can remove users</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Since {formatDate(user.assignedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User to Farm</DialogTitle>
            <DialogDescription>
              Search for users by email and assign them a role on this farm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isSearching ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No users found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.role}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      disabled={assigningUserId === user.id}
                      onClick={async () => {
                        setAssigningUserId(user.id);
                        await handleAssignUser(user);
                        setAssigningUserId(null);
                      }}
                      className="h-8"
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!searchQuery && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Start typing to search for users
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove User Confirmation */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from Farm?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">{userToRemove?.name}</span> from this
              farm? They will lose access to farm data and activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToRemove && handleRemoveUser(userToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
 
};

export default FarmStaffSection;
