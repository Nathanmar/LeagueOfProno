/**
 * Mock Data pour League of Prono
 * Dans votre application réelle, ces données viendront de Convex
 */

export interface User {
  id: string;
  name: string;
  email: string;
  total_points: number;
  badges: string[];
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  description?: string;
  members: string[];
  created_by: string;
}

export interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_date: number;
  tournament: string;
  status: "upcoming" | "live" | "completed";
  winner?: "team_a" | "team_b";
  score_a?: number;
  score_b?: number;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  group_id: string;
  predicted_winner: "team_a" | "team_b";
  predicted_score_a?: number;
  predicted_score_b?: number;
  points_earned: number;
  is_correct: boolean;
  is_exact_score: boolean;
}

// Utilisateur actuel (mocké)
export const currentUser: User = {
  id: "68ff41ed427e6e91197d5f27",
  name: "PronoMaster",
  email: "user@leagueofprono.com",
  total_points: 47,
  badges: ["premier_prono", "perfect_score"]
};

// Autres utilisateurs
export const users: User[] = [
  currentUser,
  {
    id: "user_002",
    name: "FakerFan",
    email: "faker@example.com",
    total_points: 52,
    badges: ["premier_prono", "serie_5"]
  },
  {
    id: "user_003",
    name: "T1Believer",
    email: "t1@example.com",
    total_points: 38,
    badges: ["premier_prono"]
  },
  {
    id: "user_004",
    name: "G2Army",
    email: "g2@example.com",
    total_points: 29,
    badges: ["premier_prono"]
  }
];

// Groupes
export const groups: Group[] = [
  {
    id: "68ff444219c8249f0bdd47e8",
    name: "Les foufous de M8",
    invite_code: "HRQO3ACS",
    description: "",
    members: ["68ff41ed427e6e91197d5f27", "user_002", "user_003", "user_004"],
    created_by: "68ff41ed427e6e91197d5f27"
  },
  {
    id: "group_002",
    name: "LEC Fans",
    invite_code: "LEC2024X",
    description: "Pour les vrais fans de la LEC",
    members: ["68ff41ed427e6e91197d5f27", "user_002"],
    created_by: "user_002"
  }
];

// Matchs
export const matches: Match[] = [
  // Matchs en cours (LIVE)
  {
    id: "match_live_001",
    team_a: "T1",
    team_b: "Gen.G",
    match_date: new Date().getTime(),
    tournament: "Worlds 2025 - Finals",
    status: "live",
    score_a: 1,
    score_b: 0
  },
  {
    id: "match_live_002",
    team_a: "G2 Esports",
    team_b: "Fnatic",
    match_date: new Date().getTime(),
    tournament: "LEC Summer Playoffs",
    status: "live",
    score_a: 2,
    score_b: 1
  },
  // Matchs à venir
  {
    id: "match_001",
    team_a: "Cloud9",
    team_b: "Team Liquid",
    match_date: new Date("2025-11-12T20:00:00").getTime(),
    tournament: "LCS Finals",
    status: "upcoming"
  },
  {
    id: "match_002",
    team_a: "JD Gaming",
    team_b: "Bilibili Gaming",
    match_date: new Date("2025-11-08T12:00:00").getTime(),
    tournament: "LPL Summer",
    status: "upcoming"
  },
  {
    id: "match_003",
    team_a: "MAD Lions",
    team_b: "Rogue",
    match_date: new Date("2025-11-09T18:00:00").getTime(),
    tournament: "LEC Summer",
    status: "upcoming"
  },
  // Matchs terminés
  {
    id: "match_005",
    team_a: "T1",
    team_b: "DRX",
    match_date: new Date("2025-10-20T18:00:00").getTime(),
    tournament: "Worlds 2025 - Semi Finals",
    status: "completed",
    winner: "team_a",
    score_a: 3,
    score_b: 1
  },
  {
    id: "match_006",
    team_a: "G2 Esports",
    team_b: "MAD Lions",
    match_date: new Date("2025-10-18T16:00:00").getTime(),
    tournament: "LEC Summer",
    status: "completed",
    winner: "team_a",
    score_a: 3,
    score_b: 2
  },
  {
    id: "match_007",
    team_a: "Gen.G",
    team_b: "KT Rolster",
    match_date: new Date("2025-10-15T14:00:00").getTime(),
    tournament: "LCK Summer Finals",
    status: "completed",
    winner: "team_b",
    score_a: 2,
    score_b: 3
  },
  {
    id: "match_008",
    team_a: "Fnatic",
    team_b: "Team Vitality",
    match_date: new Date("2025-10-12T17:00:00").getTime(),
    tournament: "LEC Summer",
    status: "completed",
    winner: "team_a",
    score_a: 3,
    score_b: 0
  }
];

