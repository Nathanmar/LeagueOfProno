import { GroupView } from "../components/GroupView";

export function meta() {
	return [
		{ title: "Group - League of Prono" },
		{ name: "description", content: "View group predictions and leaderboard" },
	];
}

export default function GroupDetail() {
	return <GroupView />;
}
