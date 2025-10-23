import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const registerUser = async(data) => {
    try{
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, data, {withCredentials: true});
        return response.data;
    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to register user";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }
}


export const authenticateUser = async(data) => {
    try{
        const response = await axios.post(`${API_BASE_URL}/auth/signin`, data, {withCredentials: true});
        console.log(response)
        return response.data
    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to authenticate user";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }
}
