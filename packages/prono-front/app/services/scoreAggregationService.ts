/**
 * Service pour agréger les scores de plusieurs groupes
 */
import { getUserGroupScore, type UserStats } from "./userStatsService";
import { getGroups, type Group } from "./groupsService";

export interface AggregatedStats {
  total_points: number;
  groups_count: number;
  correct_predictions: number;
  total_predictions: number;
  exact_scores: number;
  accuracy: number;
  group_scores: Array<{
    group_id: string;
    group_name: string;
    score: number;
    correct_predictions: number;
    accuracy: number;
  }>;
}

/**
 * Agrège les scores de l'utilisateur sur tous ses groupes
 */
export async function getAggregatedUserStats(): Promise<{
  stats: AggregatedStats | null;
  error: string | null;
}> {
  try {
    // Récupérer tous les groupes de l'utilisateur
    const { groups, error: groupsError } = await getGroups();
    if (groupsError || !groups) {
      return {
        stats: null,
        error: groupsError || "Erreur lors du chargement des groupes",
      };
    }

    // Récupérer les scores pour chaque groupe en parallèle
    const scorePromises = groups.map((group) => getUserGroupScore(group.id));
    const scoresResults = await Promise.all(scorePromises);

    // Agréger les résultats
    let total_points = 0;
    let correct_predictions = 0;
    let total_predictions = 0;
    let exact_scores = 0;
    const group_scores: AggregatedStats["group_scores"] = [];

    for (let i = 0; i < groups.length; i++) {
      const { stats, error } = scoresResults[i];
      if (error || !stats) {
        console.warn(
          `Erreur lors du chargement du score pour le groupe ${groups[i].id}:`,
          error
        );
        continue;
      }

      const groupScore = stats.score || stats.total_points || 0;
      total_points += groupScore;
      correct_predictions += stats.correct_predictions || 0;
      total_predictions += stats.total_predictions || 0;
      exact_scores += stats.exact_scores || 0;

      group_scores.push({
        group_id: groups[i].id,
        group_name: groups[i].name,
        score: groupScore,
        correct_predictions: stats.correct_predictions || 0,
        accuracy: stats.accuracy || 0,
      });
    }

    // Calculer le taux de précision global
    const accuracy =
      total_predictions > 0
        ? Math.round((correct_predictions / total_predictions) * 100)
        : 0;

    const aggregatedStats: AggregatedStats = {
      total_points,
      groups_count: groups.length,
      correct_predictions,
      total_predictions,
      exact_scores,
      accuracy,
      group_scores,
    };

    return {
      stats: aggregatedStats,
      error: null,
    };
  } catch (err) {
    console.error("Erreur lors de l'agrégation des statistiques:", err);
    return {
      stats: null,
      error: "Erreur lors de l'agrégation des statistiques",
    };
  }
}
