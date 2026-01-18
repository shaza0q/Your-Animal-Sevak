import axios from "axios";
import {API_BASE_URL} from '../../cache'

export const getAnimalAssignments = async (animalId: string) => {
    try{
        const res = await axios.get(
            `${API_BASE_URL}/animals/${animalId}/assignments`,
            { withCredentials: true }
        );

        if (!res.data) {
            throw new Error("Failed to fetch animal assignment");
        }

        return res.data;
    }
    catch(error){
        console.error("Error fetching animal assignments:", error);
        throw error;
    }
};

