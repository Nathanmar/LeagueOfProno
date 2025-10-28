import type { MetaFunction } from "react-router";
import { Dashboard } from "../components/Dashboard";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const meta: MetaFunction = () => [
	{ title: "Tableau de bord - League of Prono" },
	{ name: "description", content: "Votre tableau de bord personnel" },
];

export default function DashboardRoute() {
	const navigate = useNavigate();

	const handleSelectGroup = (groupId: string) => {
		navigate(`/groups/${groupId}`);
	};

	const handleNavigateToFriends = () => {
		navigate("/friends");
	};

	return (
		<ProtectedRoute requiredAuth={true}>
			<Dashboard
				onSelectGroup={handleSelectGroup}
				onNavigateToFriends={handleNavigateToFriends}
			/>
		</ProtectedRoute>
	);
}
