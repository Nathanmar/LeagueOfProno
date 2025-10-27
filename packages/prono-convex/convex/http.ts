import { Hono } from "hono";
import type { HonoWithConvex } from "convex-helpers/server/hono";
import { HttpRouterWithHono } from "convex-helpers/server/hono";
import type { ActionCtx } from "./_generated/server.js";

const app: HonoWithConvex<ActionCtx> = new Hono();

// Exemple de route
app.get("/hello", (c) => c.text("Hello from Hono + Convex!"));

export default new HttpRouterWithHono(app);
