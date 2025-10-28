import { Hono } from "hono";
import { HttpRouterWithHono, type HonoWithConvex } from "convex-helpers/server/hono"; 
import type { ActionCtx } from "./_generated/server.js";

import { api } from "./_generated/api.js";

const app: HonoWithConvex<ActionCtx> = new Hono(); 

app.get("/hello", (c) => c.text("Bonjour de Hono + Convex!"));

const getActionCtx = (c: any): ActionCtx => {

    if (!c.runQuery) {
        throw new Error("ActionCtx is missing runQuery property.");
    }
    return c as ActionCtx;
};


app.get("/matches", async (c) => {
  try {

   const ctx = c.env; 
        const data = await ctx.runQuery(api.matches.listMatches);
        return c.json(data);
  } catch (e: any) {
    console.error("Erreur runtime dans /matches:", e.message);
    return c.json({ success: false, error: "Contexte Convex non initialisé." }, 500);
  }
});


app.get("/groups", async (c) => {
  try {

   const ctx = c.env; 
        const data = await ctx.runQuery(api.groups.listGroups);
        return c.json(data);
  } catch (e: any) {
    console.error("Erreur runtime dans /groups:", e.message);
    return c.json({ success: false, error: "Contexte Convex non initialisé." }, 500);
  }
});


app.get("/predictions", async (c) => {
  try {
    const actionCtx = getActionCtx(c);
    const data = await actionCtx.runQuery(api.predictions.listPredictions); 
    return c.json(data);
  } catch (e: any) {
    return c.json({ success: false, error: "Contexte Convex non initialisé." }, 500);
  }
});


// Exportation par défaut : C'est cette ligne qui lie le routeur Hono au système Convex.
export default new HttpRouterWithHono(app);
