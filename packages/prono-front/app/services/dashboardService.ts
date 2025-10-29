/**
 * Service pour les statistiques du dashboard
 */
import { apiClient } from "./api";
import { getProfile, type UserProfile } from "./profileService";
import { getGroups } from "./groupsService";
import { getFriends } from "./friendsService";

export interface DashboardStats {
  profile: UserProfile;
  groupsCount: number;
  friendsCount: number;
  accuracy: number;
  predictions: {
    total: number;
    correct: number;
  };
}

/**
 * Récupère toutes les statistiques du dashboard
 */
export async function getDashboardStats(): Promise<{ stats: DashboardStats | null; error: string | null }> {
  try {
    // Charger les données en parallèle
    const [profileResponse, groupsResponse, friendsResponse] = await Promise.all([
      getProfile(),
      getGroups(),
      getFriends(),
    ]);

    // Vérifier les erreurs
    if (profileResponse.error || !profileResponse.profile) {
      return {
        stats: null,
        error: profileResponse.error || "Erreur lors du chargement du profil",
      };
    }

    const profile = profileResponse.profile;
    const groupsCount = groupsResponse.groups?.length || 0;
    const friendsCount = friendsResponse.friends?.length || 0;

    // Calculer le taux de précision
    const accuracy =
      profile.predictions_count && profile.predictions_count > 0
        ? Math.round(((profile.wins_count || 0) / profile.predictions_count) * 100)
        : 0;

    const stats: DashboardStats = {
      profile,
      groupsCount,
      friendsCount,
      accuracy,
      predictions: {
        total: profile.predictions_count || 0,
        correct: profile.wins_count || 0,
      },
    };

    return {
      stats,
      error: null,
    };
  } catch (err) {
    console.error("Erreur lors du chargement des statistiques du dashboard:", err);
    return {
      stats: null,
      error: "Erreur lors du chargement des statistiques",
    };
  }
}
