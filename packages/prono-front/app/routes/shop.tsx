import type { MetaFunction } from "react-router";
import { Shop } from "../components/Shop";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const meta: MetaFunction = () => [
	{ title: "Boutique - League of Prono" },
	{ name: "description", content: "Découvrez les items premium" },
];

export default function ShopRoute() {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("/dashboard");
	};

	const handleLogin = () => {
		navigate("/auth");
	};

	return (
		<ProtectedRoute requiredAuth={true}>
			<Shop onBack={handleBack} isAuthenticated={true} onLogin={handleLogin} />
		</ProtectedRoute>
	);
}
