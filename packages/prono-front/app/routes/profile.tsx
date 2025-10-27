import { Profile } from "../components/Profile";

export function meta() {
	return [
		{ title: "Profile - League of Prono" },
		{ name: "description", content: "View your profile and statistics" },
	];
}

export default function ProfilePage() {
	return <Profile />;
}
