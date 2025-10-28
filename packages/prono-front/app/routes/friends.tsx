import type { MetaFunction } from "react-router";
import { Friends } from "../components/Friends";
import { useNavigate } from "react-router";

export const meta: MetaFunction = () => [
	{ title: "Mes Amis - League of Prono" },
	{ name: "description", content: "Gérez vos amis et leurs classements" },
];

export default function FriendsRoute() {
	const navigate = useNavigate();

	const handleBackToDashboard = () => {
		navigate("/dashboard");
	};

	return <Friends onBack={handleBackToDashboard} />;
}
