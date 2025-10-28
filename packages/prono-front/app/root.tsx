import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { MetaFunction } from "react-router";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { Toaster } from "./components/ui/sonner";
import { useNavigate, useLocation } from "react-router";
import "./styles/globals.css";

export const meta: MetaFunction = () => [
	{ title: "League of Prono" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export default function Root() {
	const navigate = useNavigate();
	const location = useLocation();

	// Déterminer la vue actuelle basée sur la route
	const getCurrentView = () => {
		const pathname = location.pathname;
		if (pathname === "/" || pathname === "") return "landing";
		if (pathname === "/auth") return "auth";
		if (pathname === "/dashboard") return "dashboard";
		if (pathname === "/profile") return "profile";
		if (pathname === "/friends") return "friends";
		if (pathname === "/shop") return "shop";
		if (pathname.startsWith("/groups/")) return "group";
		return "landing";
	};

	const currentView = getCurrentView();

	const handleNavigateToProfile = () => {
		navigate("/profile");
	};

	const handleNavigateToFriends = () => {
		navigate("/friends");
	};

	const handleNavigateToDashboard = () => {
		navigate("/dashboard");
	};

	const handleNavigateToShop = () => {
		navigate("/shop");
	};

	const handleLogout = () => {
		navigate("/");
	};

	return (
		<html lang="fr">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<AuthProvider>
					<RealtimeProvider>
						<div className="min-h-screen bg-[#FAF9F6]">
							<Header
								onNavigateToProfile={handleNavigateToProfile}
								onNavigateToFriends={handleNavigateToFriends}
								onNavigateToDashboard={handleNavigateToDashboard}
								onNavigateToShop={handleNavigateToShop}
								onLogout={handleLogout}
								currentView={currentView}
							/>
							<main>
								<Outlet />
							</main>
							<Toaster
								position="bottom-right"
								toastOptions={{
									style: {
										background: "white",
										border: "1px solid #E5E4E1",
									},
								}}
							/>
						</div>
						<ScrollRestoration />
						<Scripts />
					</RealtimeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
