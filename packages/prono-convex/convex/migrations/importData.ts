import { internalMutation } from "../_generated/server";

export const importMatches = internalMutation({
  args: {},
  handler: async (ctx) => {
    const matches = [
      {
        id: "68ff42a97d38b853ef1a2a7c",
        team_a: "T1",
        team_b: "Gen.G",
        team_a_logo: "",
        team_b_logo: "",
        match_date: "2025-11-15T18:00:00Z",
        tournament: "LCK Spring 2025",
        status: "upcoming",
        winner: "none",
        score_a: "",
        score_b: "",
        created_date: "2025-10-27T10:00:09.273000",
        updated_date: "2025-10-27T10:00:09.273000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: ""
      },
      {
        id: "68ff42a97d38b853ef1a2a7d",
        team_a: "G2 Esports",
        team_b: "Fnatic",
        team_a_logo: "",
        team_b_logo: "",
        match_date: "2025-11-16T19:00:00Z",
        tournament: "LEC Winter 2025",
        status: "upcoming",
        winner: "none",
        score_a: "",
        score_b: "",
        created_date: "2025-10-27T10:00:09.273000",
        updated_date: "2025-10-27T10:00:09.273000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: ""
      },
      {
        id: "68ff42a97d38b853ef1a2a7e",
        team_a: "Cloud9",
        team_b: "Team Liquid",
        team_a_logo: "",
        team_b_logo: "",
        match_date: "2025-11-14T17:00:00Z",
        tournament: "LCS Spring 2025",
        status: "live",
        winner: "none",
        score_a: "",
        score_b: "",
        created_date: "2025-10-27T10:00:09.273000",
        updated_date: "2025-10-27T10:00:09.273000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: ""
      },
      {
        id: "68ff42a97d38b853ef1a2a7f",
        team_a: "JD Gaming",
        team_b: "Bilibili Gaming",
        team_a_logo: "",
        team_b_logo: "",
        match_date: "2025-11-17T12:00:00Z",
        tournament: "LPL Spring 2025",
        status: "upcoming",
        winner: "none",
        score_a: "",
        score_b: "",
        created_date: "2025-10-27T10:00:09.273000",
        updated_date: "2025-10-27T10:00:09.273000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: ""
      },
      {
        id: "68ff42a97d38b853ef1a2a80",
        team_a: "DRX",
        team_b: "KT Rolster",
        team_a_logo: "",
        team_b_logo: "",
        match_date: "2025-11-18T15:00:00Z",
        tournament: "LCK Spring 2025",
        status: "upcoming",
        winner: "none",
        score_a: "",
        score_b: "",
        created_date: "2025-10-27T10:00:09.273000",
        updated_date: "2025-10-27T10:00:09.273000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: ""
      }
    ];

    const matchIds = [];
    for (const match of matches) {
      const id = await ctx.db.insert("Match", match);
      matchIds.push(id);
    }

    return { 
      message: "Matches imported successfully",
      count: matchIds.length,
      ids: matchIds
    };
  },
});

export const importLeagues = internalMutation({
  args: {},
  handler: async (ctx) => {
    const leagues = [
      {
        id: "68ff444219c8249f0bdd47e8",
        name: "Les foufous de M8",
        invite_code: "HRQO3ACS",
        description: "",
        members: ["68ff41ed427e6e91197d5f27"],
        member_scores: { "68ff41ed427e6e91197d5f27": 0 },
        created_date: "2025-10-27T10:06:58.938000",
        updated_date: "2025-10-27T10:06:58.938000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: "",
        rankings: [
          {
            user_id: "68ff41ed427e6e91197d5f27",
            email: "buangacorentin@gmail.com",
            score: 0,
            rank: 1,
            group_id: "68ff444219c8249f0bdd47e8"
          }
        ]
      }
    ];

    const leagueIds = [];
    for (const league of leagues) {
      const id = await ctx.db.insert("Group", league);
      leagueIds.push(id);
    }

    return { 
      message: "Leagues imported successfully",
      count: leagueIds.length,
      ids: leagueIds
    };
  },
});

export const importPredictions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const predictions = [
      {
        id: "68ff444bd26ad29bf5ae34a7",
        user_id: "68ff41ed427e6e91197d5f27",
        match_id: "68ff42a97d38b853ef1a2a80",
        group_id: "68ff444219c8249f0bdd47e8",
        predicted_winner: "team_b",
        predicted_score_a: "",
        predicted_score_b: "2",
        points_earned: "",
        is_correct: "",
        is_exact_score: "",
        created_date: "2025-10-27T10:07:07.999000",
        updated_date: "2025-10-27T10:14:04.865000",
        created_by_id: "68ff41ed427e6e91197d5f27",
        created_by: "buangacorentin@gmail.com",
        is_sample: ""
      }
    ];

    const predictionIds = [];
    for (const prediction of predictions) {
      const id = await ctx.db.insert("Prediction", prediction);
      predictionIds.push(id);
    }

    return { 
      message: "Predictions imported successfully",
      count: predictionIds.length,
      ids: predictionIds
    };
  },
});

export const importAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Import dans l'ordre: matches → leagues → predictions
    const matchesResult = await ctx.runMutation(api.migrations.importData.importMatches, {});
    const leaguesResult = await ctx.runMutation(api.migrations.importData.importLeagues, {});
    const predictionsResult = await ctx.runMutation(api.migrations.importData.importPredictions, {});

    return {
      message: "All data imported successfully",
      matches: matchesResult,
      leagues: leaguesResult,
      predictions: predictionsResult
    };
  },
});