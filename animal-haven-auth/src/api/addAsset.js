import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const addFarm = (data) => {
    const response = axios.post(`${API_BASE_URL}/asset/addFarm`, data, {withCredentials: true})
}