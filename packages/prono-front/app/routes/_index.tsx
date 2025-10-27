import { Dashboard } from "../components/Dashboard";

export function meta() {
	return [
		{ title: "League of Prono - Dashboard" },
		{ name: "description", content: "View your predictions and groups" },
	];
}

export default function Index() {
	return <Dashboard />;
}
