import axios from 'axios'
import {API_BASE_URL} from '../../cache'


export const getUserFarm = async() => {
    const res = await axios.get(`${API_BASE_URL}/asset/getFarmData`, {}, {withCredentials: true})
}