import { mutation } from "../_generated/server.js";

export const simulateTick = mutation(async ({ db }) => {
  const matches = await db.query("Match").collect();

  // Chercher le match en cours
  let currentMatch = matches.find((m) => m.status === "ongoing");

  // Si aucun match en cours, on démarre le prochain
  if (!currentMatch) {
    const next = matches.find((m) => m.status === "upcoming");

    if (next) {
      await db.patch(next._id, { status: "ongoing" });
      console.log(`🟢 Nouveau match en cours : ${next.team_a} vs ${next.team_b}`);
      return;
    }

    // Plus de matchs → création d’un nouveau
    const teams = ["T1", "Gen.G", "JD Gaming", "BLG", "G2", "Fnatic"];
    const teamA = teams[Math.floor(Math.random() * teams.length)];
    let teamB = teamA;
    while (teamB === teamA) teamB = teams[Math.floor(Math.random() * teams.length)];

    await db.insert("Match", {
      created_by: "system",
      created_by_id: "system",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      id: crypto.randomUUID(),
      is_sample: "",
      match_date: new Date().toISOString(),
      score_a: "0",
      score_b: "0",
      status: "ongoing",
      team_a: teamA,
      team_a_logo: "",
      team_b: teamB,
      team_b_logo: "",
      tournament: "Simulated League",
      winner: "none",
    });

    console.log(`⚙️ Création d’un nouveau match : ${teamA} vs ${teamB}`);
    return;
  }

  // Simulation du score
  const scoreA = parseInt(currentMatch.score_a || "0", 10);
  const scoreB = parseInt(currentMatch.score_b || "0", 10);

  const randomTeam = Math.random() > 0.5 ? "a" : "b";
  const newScoreA = randomTeam === "a" ? scoreA + 1 : scoreA;
  const newScoreB = randomTeam === "b" ? scoreB + 1 : scoreB;

  await db.patch(currentMatch._id, {
    score_a: newScoreA.toString(),
    score_b: newScoreB.toString(),
    updated_date: new Date().toISOString(),
  });

  console.log(`🎮 ${currentMatch.team_a} ${newScoreA} - ${newScoreB} ${currentMatch.team_b}`);

  // Si un score atteint 10, on termine le match
  if (newScoreA >= 10 || newScoreB >= 10) {
    const winner = newScoreA > newScoreB ? currentMatch.team_a : currentMatch.team_b;

    await db.patch(currentMatch._id, {
      status: "finished",
      winner,
      updated_date: new Date().toISOString(),
    });

    console.log(`🏁 Match terminé : ${winner} gagne (${newScoreA} - ${newScoreB})`);
  }
});
