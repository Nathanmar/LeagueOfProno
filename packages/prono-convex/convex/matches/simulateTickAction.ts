import { internalAction } from "../_generated/server.js";
import { api } from "../_generated/api.js";

// Action déclenchée par le cron : elle appelle la mutation qui fait les écritures DB.
export const simulateTickAction = internalAction(async (ctx) => {
  // La fonction simulateTick est définie dans le module `matches/simulateTick`.
  // L'API générée la référence via le chemin avec slash.
  await ctx.runMutation(api["matches/simulateTick"].simulateTick);
});

export default simulateTickAction;
