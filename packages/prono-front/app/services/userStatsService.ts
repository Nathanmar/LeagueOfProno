/**
 * Service pour les statistiques utilisateur
 */
import { apiClient } from "./api";

export interface UserStats {
	user_id: string;
	group_id: string;
	total_points: number;
	correct_predictions: number;
	total_predictions: number;
	exact_scores: number;
	accuracy: number;
}

/**
 * Récupère les statistiques de l'utilisateur dans un groupe
 */
export async function getUserGroupStats(
	groupId: string
): Promise<{ stats: UserStats | null; error: string | null }> {
	const response = await apiClient.get<UserStats>(
		`/api/groups/${groupId}/user-stats`
	);

	if (response.error || response.status !== 200) {
		return {
			stats: null,
			error: response.error || "Erreur lors du chargement des statistiques",
		};
	}

	return {
		stats: response.data || null,
		error: null,
	};
}
