import axios from "axios";
import { API_BASE_URL } from "../../cache";
import { AnimalOverviewResponse } from "../interface/animal-overview.interface";

export const getAnimalOverview = async (farmId: string, state: string): Promise<AnimalOverviewResponse> => {
    try {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
         
         const url = `${API_BASE_URL}/farms/${farmId}/animals/overview?state=${state}`;
         console.log('----------getAnimalOverview URL:', url);
         
         const res = await fetch(
            url,
            {
            credentials: "include",
            signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        console.log('----------getAnimalOverview response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.log('----------getAnimalOverview error response:', errorText);
            throw new Error(`Failed to fetch animal overview: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log('----------getAnimalOverview response data:', data);
        return data;
    } catch (error: any) {
        console.log('----------getAnimalOverview error:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - API call took too long');
        }
        
        const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch farm data";

        const customError: any = new Error(errorMessage);
        customError.status = error.response?.status;

        throw customError;
    }
};
