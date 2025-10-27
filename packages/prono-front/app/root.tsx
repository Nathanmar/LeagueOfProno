import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { Header } from "./components/Header";
import { Toaster } from "./components/ui/sonner";
import "./styles/globals.css";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<RealtimeProvider>{children}</RealtimeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function Root() {
	return (
		<div className="min-h-screen bg-[#FAF9F6]">
			<Header />
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
	);
}
