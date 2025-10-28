/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
/* @ts-nocheck */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { v4 as uuidv4 } from "uuid";
import { lucia, prisma } from "./auth.js";
import { hashPassword, verifyPassword } from "./utils/password.js";
import type { Session } from "lucia";
import type { User as LuciaUser } from "lucia";

// Extend User type to include our custom fields
interface User extends LuciaUser {
  badges?: string;
}

interface AppVariables {
  user: User | null;
  session: Session | null;
}

const app = new Hono<{ Variables: AppVariables }>();

// CORS middleware - Allow requests from frontend
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Log des requêtes entrantes
app.use("*", (c, next) => {
  console.log(`[${c.req.method}] ${c.req.path}`);
  console.log("[HEADERS] Cookie:", c.req.header("cookie") || "NONE");
  console.log("[HEADERS] Origin:", c.req.header("origin") || "NONE");
  return next();
});

// Stockage des derniers matchs pour la détection des changements
let lastMatches: unknown[] = [];

// Middleware pour extraire les données de la session
app.use("*", async (c, next) => {
  const sessionId = getCookie(c, "auth_session");
  console.log("[AUTH] Cookie auth_session:", sessionId ? `${sessionId.substring(0, 20)}...` : "NOT FOUND");

  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  try {
    const { session, user } = await lucia.validateSession(sessionId);
    console.log("[AUTH] Validated session:", session?.id ? `${session.id.substring(0, 20)}...` : "null");
    console.log("[AUTH] Validated user:", user?.id ? `${user.id.substring(0, 20)}...` : "null");
    
    if (session?.fresh) {
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
    }
    if (!session) {
      c.header(
        "Set-Cookie",
        lucia.createBlankSessionCookie().serialize()
      );
    }
    c.set("user", user);
    c.set("session", session);
  } catch (error) {
    console.log("[AUTH] Error validating session:", error);
    c.set("user", null);
    c.set("session", null);
  }

  return next();
});

// Routes de santé
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Routes d'authentification
app.post("/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password } = body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return c.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return c.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email,
        hashed_password: hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", sessionCookie.serialize());

    return c.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return c.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

app.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password } = body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!password || (!username && !email)) {
      return c.json(
        { error: "Missing username/email or password" },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur par username OU email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username || undefined },
          { email: email || undefined },
        ],
      },
    });

    if (!user) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = verifyPassword(password, user.hashed_password);

    if (!validPassword) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", sessionCookie.serialize());

    return c.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return c.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

app.post("/auth/logout", async (c) => {
  const session = c.get("session") as Session | null;

  if (!session) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  await lucia.invalidateSession(session.id);
  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize());

  return c.json({ message: "Logout successful" });
});

app.get("/auth/me", (c) => {
  const user = c.get("user") as User | null;
  const session = c.get("session") as Session | null;

  if (!user || !session) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  return c.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
    },
  });
});