// Pronostics
export const predictions: Prediction[] = [
  // Pronostics pour matchs LIVE
  {
    id: "pred_live_001",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_live_001",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_live_002",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_live_002",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 0,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_live_003",
    user_id: "user_002",
    match_id: "match_live_001",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_b",
    predicted_score_a: 2,
    predicted_score_b: 3,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_live_004",
    user_id: "user_003",
    match_id: "match_live_001",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 2,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  // Pronostics pour matchs à venir
  {
    id: "pred_001",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_001",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 2,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_002",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_002",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  // Pronostics pour matchs terminés
  {
    id: "pred_005",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_005",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 5,
    is_correct: true,
    is_exact_score: true
  },
  {
    id: "pred_006",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_006",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 0,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_007",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_007",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_008",
    user_id: "68ff41ed427e6e91197d5f27",
    match_id: "match_008",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 0,
    points_earned: 5,
    is_correct: true,
    is_exact_score: true
  },
  // Pronostics des autres utilisateurs
  {
    id: "pred_101",
    user_id: "user_002",
    match_id: "match_005",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 2,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_102",
    user_id: "user_002",
    match_id: "match_006",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 2,
    points_earned: 5,
    is_correct: true,
    is_exact_score: true
  },
  {
    id: "pred_103",
    user_id: "user_002",
    match_id: "match_007",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_b",
    predicted_score_a: 2,
    predicted_score_b: 3,
    points_earned: 5,
    is_correct: true,
    is_exact_score: true
  },
  {
    id: "pred_104",
    user_id: "user_002",
    match_id: "match_008",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_201",
    user_id: "user_003",
    match_id: "match_005",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 0,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_202",
    user_id: "user_003",
    match_id: "match_006",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_b",
    predicted_score_a: 1,
    predicted_score_b: 3,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_203",
    user_id: "user_003",
    match_id: "match_007",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 2,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_204",
    user_id: "user_003",
    match_id: "match_008",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_301",
    user_id: "user_004",
    match_id: "match_005",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_b",
    predicted_score_a: 1,
    predicted_score_b: 3,
    points_earned: 0,
    is_correct: false,
    is_exact_score: false
  },
  {
    id: "pred_302",
    user_id: "user_004",
    match_id: "match_006",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 1,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_303",
    user_id: "user_004",
    match_id: "match_007",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_b",
    predicted_score_a: 1,
    predicted_score_b: 3,
    points_earned: 3,
    is_correct: true,
    is_exact_score: false
  },
  {
    id: "pred_304",
    user_id: "user_004",
    match_id: "match_008",
    group_id: "68ff444219c8249f0bdd47e8",
    predicted_winner: "team_a",
    predicted_score_a: 3,
    predicted_score_b: 0,
    points_earned: 5,
    is_correct: true,
    is_exact_score: true
  }
];

// Fonction helper pour calculer le score total d'un utilisateur dans un groupe
export function calculateUserScoreInGroup(userId: string, groupId: string): number {
  return predictions
    .filter(p => p.user_id === userId && p.group_id === groupId)
    .reduce((total, p) => total + p.points_earned, 0);
}

// Fonction helper pour obtenir le classement d'un groupe
export function getGroupLeaderboard(groupId: string) {
  const group = groups.find(g => g.id === groupId);
  if (!group) return [];

  return group.members
    .map(memberId => {
      const user = users.find(u => u.id === memberId);
      const score = calculateUserScoreInGroup(memberId, groupId);
      return {
        userId: memberId,
        userName: user?.name || "Unknown",
        score
      };
    })
    .sort((a, b) => b.score - a.score);
}

// Badges disponibles
export const availableBadges = [
  {
    id: "premier_prono",
    name: "Premier Pronostic",
    description: "Faire son premier pronostic",
    icon: "🎯"
  },
  {
    id: "perfect_score",
    name: "Score Parfait",
    description: "Prédire le score exact d'un match",
    icon: "💯"
  },
  {
    id: "serie_5",
    name: "Série de 5",
    description: "5 pronostics corrects d'affilée",
    icon: "🔥"
  },
  {
    id: "expert",
    name: "Expert",
    description: "Atteindre 100 points",
    icon: "🏆"
  },
  {
    id: "visionnaire",
    name: "Visionnaire",
    description: "10 scores parfaits",
    icon: "🔮"
  }
];
