import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const updateAnimalData = async(data, setProgress) => {
    try{
        // console.log(data)
        const response = await axios.post(`${API_BASE_URL}/animal/updateAnimalData`, data, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
            
            onUploadProgress: (progressEvent) => {
                if(progressEvent.total){
                    const precentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setProgress(precentCompleted)
                }
            },
        })
        
        return response.data
    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to update animal";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }
}