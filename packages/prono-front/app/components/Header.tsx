import { useNavigate, useLocation } from "react-router";
import { currentUser } from "../data/mockData";
import { Button } from "./ui/button";
import { User, Trophy } from "lucide-react";

export function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const isProfile = location.pathname === "/profile";

	return (
		<header className="border-b border-[#E5E4E1] bg-white">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex items-center gap-3 hover:opacity-80 transition-opacity"
					>
						<Trophy className="w-8 h-8 text-[#548CB4]" />
						<div>
							<div className="text-2xl" style={{ fontWeight: 700 }}>
								League of Prono
							</div>
							<div className="text-xs text-gray-500">
								Pronostics e-sport entre amis
							</div>
						</div>
					</button>

					{/* Navigation */}
					<div className="flex items-center gap-4">
						<div className="text-right mr-4">
							<div style={{ fontWeight: 600 }}>{currentUser.name}</div>
							<div className="text-sm text-gray-600">
								{currentUser.total_points} points
							</div>
						</div>

						<Button
							onClick={() => navigate("/profile")}
							variant={isProfile ? "default" : "outline"}
							className={
								isProfile
									? "bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
									: "border-[#E5E4E1] hover:bg-[#F5F4F1]"
							}
						>
							<User className="w-4 h-4 mr-2" />
							Profil
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
