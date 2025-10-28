import type { Session, User } from "lucia";
import type { HonoRequest } from "hono";

type Bindings = {
  DATABASE_URL: string;
  PUBLIC_API_URL: string;
  PRIVATE_API_PORT: string;
};

type Variables = {
  user: User | null;
  session: Session | null;
};

// For future use with Hono type system
export type AppContext = {
  Bindings: Bindings;
  Variables: Variables;
};
