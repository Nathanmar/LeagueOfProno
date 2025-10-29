/**
 * Service pour les prédictions du groupe
 */
import { apiClient } from "./api";

export interface Prediction {
	id: string;
	match_id: string;
	user_id: string;
	user_name?: string;
	prediction: string;
	predicted_winner?: string;
	predicted_score_a?: number;
	predicted_score_b?: number;
	is_correct?: boolean;
	is_exact_score?: boolean;
	points_earned?: number;
}

export interface PredictionsResponse {
	predictions: Prediction[];
	groupId: string;
}

/**
 * Récupère toutes les prédictions d'un groupe
 */
export async function getGroupPredictions(
	groupId: string
): Promise<{ predictions: Prediction[]; error: string | null }> {
	const response = await apiClient.get<PredictionsResponse>(
		`/api/groups/${groupId}/predictions`
	);

	if (response.error || response.status !== 200) {
		return {
			predictions: [],
			error: response.error || "Erreur lors du chargement des prédictions",
		};
	}

	return {
		predictions: response.data?.predictions || [],
		error: null,
	};
}

/**
 * Récupère les prédictions d'un match spécifique dans un groupe
 */
export async function getMatchPredictions(
	groupId: string,
	matchId: string
): Promise<{ predictions: Prediction[]; error: string | null }> {
	const response = await apiClient.get<PredictionsResponse>(
		`/api/groups/${groupId}/matches/${matchId}/predictions`
	);

	if (response.error || response.status !== 200) {
		return {
			predictions: [],
			error: response.error || "Erreur lors du chargement des prédictions du match",
		};
	}

	return {
		predictions: response.data?.predictions || [],
		error: null,
	};
}

/**
 * Soumet une prédiction pour un match dans un groupe
 */
export async function submitGroupPrediction(
	groupId: string,
	matchId: string,
	prediction: {
		predicted_winner: "team_a" | "team_b";
		predicted_score_a?: number;
		predicted_score_b?: number;
	}
): Promise<{ prediction: Prediction | null; error: string | null }> {
	const response = await apiClient.post<{ prediction: Prediction }>(
		`/api/groups/${groupId}/matches/${matchId}/predict`,
		prediction
	);

	if (response.error || (response.status !== 200 && response.status !== 201)) {
		return {
			prediction: null,
			error: response.error || "Erreur lors de l'envoi de la prédiction",
		};
	}

	return {
		prediction: response.data?.prediction || null,
		error: null,
	};
}
