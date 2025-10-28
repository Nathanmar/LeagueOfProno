import type { MetaFunction } from "react-router";
import { LandingPage } from "../components/LandingPage";
import { useNavigate } from "react-router";

export const meta: MetaFunction = () => [
	{ title: "League of Prono - Prédictions de League of Legends" },
	{
		name: "description",
		content: "Faites vos pronostics sur les matchs de League of Legends",
	},
];

export default function Index() {
	const navigate = useNavigate();

	const handleGetStarted = () => {
		navigate("/auth");
	};

	const handleNavigateToShop = () => {
		navigate("/shop");
	};

	return (
		<LandingPage
			onGetStarted={handleGetStarted}
			onNavigateToShop={handleNavigateToShop}
		/>
	);
}
