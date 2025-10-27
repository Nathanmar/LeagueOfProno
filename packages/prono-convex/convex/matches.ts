import { query } from "./_generated/server.js";

export const listMatches = query(async ({ db }) => {
  return await db.query("Match").collect();
});
