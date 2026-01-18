import { getUserData } from "../api/getUserData"

export const fetchUser = async () => {
    try {
      const user = await getUserData();
      return user;
    } catch (err) {
      console.error("Auth failed", err);
      throw err;
    }
  };