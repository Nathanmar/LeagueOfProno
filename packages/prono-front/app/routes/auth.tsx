import type { MetaFunction } from "react-router";
import { AuthPage } from "../components/AuthPage";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import type { User } from "../services/authService";

export const meta: MetaFunction = () => [
	{ title: "Connexion - League of Prono" },
	{ name: "description", content: "Connectez-vous à votre compte" },
];

export default function AuthRoute() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = (user: User) => {
		login(user);
		navigate("/dashboard");
	};

	return (
		<ProtectedRoute requiredAuth={false}>
			<AuthPage onLogin={handleLogin} />
		</ProtectedRoute>
	);
}
