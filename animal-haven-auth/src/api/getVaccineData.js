import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const getVaccineData = async() => {
    try{
        const response = await axios.get(`${API_BASE_URL}/master/getVaccineData`, {withCredentials: true})
        // console.log("8 from api/getUserData: ", response)
        return response.data
    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to authorize user";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }
}