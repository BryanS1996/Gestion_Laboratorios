import { useContext } from "react";
import { AuthContext } from "../context/AuthConte|xt";
export const useAuth = () => {
  return useContext(AuthContext);
};
