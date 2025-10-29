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
    exposeHeaders: ["Set-Cookie"],
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
    console.log(`[MATCHES] Fetching from: ${publicApiUrl}/matches`);
    
    const response = await fetch(`${publicApiUrl}/matches`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MATCHES] Response not OK: ${response.status}`, errorText);
      throw new Error(`Failed to fetch matches from public API: ${response.status} ${errorText}`);
    }

    const matches = await response.json();
    console.log(`[MATCHES] Successfully fetched ${matches.length || 0} matches`);
    
    const user = c.get("user") as User | null;

    return c.json({
      matches,
      userId: user?.id || "anonymous",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[MATCHES] Error fetching matches:", errorMessage);
    return c.json(
      { error: "Failed to fetch matches", details: errorMessage },
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
app.get("/api/groups", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Récupérer tous les groupes de l'utilisateur
    const userGroups = await prisma.userGroup.findMany({
      where: { user_id: user.id },
      include: {
        Group: {
          include: {
            UserGroup: true,
          },
        },
      },
    });

    const groups = userGroups.map(
      (ug: {
        Group: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          created_by_id: string;
          UserGroup: Array<{ user_id: string }>;
          created_at: Date;
        };
        score: number;
      }) => ({
        id: ug.Group.id,
        name: ug.Group.name,
        description: ug.Group.description,
        invite_code: ug.Group.invite_code,
        created_by: ug.Group.created_by_id,
        members: ug.Group.UserGroup.map((ugMember) => ugMember.user_id),
        created_at: ug.Group.created_at,
        score: ug.score,
      })
    );

    return c.json(
      {
        groups,
        userId: user.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user groups:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return c.json(
      { error: "Failed to fetch groups", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

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

// Routes Prédictions des groupes
app.get("/api/groups/:id/predictions", async (c) => {
	const user = c.get("user") as User | null;
	const groupId = c.req.param("id");

	if (!user) {
		return c.json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
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

		// Récupérer toutes les prédictions du groupe
		const predictions = await prisma.prediction.findMany({
			where: { group_id: groupId },
			include: {
				User: true,
				Match: true,
			},
		});

		return c.json({
			predictions: predictions.map(
				(p: {
					id: string;
					match_id: string;
					user_id: string;
					group_id: string;
					predicted_winner: string | null;
					predicted_score_a: number | null;
					predicted_score_b: number | null;
					is_correct: boolean | null;
					is_exact_score: boolean | null;
					points_earned: number;
					User: { username: string } | null;
				}) => ({
					id: p.id,
					match_id: p.match_id,
					user_id: p.user_id,
					user_name: p.User?.username || "Unknown",
					group_id: p.group_id,
					prediction: "",
					predicted_winner: p.predicted_winner,
					predicted_score_a: p.predicted_score_a,
					predicted_score_b: p.predicted_score_b,
					is_correct: p.is_correct,
					is_exact_score: p.is_exact_score,
					points_earned: p.points_earned,
				})
			),
			groupId,
		});
	} catch (error) {
		console.error("Error fetching group predictions:", error);
		return c.json(
			{ error: "Failed to fetch predictions", details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
});

app.get("/api/groups/:id/matches/:matchId/predictions", async (c) => {
	const user = c.get("user") as User | null;
	const groupId = c.req.param("id");
	const matchId = c.req.param("matchId");

	if (!user) {
		return c.json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
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

		// Récupérer les prédictions du match pour ce groupe
		const predictions = await prisma.prediction.findMany({
			where: {
				group_id: groupId,
				match_id: matchId,
			},
			include: {
				User: true,
				Match: true,
			},
		});

		return c.json({
			predictions: predictions.map(
				(p: {
					id: string;
					match_id: string;
					user_id: string;
					group_id: string;
					predicted_winner: string | null;
					predicted_score_a: number | null;
					predicted_score_b: number | null;
					is_correct: boolean | null;
					is_exact_score: boolean | null;
					points_earned: number;
				}) => ({
					id: p.id,
					match_id: p.match_id,
					user_id: p.user_id,
					group_id: p.group_id,
					prediction: "",
					predicted_winner: p.predicted_winner,
					predicted_score_a: p.predicted_score_a,
					predicted_score_b: p.predicted_score_b,
					is_correct: p.is_correct,
				is_exact_score: p.is_exact_score,
				points_earned: p.points_earned,
			})),
			groupId,
			matchId,
		});
	} catch (error) {
		console.error("Error fetching match predictions:", error);
		return c.json(
			{ error: "Failed to fetch predictions", details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
});

app.post("/api/groups/:id/matches/:matchId/predict", async (c) => {
	const user = c.get("user") as User | null;
	const groupId = c.req.param("id");
	const matchId = c.req.param("matchId");

	if (!user) {
		return c.json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
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

		const body = await c.req.json();
		const { predicted_winner, predicted_score_a, predicted_score_b } = body as {
			predicted_winner?: string;
			predicted_score_a?: number;
			predicted_score_b?: number;
		};

		if (!predicted_winner) {
			return c.json({ error: "Predicted winner is required" }, { status: 400 });
		}

		// Vérifier que le match existe dans la base de données
		let match = await prisma.match.findUnique({
			where: { id: matchId },
		});

		// Si le match n'existe pas, le créer avec des données minimales
		if (!match) {
			console.log(`[PREDICTION] Match ${matchId} not found, creating it...`);
			
			// Récupérer le match de l'API publique pour les détails
			const publicApiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";
			const publicResponse = await fetch(`${publicApiUrl}/matches/${matchId}`);
			const publicMatchData = publicResponse.ok ? await publicResponse.json() : null;

			// Créer ou récupérer les équipes
			const teamAName = publicMatchData?.team_a || "Team A";
			const teamBName = publicMatchData?.team_b || "Team B";

			let teamA = await prisma.team.findFirst({
				where: { name: teamAName },
			});
			if (!teamA) {
				teamA = await prisma.team.create({
					data: {
						id: uuidv4(),
						name: teamAName,
					},
				});
			}

			let teamB = await prisma.team.findFirst({
				where: { name: teamBName },
			});
			if (!teamB) {
				teamB = await prisma.team.create({
					data: {
						id: uuidv4(),
						name: teamBName,
					},
				});
			}

			// Créer le match
			const matchTime = new Date(publicMatchData?.match_date || publicMatchData?.scheduled_at || new Date());
			match = await prisma.match.create({
				data: {
					id: matchId,
					team_a_id: teamA.id,
					team_b_id: teamB.id,
					match_time: matchTime,
					status: (publicMatchData?.status as "upcoming" | "live" | "finished" | "cancelled") || "upcoming",
				},
			});
			console.log("[PREDICTION] Match", matchId, "created successfully");
		}

		// Vérifier s'il existe déjà une prédiction
		const existingPrediction = await prisma.prediction.findFirst({
			where: {
				user_id: user.id,
				match_id: matchId,
				group_id: groupId,
			},
		});

		let prediction: {
			id: string;
			match_id: string;
			user_id: string;
			group_id: string;
			predicted_winner: string | null;
			predicted_score_a: number | null;
			predicted_score_b: number | null;
			is_correct: boolean | null;
			is_exact_score: boolean | null;
			points_earned: number;
			created_at: Date;
			updated_at: Date;
		};
		if (existingPrediction) {
			// Mettre à jour la prédiction existante
			prediction = await prisma.prediction.update({
				where: { id: existingPrediction.id },
				data: {
					predicted_winner,
					predicted_score_a: predicted_score_a || null,
					predicted_score_b: predicted_score_b || null,
					updated_at: new Date(),
				},
			});
		} else {
			// Créer une nouvelle prédiction
			prediction = await prisma.prediction.create({
				data: {
					id: uuidv4(),
					user_id: user.id,
					match_id: matchId,
					group_id: groupId,
					predicted_winner,
					predicted_score_a: predicted_score_a || null,
					predicted_score_b: predicted_score_b || null,
				},
			});
		}

		return c.json(
			{
				prediction: {
					id: prediction.id,
					match_id: prediction.match_id,
					user_id: prediction.user_id,
					group_id: prediction.group_id,
					prediction: "",
					predicted_winner: prediction.predicted_winner,
					predicted_score_a: prediction.predicted_score_a,
					predicted_score_b: prediction.predicted_score_b,
					is_correct: prediction.is_correct,
					is_exact_score: prediction.is_exact_score,
					points_earned: prediction.points_earned,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error saving prediction:", error);
		return c.json(
			{ error: "Failed to save prediction", details: error instanceof Error ? error.message : String(error) },
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
    // Récupérer l'utilisateur depuis Prisma pour avoir les données complètes
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userProfile) {
      return c.json({ error: "User not found" }, { status: 404 });
    }

    // Récupérer les badges de l'utilisateur (parsé du JSON stocké)
    const userBadges = userProfile.badges
      ? JSON.parse(userProfile.badges as string)
      : [];

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
app.get("/api/friends", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Récupérer les amis acceptés (où l'utilisateur est soit requester soit receiver et status = accepted)
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { requester_id: user.id, status: "accepted" },
          { receiver_id: user.id, status: "accepted" },
        ],
      },
      include: {
        User_FriendRequest_receiver_idToUser: true,
        User_FriendRequest_requester_idToUser: true,
      },
    });

    // Mapper les résultats pour retourner les amis (pas l'utilisateur lui-même)
    const friends = friendRequests.map(
      (fr: {
        requester_id: string;
        User_FriendRequest_receiver_idToUser: {
          id: string;
          username: string;
          avatar_url: string | null;
          total_points: number;
        };
        User_FriendRequest_requester_idToUser: {
          id: string;
          username: string;
          avatar_url: string | null;
          total_points: number;
        };
      }) => {
        const friend = fr.requester_id === user.id
          ? fr.User_FriendRequest_receiver_idToUser
          : fr.User_FriendRequest_requester_idToUser;
        return {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar_url,
          score: friend.total_points || 0,
        };
      }
    );

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

// Route pour envoyer une demande d'ami par email
app.post("/api/friend-requests", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await c.req.json();
    const { email } = body as { email?: string };

    if (!email) {
      return c.json({ error: "Email is required" }, { status: 400 });
    }

    // Chercher l'utilisateur par email
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return c.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.id === user.id) {
      return c.json({ error: "Cannot add yourself as a friend" }, { status: 400 });
    }

    // Vérifier si une demande existe déjà
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requester_id: user.id, receiver_id: targetUser.id },
          { requester_id: targetUser.id, receiver_id: user.id },
        ],
      },
    });

    if (existingRequest) {
      return c.json(
        { error: "Friend request already exists" },
        { status: 400 }
      );
    }

    // Créer la demande d'ami
    await prisma.friendRequest.create({
      data: {
        id: uuidv4(),
        requester_id: user.id,
        receiver_id: targetUser.id,
        status: "pending",
      },
    });

    return c.json({
      message: "Friend request sent",
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return c.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
});

// Route pour récupérer les demandes d'ami reçues
app.get("/api/friend-requests", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Récupérer les demandes d'ami reçues
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiver_id: user.id,
        status: "pending",
      },
      include: {
        User_FriendRequest_requester_idToUser: true,
      },
    });

    const requests = friendRequests.map(
      (fr: {
        id: string;
        status: "pending" | "accepted" | "rejected" | "blocked";
        created_at: Date;
        User_FriendRequest_requester_idToUser: {
          id: string;
          username: string;
        };
      }) => ({
        id: fr.id,
        from_user_id: fr.User_FriendRequest_requester_idToUser.id,
        from_username: fr.User_FriendRequest_requester_idToUser.username,
        status: fr.status,
        created_at: fr.created_at.toISOString(),
      })
    );

    return c.json({
      requests,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return c.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 }
    );
  }
});

// Route pour accepter une demande d'ami
app.post("/api/friend-requests/:requestId/accept", async (c) => {
  const user = c.get("user") as User | null;
  const requestId = c.req.param("requestId");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Chercher la demande
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return c.json({ error: "Friend request not found" }, { status: 404 });
    }

    if (friendRequest.receiver_id !== user.id) {
      return c.json(
        { error: "You can only accept your own friend requests" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });

    return c.json({
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return c.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
});

// Route pour refuser une demande d'ami
app.post("/api/friend-requests/:requestId/reject", async (c) => {
  const user = c.get("user") as User | null;
  const requestId = c.req.param("requestId");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Chercher la demande
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return c.json({ error: "Friend request not found" }, { status: 404 });
    }

    if (friendRequest.receiver_id !== user.id) {
      return c.json(
        { error: "You can only reject your own friend requests" },
        { status: 403 }
      );
    }

    // Supprimer la demande
    await prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return c.json({
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return c.json(
      { error: "Failed to reject friend request" },
      { status: 500 }
    );
  }
});

app.delete("/api/friends/:id", async (c) => {
  const user = c.get("user") as User | null;
  const friendId = c.req.param("id");

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Supprimer une amitié (demande acceptée)
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requester_id: user.id, receiver_id: friendId, status: "accepted" },
          { requester_id: friendId, receiver_id: user.id, status: "accepted" },
        ],
      },
    });

    if (!friendRequest) {
      return c.json({ error: "Friend not found" }, { status: 404 });
    }

    // Supprimer la demande d'ami
    await prisma.friendRequest.delete({
      where: { id: friendRequest.id },
    });

    return c.json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error removing friend:", error);
    return c.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
});

// Routes Profil
app.get("/api/profile", async (c) => {
  const user = c.get("user") as User | null;

  if (!user) {
    return c.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Récupérer les infos complètes de l'utilisateur depuis Prisma
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userProfile) {
      return c.json({ error: "User not found" }, { status: 404 });
    }

    // Récupérer les stats de l'utilisateur
    const userGroups = await prisma.userGroup.count({
      where: { user_id: user.id },
    });

    const acceptedFriends = await prisma.friendRequest.count({
      where: {
        OR: [
          { requester_id: user.id, status: "accepted" },
          { receiver_id: user.id, status: "accepted" },
        ],
      },
    });

    // Compter les prédictions totales
    const totalPredictions = await prisma.prediction.count({
      where: { user_id: user.id },
    });

    // Compter les prédictions correctes
    const correctPredictions = await prisma.prediction.count({
      where: {
        user_id: user.id,
        is_correct: true,
      },
    });

    const profile = {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      avatar: userProfile.avatar_url,
      score: userProfile.total_points || 0,
      predictions_count: totalPredictions,
      wins_count: correctPredictions,
      groups_count: userGroups,
      friends_count: acceptedFriends,
    };

    return c.json({
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
});

// Erreur 404
app.notFound((c) => {
  return c.json({ error: "Not Found" }, { status: 404 });
});

// Route pour calculer les points d'un match terminé
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.post("/api/matches/:matchId/calculate-points", async (c) => {
	const user = c.get("user") as User | null;
	const matchId = c.req.param("matchId");

	if (!user) {
		return c.json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
		// Récupérer d'abord les données du match de l'API publique
		const publicApiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";
		const publicResponse = await fetch(`${publicApiUrl}/matches/${matchId}`);
		const publicMatchData = publicResponse.ok ? await publicResponse.json() : null;

		console.log("[POINTS] Public API match data:", publicMatchData);

		// Récupérer le match de la BD locale
		let match = await prisma.match.findUnique({
			where: { id: matchId },
			include: {
				Team_Match_team_a_idToTeam: true,
				Team_Match_team_b_idToTeam: true,
			},
		});

		if (!match) {
			return c.json({ error: "Match not found" }, { status: 404 });
		}

		// Mettre à jour le match avec les données de l'API publique si disponibles
		if (publicMatchData) {
			match = await prisma.match.update({
				where: { id: matchId },
				data: {
					status: (publicMatchData.status as "upcoming" | "live" | "finished" | "cancelled") || match.status,
					result_score_a: publicMatchData.score_a ?? match.result_score_a,
					result_score_b: publicMatchData.score_b ?? match.result_score_b,
				},
				include: {
					Team_Match_team_a_idToTeam: true,
					Team_Match_team_b_idToTeam: true,
				},
			});
			console.log("[POINTS] Match updated:", matchId, ", new status:", match.status);
		}

		// Vérifier que le match est maintenant "finished"
		if (match.status !== "finished") {
			return c.json(
				{ error: "Match is not finished", status: match.status },
				{ status: 400 }
			);
		}

		// Récupérer toutes les prédictions pour ce match
		const predictions = await prisma.prediction.findMany({
			where: { match_id: matchId },
		});

		// Calculer les points pour chaque prédiction
		let updatedCount = 0;
		for (const prediction of predictions) {
			const result_score_a = match.result_score_a || 0;
			const result_score_b = match.result_score_b || 0;
			const actualWinner =
				result_score_a > result_score_b
					? "team_a"
					: result_score_a < result_score_b
						? "team_b"
						: null;

			// Vérifier si la prédiction du gagnant est correcte
			const isCorrect = prediction.predicted_winner === actualWinner;

			// Vérifier si le score exact est correcte
			const isExactScore =
				isCorrect &&
				prediction.predicted_score_a === result_score_a &&
				prediction.predicted_score_b === result_score_b;

			// Calculer les points
			let points = 0;
			if (isCorrect) {
				points = 3; // 3 points pour le gagnant correct
				if (isExactScore) {
					points += 2; // 2 points bonus pour le score exact
				}
			}

			// Mettre à jour la prédiction avec les résultats et points
			await prisma.prediction.update({
				where: { id: prediction.id },
				data: {
					is_correct: isCorrect,
					is_exact_score: isExactScore,
					points_earned: points,
					updated_at: new Date(),
				},
			});

			updatedCount += 1;
		}

		return c.json({
			message: "Points calculated successfully",
			match_id: matchId,
			predictions_updated: updatedCount,
		});
	} catch (error) {
		console.error("Error calculating points:", error);
		return c.json(
			{
				error: "Failed to calculate points",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
});

// Route pour récupérer les points de l'utilisateur dans un groupe
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get("/api/groups/:id/user-stats", async (c) => {
	const user = c.get("user") as User | null;
	const groupId = c.req.param("id");

	if (!user) {
		return c.json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
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

		// Récupérer les prédictions de l'utilisateur pour ce groupe
		const predictions = await prisma.prediction.findMany({
			where: {
				user_id: user.id,
				group_id: groupId,
			},
		});

		// Calculer les statistiques
		let totalPoints = 0;
		let correctPredictions = 0;
		let exactScores = 0;
		for (const p of predictions) {
			totalPoints += p.points_earned || 0;
			if (p.is_correct) correctPredictions += 1;
			if (p.is_exact_score) exactScores += 1;
		}
		const totalPredictions = predictions.length;

		// Mettre à jour le score dans UserGroup
		await prisma.userGroup.update({
			where: {
				user_id_group_id: {
					user_id: user.id,
					group_id: groupId,
				},
			},
			data: {
				score: totalPoints,
			},
		});

		return c.json({
			user_id: user.id,
			group_id: groupId,
			total_points: totalPoints,
			correct_predictions: correctPredictions,
			total_predictions: totalPredictions,
			exact_scores: exactScores,
			accuracy: totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0,
		});
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return c.json(
			{ error: "Failed to fetch user stats", details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
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
