import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const searchFarmUsers = async (
  farmId: string,
  query: string,
  roles: string[]
) => {
    try{
        const params = new URLSearchParams();
        params.append("q", query);
        params.append("roles", roles.join(","));

        console.log('------query', query)
        console.log('------roles', roles)
      
        const res = await axios.get(
          `${API_BASE_URL}/farms/${farmId}/users/search?${params.toString()}`,
          { withCredentials: true }
        );
      
        return res.data.data;
    }
    catch(error){
        console.log('Error searching farm users:', error);
        throw error;
    }
};