// Routes protégées pour les données
app.get("/data/matches", async (c) => {
  try {
    // Récupérer les matchs depuis l'API publique
    const publicApiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${publicApiUrl}/matches`);

    if (!response.ok) {
      throw new Error("Failed to fetch matches from public API");
    }

    const matches = await response.json();
    lastMatches = matches;
    
    const user = c.get("user") as User | null;

    return c.json({
      matches,
      userId: user?.id || "anonymous",
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return c.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
});

// Route pour envoyer une prédiction
app.post("/data/matches/:id/predict", async (c) => {
  const user = c.get("user") as User | null;
  const matchId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await c.req.json();
    const { team1_score, team2_score, winner } = body as {
      team1_score?: number;
      team2_score?: number;
      winner?: string;
    };

    // Enregistrer la prédiction
    // À implémenter avec Prisma
    const prediction = {
      id: uuidv4(),
      matchId,
      userId: user.id,
      team1_score,
      team2_score,
      winner,
    };

    return c.json(
      { message: "Prediction saved", prediction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving prediction:", error);
    return c.json(
      { error: "Failed to save prediction" },
      { status: 500 }
    );
  }
});

// Routes Matchs
app.get("/api/matches", async (c) => {
  try {
    const publicApiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${publicApiUrl}/matches`);

    if (!response.ok) {
      throw new Error("Failed to fetch matches from public API");
    }

    const matches = await response.json();
    const user = c.get("user") as User | null;

    return c.json({
      matches,
      userId: user?.id || "anonymous",
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return c.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
});

app.get("/api/matches/:id", async (c) => {
  const matchId = c.req.param("id");

  try {
    const publicApiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${publicApiUrl}/matches/${matchId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch match from public API");
    }

    const match = await response.json();

    return c.json({ match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return c.json(
      { error: "Failed to fetch match" },
      { status: 500 }
    );
  }
});

// Helper function to generate alphanumeric invite code (10 characters)
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Routes Groupes
app.get("/api/groups/:id", async (c) => {
  const groupId = c.req.param("id");
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Récupérer le groupe
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return c.json({ error: "Group not found" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est membre du groupe
    const isMember = await prisma.userGroup.findFirst({
      where: {
        user_id: user.id,
        group_id: groupId,
      },
    });

    if (!isMember) {
      return c.json({ error: "You are not a member of this group" }, { status: 403 });
    }

    // Récupérer les membres du groupe
    const groupMembers = await prisma.userGroup.findMany({
      where: { group_id: groupId },
      include: { User: true },
    });

    return c.json(
      {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          invite_code: group.invite_code,
          created_by: group.created_by_id,
          members: groupMembers.map((ug: unknown) => (ug as { User: { id: string } }).User.id),
          created_at: group.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return c.json(
      { error: "Failed to fetch group", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

app.post("/api/groups", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await c.req.json();
    const { name, description } = body as {
      name?: string;
      description?: string;
    };

    if (!name) {
      return c.json({ error: "Group name is required" }, { status: 400 });
    }

    console.log("[GROUP] Creating group:", { name, description, created_by: user.id });

    // Générer un code d'invitation unique
    let inviteCode = generateInviteCode();
    let codeExists = true;
    
    // S'assurer que le code est unique
    while (codeExists) {
      const existing = await prisma.group.findUnique({
        where: { invite_code: inviteCode },
      });
      if (!existing) {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    console.log("[GROUP] Generated invite code:", inviteCode);

    // Créer le groupe dans la base de données
    const group = await prisma.group.create({
      data: {
        id: uuidv4(),
        name,
        description: description || "",
        invite_code: inviteCode,
        created_by_id: user.id,
      },
    });

    console.log("[GROUP] Group created in DB:", group.id);

    // Ajouter le créateur comme membre du groupe
    const userGroupEntry = await prisma.userGroup.create({
      data: {
        user_id: user.id,
        group_id: group.id,
        score: 0,
      },
    });

    console.log("[GROUP] UserGroup entry created:", { user_id: user.id, group_id: group.id });

    // Récupérer les membres du groupe
    const groupMembers = await prisma.userGroup.findMany({
      where: { group_id: group.id },
      include: { User: true },
    });

    console.log("[GROUP] Group members:", groupMembers.length);

    return c.json(
      {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          invite_code: group.invite_code,
          created_by: group.created_by_id,
          members: groupMembers.map((ug: unknown) => (ug as { User: { id: string } }).User.id),
          created_at: group.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return c.json(
      { error: "Failed to create group", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

app.post("/api/groups/:id/join", async (c) => {
  const user = c.get("user") as User | null;
  const groupId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await c.req.json();
    const { inviteCode } = body as { inviteCode?: string };

    if (!inviteCode) {
      return c.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Vérifier que le groupe existe avec le code d'invitation
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        invite_code: inviteCode,
      },
    });

    if (!group) {
      return c.json({ error: "Invalid invite code or group not found" }, { status: 404 });
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await prisma.userGroup.findFirst({
      where: {
        user_id: user.id,
        group_id: groupId,
      },
    });

    if (existingMember) {
      return c.json({ error: "User is already a member of this group" }, { status: 400 });
    }

    // Ajouter l'utilisateur au groupe
    await prisma.userGroup.create({
      data: {
        user_id: user.id,
        group_id: groupId,
        score: 0,
      },
    });

    return c.json({
      message: "Successfully joined group",
      userId: user.id,
      groupId,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return c.json(
      { error: "Failed to join group", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

app.post("/api/groups/:id/leave", async (c) => {
  const user = c.get("user") as User | null;
  const groupId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Vérifier que l'utilisateur est membre du groupe
    const userGroupEntry = await prisma.userGroup.findFirst({
      where: {
        user_id: user.id,
        group_id: groupId,
      },
    });

    if (!userGroupEntry) {
      return c.json({ error: "User is not a member of this group" }, { status: 404 });
    }

    // Supprimer l'utilisateur du groupe
    await prisma.userGroup.delete({
      where: {
        user_id_group_id: {
          user_id: user.id,
          group_id: groupId,
        },
      },
    });

    return c.json({
      message: "Successfully left group",
      userId: user.id,
      groupId,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return c.json(
      { error: "Failed to leave group", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

// Routes Badges
app.get("/api/badges", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Récupérer les badges de l'utilisateur
    const userBadges = user.badges ? JSON.parse(user.badges as string) : [];

    return c.json({
      badges: userBadges,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return c.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
});

app.post("/api/badges/unlock", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await c.req.json();
    const { badgeId } = body as { badgeId?: string };

    if (!badgeId) {
      return c.json({ error: "Badge ID is required" }, { status: 400 });
    }

    // Débloquer le badge
    // À implémenter avec Prisma

    return c.json({
      message: "Badge unlocked",
      badgeId,
    });
  } catch (error) {
    console.error("Error unlocking badge:", error);
    return c.json(
      { error: "Failed to unlock badge" },
      { status: 500 }
    );
  }
});

// Routes Amis
app.get("/data/friends", async (c) => {
  const user = c.get("user") as User | null;

  try {
    // Retourner la liste des amis de l'utilisateur
    // Pour l'instant, liste vide - à implémenter avec Prisma
    const friends: Array<{
      id: string;
      username: string;
      avatar?: string;
      score: number;
    }> = [];

    return c.json({
      friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return c.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
});

app.post("/data/friends", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await c.req.json();
    const { username } = body as { username?: string };

    if (!username) {
      return c.json({ error: "Username is required" }, { status: 400 });
    }

    // Ajouter un ami
    // À implémenter avec Prisma
    const friend = {
      id: uuidv4(),
      username,
      score: 0,
    };

    return c.json(friend, { status: 201 });
  } catch (error) {
    console.error("Error adding friend:", error);
    return c.json(
      { error: "Failed to add friend" },
      { status: 500 }
    );
  }
});

app.delete("/data/friends/:id", async (c) => {
  const user = c.get("user") as User | null;
  const friendId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Supprimer un ami
    // À implémenter avec Prisma

    return c.json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error removing friend:", error);
    return c.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
});

// Erreur 404
app.notFound((c) => {
  return c.json({ error: "Not Found" }, { status: 404 });
});

// Gestion des erreurs
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ error: "Internal Server Error" }, { status: 500 });
});

const port = Number.parseInt(process.env.PRIVATE_API_PORT || "3001");

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🔒 Private API running on http://localhost:${info.port}`);
  }
);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
