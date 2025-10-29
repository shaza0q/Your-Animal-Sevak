import axios from "axios"
import {API_BASE_URL} from '../../cache'


export const registerAnimal = async(data) => {
    try{
        const response = await axios.post(`${API_BASE_URL}/animal/addAnimal`, data, {withCredentials: true})
        return response.data
    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to register animal";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }
}