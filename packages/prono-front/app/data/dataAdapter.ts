/**
 * Adaptateur pour transformer les données Convex en types utilisés par le front
 */

import type { User, Group, Match, Prediction } from "./mockData";

// Types Convex (basés sur le schéma fourni)
interface ConvexGroup {
  created_by: string;
  created_by_id: string;
  created_date: string;
  description: string;
  id: string;
  invite_code: string;
  is_sample: string;
  member_scores: Record<string, number>;
  members: string[];
  name: string;
  rankings: Array<{
    email: string;
    group_id: string;
    rank: number;
    score: number;
    user_id: string;
  }>;
  updated_date: string;
}

interface ConvexMatch {
  created_by: string;
  created_by_id: string;
  created_date: string;
  id: string;
  is_sample: string;
  match_date: string;
  score_a: string;
  score_b: string;
  status: string;
  team_a: string;
  team_a_logo: string;
  team_b: string;
  team_b_logo: string;
  tournament: string;
  updated_date: string;
  winner: string;
}

interface ConvexPrediction {
  created_by: string;
  created_by_id: string;
  created_date: string;
  group_id: string;
  id: string;
  is_correct: string;
  is_exact_score: string;
  is_sample: string;
  match_id: string;
  points_earned: string;
  predicted_score_a: string;
  predicted_score_b: string;
  predicted_winner: string;
  updated_date: string;
  user_id: string;
}

interface ConvexUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  total_points?: number;
  badges?: string[];
  created_date?: string;
  updated_date?: string;
}

/**
 * Convertit un Match Convex au format du front
 */
export function adaptConvexMatch(convexMatch: ConvexMatch | Record<string, unknown>): Match {
  // Gérer les valeurs par défaut et les conversions de types
  const parseNumber = (val: unknown): number => {
    if (val === null || val === undefined || val === "") return 0;
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  };

  const matchDate = new Date(String(convexMatch.match_date)).getTime();
  const score_a = parseNumber(convexMatch.score_a);
  const score_b = parseNumber(convexMatch.score_b);
  const status = String(convexMatch.status).toLowerCase() as "upcoming" | "live" | "completed";

  return {
    id: String(convexMatch.id) || "",
    team_a: String(convexMatch.team_a) || "",
    team_b: String(convexMatch.team_b) || "",
    match_date: matchDate || new Date().getTime(),
    tournament: String(convexMatch.tournament) || "",
    status: ["upcoming", "live", "completed"].includes(status) ? status : "upcoming",
    winner:
      convexMatch.winner && String(convexMatch.winner) !== ""
        ? (String(convexMatch.winner) as "team_a" | "team_b")
        : undefined,
    score_a: score_a > 0 ? score_a : undefined,
    score_b: score_b > 0 ? score_b : undefined,
  };
}

/**
 * Convertit une Prediction Convex au format du front
 */
export function adaptConvexPrediction(convexPred: ConvexPrediction | Record<string, unknown>): Prediction {
  const parseNumber = (val: unknown): number => {
    if (val === null || val === undefined || val === "") return 0;
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  };

  const parseBoolean = (val: unknown): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true";
    return false;
  };

  return {
    id: String(convexPred.id) || "",
    user_id: String(convexPred.user_id) || "",
    match_id: String(convexPred.match_id) || "",
    group_id: String(convexPred.group_id) || "",
    predicted_winner: (String(convexPred.predicted_winner) as "team_a" | "team_b") || "team_a",
    predicted_score_a: parseNumber(convexPred.predicted_score_a),
    predicted_score_b: parseNumber(convexPred.predicted_score_b),
    points_earned: parseNumber(convexPred.points_earned),
    is_correct: parseBoolean(convexPred.is_correct),
    is_exact_score: parseBoolean(convexPred.is_exact_score),
  };
}

/**
 * Convertit un Group Convex au format du front
 */
export function adaptConvexGroup(convexGroup: ConvexGroup | Record<string, unknown>): Group {
  return {
    id: String(convexGroup.id) || "",
    name: String(convexGroup.name) || "",
    invite_code: String(convexGroup.invite_code) || "",
    description: String(convexGroup.description) || "",
    members: Array.isArray(convexGroup.members) ? convexGroup.members : [],
    created_by: String(convexGroup.created_by) || "",
  };
}

/**
 * Convertit un User Convex au format du front
 */
export function adaptConvexUser(convexUser: ConvexUser | Record<string, unknown>): User {
  return {
    id: String(convexUser.id || convexUser._id) || "",
    name: String(convexUser.name) || "Unknown",
    email: String(convexUser.email) || "",
    total_points: Number(convexUser.total_points) || 0,
    badges: Array.isArray(convexUser.badges) ? convexUser.badges : [],
  };
}

/**
 * Vérifie si une date est dans le futur
 */
export function isFutureDate(timestamp: number): boolean {
  return timestamp > Date.now();
}

/**
 * Calcule le score total d'un utilisateur dans un groupe
 */
export function calculateUserScoreInGroup(
  userId: string,
  groupId: string,
  predictions: Prediction[]
): number {
  return predictions
    .filter((p) => p.user_id === userId && p.group_id === groupId)
    .reduce((total, p) => total + p.points_earned, 0);
}

/**
 * Obtient le classement d'un groupe
 */
export function getGroupLeaderboard(
  groupId: string,
  group: Group | undefined,
  users: User[],
  predictions: Prediction[]
) {
  if (!group) return [];

  return group.members
    .map((memberId) => {
      const user = users.find((u) => u.id === memberId);
      const score = calculateUserScoreInGroup(memberId, groupId, predictions);
      return {
        userId: memberId,
        userName: user?.name || "Unknown",
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}
