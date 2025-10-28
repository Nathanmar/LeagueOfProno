import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("groups/:id", "routes/groups.$id.tsx"),
  route("profile", "routes/profile.tsx"),
  route("*", "routes/[...404].tsx"),
] satisfies RouteConfig;
