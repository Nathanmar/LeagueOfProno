import { Hono } from "hono";
import type { HonoWithConvex } from "convex-helpers/server/hono";
import { HttpRouterWithHono } from "convex-helpers/server/hono";
import type { ActionCtx } from "./_generated/server.js";
import { httpAction } from "./_generated/server.js";

// ✅ Import des références Convex (auto-générées)
import { api } from "./_generated/api.js";

const app: HonoWithConvex<ActionCtx> = new Hono();

app.get("/hello", (c) => c.text("Hello from Hono + Convex!"));

export default new HttpRouterWithHono(app);

// ✅ Utilisation correcte de la référence Convex
export const getMatches = httpAction(async (ctx) => {
  const data = await ctx.runQuery(api.matches.listMatches);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});

export const getGroups = httpAction(async (ctx) => {
  const data = await ctx.runQuery(api.groups.listGroups);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});

export const getPredictions = httpAction(async (ctx) => {
  const data = await ctx.runQuery(api.groups.listPredictions);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});