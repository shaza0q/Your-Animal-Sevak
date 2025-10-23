import axios from 'axios'
import {API_BASE_URL} from '../../cache'
import { useNavigate } from "react-router-dom";


export const handleLogout = async(navigate) => {

    await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials : true })
    .then(res => {
        if(res.data.status){
            navigate('/signin')
        }
    }).catch(err => {
        console.log(err)
    })
}


