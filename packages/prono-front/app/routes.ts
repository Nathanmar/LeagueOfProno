import type { RouteConfig } from "@react-router/dev/routes";
import { index, route, layout } from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),
	route("auth", "routes/auth.tsx"),
	route("dashboard", "routes/dashboard.tsx"),
	route("friends", "routes/friends.tsx"),
	route("shop", "routes/shop.tsx"),
	route("profile", "routes/profile.tsx"),
	route("groups/:id", "routes/groups.$id.tsx"),
	route("*", "routes/[...404].tsx"),
] satisfies RouteConfig;
