import { apiClient, endpoints } from "../services/api";
import type { User, Group, Match, Prediction } from "../data/mockData";
import {
  adaptConvexMatch,
  adaptConvexPrediction,
  adaptConvexGroup,
  adaptConvexUser,
} from "../data/dataAdapter";

/**
 * Récupère tous les matchs depuis l'API
 */
async function registerUser(username: string, password: string): Promise<User | null> {
  try {
    const data = await apiClient.post<Record<string, unknown>>(endpoints.register, {
      username,
      password,
    });
    return adaptConvexUser(data);
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
}

async function loginUser(username: string, password: string): Promise<User | null> {
    try {
        const data = await apiClient.post<Record<string, unknown>>(endpoints.login, {
        username,
        password,
        });
        return adaptConvexUser(data);
    } catch (error) {
        console.error("Error logging in user:", error);
        return null;
    }
}

export { registerUser, loginUser };