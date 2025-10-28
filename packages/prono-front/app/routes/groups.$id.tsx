import type { MetaFunction } from "react-router";
import { GroupView } from "../components/GroupView";
import { useParams, useNavigate } from "react-router";

export const meta: MetaFunction = ({ params }) => [
	{ title: "Groupe - League of Prono" },
	{ name: "description", content: "Consultez les pronostics du groupe" },
];

export default function GroupDetail() {
	const { id } = useParams();
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("/dashboard");
	};

	return <GroupView groupId={id || ""} onBack={handleBack} />;
}
