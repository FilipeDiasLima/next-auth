import { AuthContext } from "@/context/auth";
import { useContext } from "react";

export function useAuth() {
  return useContext(AuthContext);
}
