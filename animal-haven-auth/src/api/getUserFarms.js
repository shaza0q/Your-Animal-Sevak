import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const getUserFarm = async() => {
    try{
        const res = await axios.get(`${API_BASE_URL}/asset/getFarm`, {withCredentials: true})
    
        // console.log("9 from api getUserFarm", res.data.data);

        return res.data.data

    }
    catch(error){
        const errorMessage = error.response?.data?.message || error.message || "Failed to register user";
        const customError = new Error(errorMessage);
        customError.status = error.response?.status; // Attach status code
        throw customError;
    }

}