import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const getUserData = async() => {
    try{
        const response = await axios.post(`${API_BASE_URL}/user/getUserData`, {}, {withCredentials: true})
        return response.data
    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to authorize user";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }
}