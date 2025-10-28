/**
 * CONVEX SCHEMA EXAMPLE - League of Prono
 * 
 * Ce fichier contient les schémas Convex à utiliser dans votre projet réel.
 * Copiez ce contenu dans votre fichier /convex/schema.ts
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table Users - Gestion des utilisateurs
  users: defineTable({
    name: v.string(),
    email: v.string(),
    total_points: v.number(),
    badges: v.array(v.string()), // ["premier_prono", "perfect_score", "serie_5", etc.]
    created_at: v.number(),
  }).index("by_email", ["email"]),

  // Table Groups - Groupes privés pour pronostics
  groups: defineTable({
    name: v.string(),
    invite_code: v.string(), // Code unique pour rejoindre (ex: "HRQO3ACS")
    description: v.optional(v.string()),
    members: v.array(v.id("users")), // IDs des membres
    created_by: v.id("users"),
    created_at: v.number(),
  }).index("by_invite_code", ["invite_code"])
    .index("by_creator", ["created_by"]),

  // Table Matches - Matchs e-sport LoL
  matches: defineTable({
    team_a: v.string(),
    team_b: v.string(),
    match_date: v.number(), // timestamp
    tournament: v.string(),
    status: v.union(v.literal("upcoming"), v.literal("completed")),
    winner: v.optional(v.string()), // "team_a" ou "team_b"
    score_a: v.optional(v.number()),
    score_b: v.optional(v.number()),
    created_at: v.number(),
  }).index("by_status", ["status"])
    .index("by_date", ["match_date"]),

  // Table Predictions - Pronostics des utilisateurs
  predictions: defineTable({
    user_id: v.id("users"),
    match_id: v.id("matches"),
    group_id: v.id("groups"),
    predicted_winner: v.string(), // "team_a" ou "team_b"
    predicted_score_a: v.optional(v.number()),
    predicted_score_b: v.optional(v.number()),
    points_earned: v.number(), // Calculé après résultat du match
    is_correct: v.boolean(),
    is_exact_score: v.boolean(),
    created_at: v.number(),
  }).index("by_user", ["user_id"])
    .index("by_match", ["match_id"])
    .index("by_group", ["group_id"])
    .index("by_user_and_match", ["user_id", "match_id"])
    .index("by_group_and_match", ["group_id", "match_id"]),
});

/**
 * EXEMPLES DE MUTATIONS CONVEX
 */

// mutation: createGroup
// Génère un code d'invitation unique et crée un groupe
/*
export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
    
    if (!user) throw new Error("User not found");
    
    // Générer un code unique (8 caractères alphanumériques)
    const inviteCode = generateInviteCode();
    
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      invite_code: inviteCode,
      description: args.description,
      members: [user._id],
      created_by: user._id,
      created_at: Date.now(),
    });
    
    return groupId;
  },
});
*/

// mutation: joinGroup
/*
export const joinGroup = mutation({
  args: {
    invite_code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
    
    const group = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) => q.eq("invite_code", args.invite_code))
      .first();
    
    if (!group) throw new Error("Group not found");
    if (group.members.includes(user._id)) throw new Error("Already member");
    
    await ctx.db.patch(group._id, {
      members: [...group.members, user._id],
    });
    
    return group._id;
  },
});
*/

// mutation: createPrediction
/*
export const createPrediction = mutation({
  args: {
    match_id: v.id("matches"),
    group_id: v.id("groups"),
    predicted_winner: v.string(),
    predicted_score_a: v.optional(v.number()),
    predicted_score_b: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
    
    const predictionId = await ctx.db.insert("predictions", {
      user_id: user._id,
      match_id: args.match_id,
      group_id: args.group_id,
      predicted_winner: args.predicted_winner,
      predicted_score_a: args.predicted_score_a,
      predicted_score_b: args.predicted_score_b,
      points_earned: 0,
      is_correct: false,
      is_exact_score: false,
      created_at: Date.now(),
    });
    
    // Débloquer le badge "premier_prono" si c'est la première prédiction
    const userPredictions = await ctx.db
      .query("predictions")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();
    
    if (userPredictions.length === 1 && !user.badges.includes("premier_prono")) {
      await ctx.db.patch(user._id, {
        badges: [...user.badges, "premier_prono"],
      });
    }
    
    return predictionId;
  },
});
*/

// mutation: calculateMatchScores (à exécuter après qu'un match est terminé)
/*
export const calculateMatchScores = mutation({
  args: {
    match_id: v.id("matches"),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.match_id);
    if (!match || match.status !== "completed") {
      throw new Error("Match not completed");
    }
    
    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_match", (q) => q.eq("match_id", args.match_id))
      .collect();
    
    for (const prediction of predictions) {
      let points = 0;
      let isCorrect = false;
      let isExactScore = false;
      
      // Vérifier le vainqueur
      if (prediction.predicted_winner === match.winner) {
        isCorrect = true;
        points = 3;
        
        // Vérifier le score exact
        if (
          prediction.predicted_score_a === match.score_a &&
          prediction.predicted_score_b === match.score_b
        ) {
          isExactScore = true;
          points = 5; // 3 + 2 bonus
        }
      }
      
      await ctx.db.patch(prediction._id, {
        points_earned: points,
        is_correct: isCorrect,
        is_exact_score: isExactScore,
      });
      
      // Mettre à jour total_points de l'utilisateur
      const user = await ctx.db.get(prediction.user_id);
      await ctx.db.patch(user._id, {
        total_points: user.total_points + points,
      });
      
      // Débloquer badge "perfect_score" si score exact
      if (isExactScore && !user.badges.includes("perfect_score")) {
        await ctx.db.patch(user._id, {
          badges: [...user.badges, "perfect_score"],
        });
      }
    }
  },
});
*/

// Helper function pour générer un code d'invitation
/*
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
*/
