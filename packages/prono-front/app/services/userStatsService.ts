/**
 * Service pour les statistiques utilisateur
 */
import { apiClient } from "./api";

export interface UserStats {
	user_id: string;
	group_id: string;
	total_points?: number;
	score?: number;
	correct_predictions: number;
	total_predictions: number;
	exact_scores: number;
	accuracy: number;
	joined_at?: string;
}

/**
 * Récupère le score directement depuis UserGroup (recommandé - plus rapide)
 */
export async function getUserGroupScore(
	groupId: string
): Promise<{ stats: UserStats | null; error: string | null }> {
	const response = await apiClient.get<UserStats>(
		`/api/groups/${groupId}/score`
	);

	if (response.error || response.status !== 200) {
		return {
			stats: null,
			error: response.error || "Erreur lors du chargement du score",
		};
	}

	return {
		stats: response.data || null,
		error: null,
	};
}

/**
 * Récupère les statistiques complètes de l'utilisateur dans un groupe
 * Cette route recalcule les stats à partir des prédictions
 * @deprecated Préférer getUserGroupScore() pour les performances
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
