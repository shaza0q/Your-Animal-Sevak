import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAnimalById, getAnimalUpdates, getFarmUsers, mockFarms } from "@/data/mockAnimals";
import { FarmUser } from "@/types/animal";
import {
    AnimalHeader,
    AnimalProfileCard,
    PeopleResponsiblePanel,
    HealthActions,
    RecentUpdates,
    AssignPersonDialog,
} from "@/components/animal-detail";
import { fetchUser } from "@/utils/fetchUser";
import { fetchAnimalDetail } from "@/utils/fetchAnimalDetail";
import { type AnimalDetail } from "@/interfaces/animal-detail.interface";
import { FarmSummaryDto } from "@/interface";
import { fetchFarm } from "@/utils/fetchFarm";
import { UserRole } from "@/enums/user-role.enum";
import { unassignAnimalUser } from "@/api/unassignAnimalUser";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog-box";

const AnimalDetail = () => {
    const navigate = useNavigate();
    const { farmId, animalId } = useParams<{ farmId: string; animalId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();
    const [farm, setFarm] = useState<FarmSummaryDto>(null)

    const [user, setUser] = useState<any>(null);
    const [animal, setAnimal] = useState<AnimalDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [farmUsers, setFarmUsers] = useState<FarmUser[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignRole, setAssignRole] = useState<"caretaker" | "veterinarian">("caretaker");
    const [isOwner, setIsOwner] = useState(false);
    const [isUnassigning, setIsUnassigning] = useState(false);
    const [unassignRole, setUnassignRole] = useState<UserRole.CARETAKER | UserRole.VETERINARIAN | null>(null)
    const isConfirmOpen = unassignRole !== null

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                const userData = await fetchUser();
                setUser(userData)

                if(userData.role == UserRole.OWNER)setIsOwner(true)

                console.log('-----------------userData', userData);

                const animalData = await fetchAnimalDetail(farmId, animalId);
                setAnimal(animalData)

                console.log('--------------animal data', animalData)
                const farmData = await fetchFarm(farmId)
                setFarm(farmData)

            } catch (error) {
                setUser(null);
                navigate("/signin", { replace: true });

            } finally {
                setLoading(false);
            }
        };

        if (farmId && animalId) init();
    }, [farmId, animalId, navigate]);

    // Handle ?assign=caretaker query param
    useEffect(() => {
        const assignParam = searchParams.get("assign");
        if (assignParam === "caretaker" || assignParam === "veterinarian") {
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    const openAssignModal = (role: "caretaker" | "veterinarian") => {
        setAssignRole(role);
        setAssignModalOpen(true);
    };

    const handleAssign = async (user: FarmUser) => {
        console.log(`Assigning ${assignRole} with user ID: ${user.id}`);
        setAssignModalOpen(false);
    };

    const requestUnassign = (role: UserRole.CARETAKER | UserRole.VETERINARIAN) => {
        setUnassignRole(role);
    };

    const handleConfirmUnassign = async () => {
        if (!unassignRole || !animal || !animalId) return;

        const assignedUser =
            unassignRole === UserRole.CARETAKER
            ? animal.caretaker
            : animal.veterinarian;

        if (!assignedUser?._id) return;

        setIsUnassigning(true);
        try {
            await unassignAnimalUser(animalId, assignedUser._id, unassignRole.toLowerCase());
            toast({
            title: "Person unassigned",
            description: `${assignedUser.name} has been removed.`,
            });

            const animalData = await fetchAnimalDetail(farmId, animalId);
            setAnimal(animalData);

            setUnassignRole(null); // CLOSE DIALOG
        } catch (error) {
            toast({
            title: "Error",
            description:
                error instanceof Error ? error.message : "Failed to unassign",
            variant: "destructive",
            });
        } finally {
            setIsUnassigning(false);
        }
    };

    const handleViewFullHistory = () => {
        console.log('Viewing full history');
    };

    if (!user) return null;

    if (!animal) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-2">Not Found</h3>
                        <p className="text-muted-foreground mb-4">
                            The requested animal could not be found.
                        </p>
                        <Button onClick={() => navigate("/dashboard")}>Back to Directory</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* header */}
            {animal && <AnimalHeader animal={animal} farmId={farmId!} />}

            {/* main */}
            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Two-Column Layout */}
                <div className="grid gap-6 lg:grid-cols-5">
                    <AnimalProfileCard
                        animal={animal}
                        farmName={farm?.name || "Loading..."}
                        loading={loading}
                    />

                    <PeopleResponsiblePanel
                        caretakerName={animal?.caretaker?.name}
                        caretakerEmail={animal?.caretaker?.email}
                        caretakerId={animal?.caretaker?._id}
                        veterinarianName={animal?.veterinarian?.name}
                        veterinarianEmail={animal?.veterinarian?.email}
                        veterinarianId={animal?.veterinarian?._id}
                        canAssign={isOwner}
                        canUnassign={isOwner}
                        isLoading={isUnassigning}
                        onAssignCaretaker={() => openAssignModal("caretaker")}
                        onAssignVeterinarian={() => openAssignModal("veterinarian")}
                        onUnassignCaretaker={() => requestUnassign(UserRole.CARETAKER)}
                        onUnassignVeterinarian={() => requestUnassign(UserRole.VETERINARIAN)}
                    />
                </div>

                <HealthActions />

                <RecentUpdates
                    updates={updates}
                    loading={loading}
                    onViewFullHistory={handleViewFullHistory}
                />
            </main>

            <AssignPersonDialog
                open={assignModalOpen}
                onOpenChange={setAssignModalOpen}
                role={assignRole}
                animalName={animal?.name || ""}
                animalId={animal?._id || ""}
                farmId={farmId || ""}
                currentAssigneeId={assignRole === "caretaker" ? animal?.caretaker?._id : animal?.veterinarian?._id}
                currentAssigneeName={assignRole === "caretaker" ? animal?.caretaker?.name : animal?.veterinarian?.name}
                onAssignmentChange={() => {
                    // Refetch animal data to get updated assignments
                    const refetchAnimal = async () => {
                        try {
                            const animalData = await fetchAnimalDetail(farmId, animalId);
                            setAnimal(animalData);
                        } catch (error) {
                            console.error('Failed to refetch animal data:', error);
                        }
                    };
                    refetchAnimal();
                }}
            />

            <ConfirmActionDialog
                open={isConfirmOpen}
                title={`Unassign ${
                    unassignRole === UserRole.CARETAKER ? "Caretaker" : "Veterinarian"
                }?`}
                description={
                    unassignRole === UserRole.CARETAKER
                    ? `This will remove ${animal?.caretaker?.name} as the caretaker.`
                    : `This will remove ${animal?.veterinarian?.name} as the veterinarian.`
                }
                confirmText="Unassign"
                destructive
                isLoading={isUnassigning}
                onConfirm={handleConfirmUnassign}
                onOpenChange={(open) => {
                    if (isUnassigning) return;
                    if (!open) setUnassignRole(null);
                }}
            />

        </div>
    ); 
};

export default AnimalDetail;