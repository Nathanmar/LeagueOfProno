import { useEffect, useState } from "react";
import { TrendingUp, Target, Award, Trophy } from "lucide-react";
import { getUserGroupScore } from "../services/userStatsService";
import type { UserStats } from "../services/userStatsService";

interface GroupStatisticsProps {
	groupId: string;
}

export function GroupStatistics({ groupId }: GroupStatisticsProps) {
	const [stats, setStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadStats = async () => {
			try {
				setLoading(true);
				const { stats, error } = await getUserGroupScore(groupId);
				if (error) {
					setError(error);
					setStats(null);
				} else {
					setStats(stats);
					setError(null);
				}
			} catch (err) {
				console.error("Erreur lors du chargement des statistiques:", err);
				setError("Erreur lors du chargement");
				setStats(null);
			} finally {
				setLoading(false);
			}
		};

		loadStats();
	}, [groupId]);

	if (loading) {
		return (
			<div className="bg-white border border-[#E5E4E1] p-6 text-center">
				<p className="text-gray-600">Chargement des statistiques...</p>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className="bg-white border border-[#E5E4E1] p-6 text-center">
				<p className="text-red-600">
					{error || "Impossible de charger les statistiques"}
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{/* Points totaux */}
			<div className="bg-white border border-[#E5E4E1] p-6">
				<div className="flex items-center gap-3 mb-3">
					<Trophy className="w-6 h-6 text-[#C4A15B]" />
					<h4>Points du groupe</h4>
				</div>
				<div className="text-3xl" style={{ fontWeight: 700 }}>
					{stats.score || stats.total_points || 0}
				</div>
				<p className="text-sm text-gray-600 mt-1">Points cumulés</p>
			</div>

			{/* Taux de précision */}
			<div className="bg-white border border-[#E5E4E1] p-6">
				<div className="flex items-center gap-3 mb-3">
					<Target className="w-6 h-6 text-[#548CB4]" />
					<h4>Taux de précision</h4>
				</div>
				<div className="text-3xl" style={{ fontWeight: 700 }}>
					{stats.accuracy || 0}%
				</div>
				<p className="text-sm text-gray-600 mt-1">
					{stats.correct_predictions || 0} / {stats.total_predictions || 0}{" "}
					pronostics
				</p>
			</div>

			{/* Prédictions correctes */}
			<div className="bg-white border border-[#E5E4E1] p-6">
				<div className="flex items-center gap-3 mb-3">
					<Award className="w-6 h-6 text-green-600" />
					<h4>Prédictions correctes</h4>
				</div>
				<div className="text-3xl" style={{ fontWeight: 700 }}>
					{stats.correct_predictions || 0}
				</div>
				<p className="text-sm text-gray-600 mt-1">
					Dont {stats.exact_scores || 0} scores exacts
				</p>
			</div>

			{/* Total de prédictions */}
			<div className="bg-white border border-[#E5E4E1] p-6">
				<div className="flex items-center gap-3 mb-3">
					<TrendingUp className="w-6 h-6 text-blue-600" />
					<h4>Total de prédictions</h4>
				</div>
				<div className="text-3xl" style={{ fontWeight: 700 }}>
					{stats.total_predictions || 0}
				</div>
				<p className="text-sm text-gray-600 mt-1">
					Rejoints le{" "}
					{stats.joined_at
						? new Date(stats.joined_at).toLocaleDateString("fr-FR")
						: "N/A"}
				</p>
			</div>
		</div>
	);
}
