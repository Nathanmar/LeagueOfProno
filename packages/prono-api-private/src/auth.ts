import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

interface DatabaseUserAttributes {
  username: string;
  email: string;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

const client = new PrismaClient();

// @ts-expect-error Prisma client models are dynamically generated
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? ("strict" as const) : ("none" as const),
    },
  },
  getUserAttributes: (attributes: DatabaseUserAttributes) => {
    return {
      username: attributes.username,
      email: attributes.email,
    };
  },
});

export const prisma = client;
