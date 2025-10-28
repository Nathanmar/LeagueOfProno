import { query } from "./_generated/server.js";

export const listGroups = query(async ({ db }) => {
  return await db.query("Group").collect();
});
