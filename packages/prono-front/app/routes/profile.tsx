import type { MetaFunction } from "react-router";
import { Profile } from "../components/Profile";
import { useNavigate } from "react-router";

export const meta: MetaFunction = () => [
	{ title: "Mon Profil - League of Prono" },
	{ name: "description", content: "Consultez votre profil personnel" },
];

export default function ProfilePage() {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("/dashboard");
	};

	return <Profile onBack={handleBack} />;
}
