import { TrendingUp, Target, CheckCircle } from "lucide-react";
import type { UserStats } from "../services/userStatsService";

interface UserStatsCardProps {
	stats: UserStats | null;
	userName?: string;
}

export function UserStatsCard({ stats, userName }: UserStatsCardProps) {
	if (!stats) {
		return null;
	}

	return (
		<div className="bg-white border-2 border-[#E5E4E1] p-4 sm:p-6 rounded-lg mb-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-bold text-[#548CB4]">Vos statistiques</h3>
				{userName && (
					<span className="text-sm text-gray-600 bg-[#F5F4F1] px-3 py-1 rounded">
						{userName}
					</span>
				)}
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{/* Points totaux */}
				<div className="bg-linear-to-br from-[#548CB4]/10 to-transparent border border-[#548CB4]/20 p-4 rounded-lg">
					<div className="flex items-center gap-2 mb-2">
						<TrendingUp className="w-5 h-5 text-[#548CB4]" />
						<span className="text-xs sm:text-sm text-gray-600 font-semibold">
							Points totaux
						</span>
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-[#548CB4]">
						{stats.total_points}
					</div>
				</div>

				{/* Pronostics corrects */}
				<div className="bg-linear-to-br from-green-50 to-transparent border border-green-200 p-4 rounded-lg">
					<div className="flex items-center gap-2 mb-2">
						<CheckCircle className="w-5 h-5 text-green-600" />
						<span className="text-xs sm:text-sm text-gray-600 font-semibold">
							Corrects
						</span>
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-green-600">
						{stats.correct_predictions}
					</div>
					<div className="text-xs text-gray-500 mt-1">
						sur {stats.total_predictions}
					</div>
				</div>

				{/* Taux de réussite */}
				<div className="bg-linear-to-br from-[#C4A15B]/10 to-transparent border border-[#C4A15B]/20 p-4 rounded-lg">
					<div className="flex items-center gap-2 mb-2">
						<Target className="w-5 h-5 text-[#C4A15B]" />
						<span className="text-xs sm:text-sm text-gray-600 font-semibold">
							Réussite
						</span>
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-[#C4A15B]">
						{stats.accuracy}%
					</div>
				</div>

				{/* Scores exacts */}
				<div className="bg-linear-to-br from-purple-50 to-transparent border border-purple-200 p-4 rounded-lg">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-lg">🎯</span>
						<span className="text-xs sm:text-sm text-gray-600 font-semibold">
							Scores exacts
						</span>
					</div>
					<div className="text-2xl sm:text-3xl font-bold text-purple-600">
						{stats.exact_scores}
					</div>
				</div>
			</div>
		</div>
	);
}
