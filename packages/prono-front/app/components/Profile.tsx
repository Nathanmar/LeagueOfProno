import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { ArrowLeft, Trophy, Target, TrendingUp, Award } from "lucide-react";

interface Group {
	id: string;
	name: string;
	members: string[];
}

interface Prediction {
	id: string;
	match_id: string;
	user_id: string;
	prediction: string;
	points_earned?: number;
	is_correct?: boolean;
}

interface Badge {
	id: string;
	name: string;
	icon: string;
	description: string;
}

interface ProfileProps {
	onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
	const { user } = useAuth();

	// Mock data for groups, predictions, badges
	const userGroups: Group[] = [];
	const userPredictions: Prediction[] = [];
	const correctPredictions: Prediction[] = [];
	const perfectScores: Prediction[] = [];
	const availableBadges: Badge[] = [];

	// Taux de réussite
	const completedPredictions = userPredictions.filter((p: Prediction) => {
		// Considérer uniquement les prédictions pour des matchs terminés
		return (p.points_earned ?? 0) > 0 || p.is_correct === false;
	});
	const successRate =
		completedPredictions.length > 0
			? Math.round(
					(correctPredictions.length / completedPredictions.length) * 100,
				)
			: 0;

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
			<div className="mb-8 sm:mb-12">
				<h1 className="mb-2">Mon Profil</h1>
				<p className="text-gray-600 break-all">
					{user?.email || "utilisateur@example.com"}
				</p>
			</div>

			{/* Statistiques principales */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
				<div className="bg-white border border-[#E5E4E1] p-6">
					<div className="flex items-center gap-3 mb-3">
						<Trophy className="w-6 h-6 text-[#C4A15B]" />
						<h4>Points Totaux</h4>
					</div>
					<div className="text-4xl" style={{ fontWeight: 700 }}>
						0
					</div>
				</div>

				<div className="bg-white border border-[#E5E4E1] p-6">
					<div className="flex items-center gap-3 mb-3">
						<Target className="w-6 h-6 text-[#548CB4]" />
						<h4>Taux de Réussite</h4>
					</div>
					<div className="text-4xl" style={{ fontWeight: 700 }}>
						{successRate}%
					</div>
					<p className="text-sm text-gray-600 mt-1">
						{correctPredictions.length}/{completedPredictions.length} pronostics
						corrects
					</p>
				</div>

				<div className="bg-white border border-[#E5E4E1] p-6">
					<div className="flex items-center gap-3 mb-3">
						<TrendingUp className="w-6 h-6 text-green-600" />
						<h4>Scores Parfaits</h4>
					</div>
					<div className="text-4xl" style={{ fontWeight: 700 }}>
						{perfectScores.length}
					</div>
				</div>
			</div>

			{/* Mes groupes */}
			<div className="mb-8 sm:mb-12">
				<h2 className="mb-6">Mes Groupes</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{userGroups.map((group) => (
						<div
							key={group.id}
							className="bg-white border border-[#E5E4E1] p-6"
						>
							<h4 className="mb-2">{group.name}</h4>
							<p className="text-sm text-gray-600">
								{group.members.length} membre
								{group.members.length > 1 ? "s" : ""}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* Badges */}
			<div>
				<h2 className="mb-6">Hauts Faits & Badges</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
					{availableBadges?.map((badge) => {
						const isUnlocked = false;

						return (
							<div
								key={badge.id}
								className={`border-2 p-6 text-center transition-all ${
									isUnlocked
										? "border-[#C4A15B] bg-linear-to-b from-[#C4A15B]/10 to-transparent"
										: "border-[#E5E4E1] bg-gray-50 opacity-50"
								}`}
							>
								<div className="text-4xl mb-3">
									{isUnlocked ? badge.icon : "🔒"}
								</div>
								<div style={{ fontWeight: 600 }} className="text-sm mb-1">
									{badge.name}
								</div>
								<p className="text-xs text-gray-600">{badge.description}</p>
								{isUnlocked && (
									<div className="mt-3 flex items-center justify-center gap-1 text-xs text-[#C4A15B]">
										<Award className="w-3 h-3" />
										<span style={{ fontWeight: 600 }}>Débloqué</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
