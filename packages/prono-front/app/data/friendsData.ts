/**
 * Mock Data pour le système d'amis
 */

export interface Friend {
  id: string;
  name: string;
  email: string;
  total_points: number;
  status: "accepted" | "pending" | "sent";
  avatar?: string;
  common_groups?: number;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: number;
}

// Amis de l'utilisateur actuel
export const friends: Friend[] = [
  {
    id: "user_002",
    name: "FakerFan",
    email: "faker@example.com",
    total_points: 52,
    status: "accepted",
    common_groups: 2
  },
  {
    id: "user_003",
    name: "T1Believer",
    email: "t1@example.com",
    total_points: 38,
    status: "accepted",
    common_groups: 1
  },
  {
    id: "user_004",
    name: "G2Army",
    email: "g2@example.com",
    total_points: 29,
    status: "accepted",
    common_groups: 1
  }
];

// Demandes d'amis en attente (reçues)
export const friendRequests: Friend[] = [
  {
    id: "user_005",
    name: "DoinBFan",
    email: "doinb@example.com",
    total_points: 45,
    status: "pending",
    common_groups: 0
  },
  {
    id: "user_006",
    name: "LCKWatcher",
    email: "lck@example.com",
    total_points: 31,
    status: "pending",
    common_groups: 1
  }
];

// Demandes d'amis envoyées
export const sentRequests: Friend[] = [
  {
    id: "user_007",
    name: "CapsLover",
    email: "caps@example.com",
    total_points: 41,
    status: "sent",
    common_groups: 0
  }
];

// Suggestions d'amis (utilisateurs dans les mêmes groupes)
export const friendSuggestions: Friend[] = [
  {
    id: "user_008",
    name: "PerkzFan",
    email: "perkz@example.com",
    total_points: 55,
    status: "accepted",
    common_groups: 2
  },
  {
    id: "user_009",
    name: "JankosFan",
    email: "jankos@example.com",
    total_points: 28,
    status: "accepted",
    common_groups: 1
  }
];
