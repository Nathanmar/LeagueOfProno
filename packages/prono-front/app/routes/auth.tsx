import type { MetaFunction } from "react-router";
import { AuthPage } from "../components/AuthPage";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export const meta: MetaFunction = () => [
	{ title: "Connexion - League of Prono" },
	{ name: "description", content: "Connectez-vous à votre compte" },
];

export default function AuthRoute() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = (email: string, name: string) => {
		login();
		navigate("/dashboard");
	};

	return <AuthPage onLogin={handleLogin} />;
}
