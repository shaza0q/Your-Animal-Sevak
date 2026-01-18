import axios from "axios";
import { API_BASE_URL } from '../../cache'
import { AnimalType } from "@/enums/animal-type.enum";

export const getAnimalsData = async (params: { 
    farmId: string; 
    animalType: AnimalType;
    page?: number;
    limit?: number;
    assigned?: boolean;
    gender?: string;
    breed?: string;
    caretakerName?: string;
    vetName?: string;
}) => {

    try{
        const query = new URLSearchParams();
    
        query.append("type", params.animalType);
        if(params.page) query.append("page", params.page.toString());
        
        if(params.limit) query.append("limit", params.limit.toString());
        
        if (params.assigned !== undefined) {
            query.append("assigned", params.assigned.toString());
        }

        if(params.gender) query.append("gender", params.gender);
        
        if(params.breed) query.append("breed", params.breed);

        if(params.caretakerName) query.append("caretakerName", params.caretakerName);

        if(params.vetName) query.append("vetName", params.vetName);
        
        const res = await axios.get(
          `${API_BASE_URL}/farms/${params.farmId}/animals?${query.toString()}`,
          { withCredentials: true }
        );
    
        console.log("---------api getAnimalsData Farm animal fetch success", res.data);
        return res.data;
    }
    catch(error: any){
        const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch farm data";

        const customError: any = new Error(errorMessage);
        customError.status = error.response?.status;

        throw customError;
    }
}