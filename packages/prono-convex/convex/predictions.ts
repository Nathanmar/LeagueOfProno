import { query } from "./_generated/server.js";

export const listPredictions = query(async ({ db }) => {
  return await db.query("Prediction").collect();
});