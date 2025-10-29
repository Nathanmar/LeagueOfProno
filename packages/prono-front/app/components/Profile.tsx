import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { ArrowLeft, Trophy, Target, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfile } from "../services/profileService";
import { getGroups } from "../services/groupsService";
import { getUserBadges, AVAILABLE_BADGES } from "../services/badgesService";
import { getAggregatedUserStats } from "../services/scoreAggregationService";
import type { UserProfile } from "../services/profileService";
import type { Group } from "../services/groupsService";
import type { Badge } from "../services/badgesService";
import type { AggregatedStats } from "../services/scoreAggregationService";

interface ProfileProps {
	onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [userGroups, setUserGroups] = useState<Group[]>([]);
	const [userBadges, setUserBadges] = useState<Badge[]>([]);
	const [aggregatedStats, setAggregatedStats] =
		useState<AggregatedStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadProfileData = async () => {
			try {
				setLoading(true);
				const [profileRes, groupsRes, badgesRes, statsRes] = await Promise.all([
					getProfile(),
					getGroups(),
					getUserBadges(),
					getAggregatedUserStats(),
				]);

				if (profileRes.error) {
					setError(profileRes.error);
				} else {
					setProfile(profileRes.profile);
				}

				if (!groupsRes.error) {
					setUserGroups(groupsRes.groups);
				}

				if (!badgesRes.error) {
					setUserBadges(badgesRes.badges || []);
				}

				if (!statsRes.error) {
					setAggregatedStats(statsRes.stats);
				}
			} catch (err) {
				setError("Erreur lors du chargement du profil");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadProfileData();
	}, []);

	// Récupérer les badges déverrouillés
	const unlockedBadgeIds = new Set(userBadges.map((b) => b.id));

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
			<div className="mb-8 sm:mb-12">
				<h1 className="mb-2">Mon Profil</h1>
				<p className="text-gray-600 break-all">
					{user?.email || profile?.email || "utilisateur@example.com"}
				</p>
			</div>

			{error && (
				<div className="mb-8 bg-red-50 border border-red-200 p-4 rounded">
					<p className="text-red-700">{error}</p>
				</div>
			)}

			{loading ? (
				<div className="text-center py-12">
					<p className="text-gray-600">Chargement du profil...</p>
				</div>
			) : (
				<>
					{/* Statistiques principales - Agrégées */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
						<div className="bg-white border border-[#E5E4E1] p-6">
							<div className="flex items-center gap-3 mb-3">
								<Trophy className="w-6 h-6 text-[#C4A15B]" />
								<h4>Points Totaux</h4>
							</div>
							<div className="text-4xl" style={{ fontWeight: 700 }}>
								{aggregatedStats?.total_points || profile?.score || 0}
							</div>
							<p className="text-sm text-gray-600 mt-1">
								Sur {aggregatedStats?.groups_count || userGroups.length}{" "}
								groupe(s)
							</p>
						</div>

						<div className="bg-white border border-[#E5E4E1] p-6">
							<div className="flex items-center gap-3 mb-3">
								<Target className="w-6 h-6 text-[#548CB4]" />
								<h4>Taux de Réussite</h4>
							</div>
							<div className="text-4xl" style={{ fontWeight: 700 }}>
								{aggregatedStats?.accuracy || 0}%
							</div>
							<p className="text-sm text-gray-600 mt-1">
								{aggregatedStats?.correct_predictions || 0}/
								{aggregatedStats?.total_predictions || 0} pronostics corrects
							</p>
						</div>

						<div className="bg-white border border-[#E5E4E1] p-6">
							<div className="flex items-center gap-3 mb-3">
								<TrendingUp className="w-6 h-6 text-green-600" />
								<h4>Groupes</h4>
							</div>
							<div className="text-4xl" style={{ fontWeight: 700 }}>
								{userGroups.length}
							</div>
							<p className="text-sm text-gray-600 mt-1">Groupes rejoints</p>
						</div>
					</div>

					{/* Scores par groupe */}
					{aggregatedStats?.group_scores &&
						aggregatedStats.group_scores.length > 0 && (
							<div className="mb-8 sm:mb-12">
								<h2 className="mb-6">Points par groupe</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{aggregatedStats.group_scores.map((groupScore) => (
										<div
											key={groupScore.group_id}
											className="bg-white border border-[#E5E4E1] p-6"
										>
											<h4 className="mb-3">{groupScore.group_name}</h4>
											<div className="space-y-2">
												<div className="flex justify-between">
													<span className="text-gray-600">Points</span>
													<span style={{ fontWeight: 700 }}>
														{groupScore.score}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">
														Taux de précision
													</span>
													<span style={{ fontWeight: 700 }}>
														{groupScore.accuracy}%
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">
														Prédictions correctes
													</span>
													<span style={{ fontWeight: 700 }}>
														{groupScore.correct_predictions}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

					{/* Mes groupes */}
					<div className="mb-8 sm:mb-12">
						<h2 className="mb-6">Mes Groupes</h2>
						{userGroups.length === 0 ? (
							<p className="text-gray-600">
								Vous n'avez pas encore rejoint de groupe
							</p>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{userGroups.map((group) => (
									<div
										key={group.id}
										className="bg-white border border-[#E5E4E1] p-6"
									>
										<h4 className="mb-2">{group.name}</h4>
										<p className="text-sm text-gray-600">
											{group.description || "Pas de description"}
										</p>
										<p className="text-xs text-gray-500 mt-2">
											Créé le{" "}
											{new Date(group.created_at).toLocaleDateString("fr-FR")}
										</p>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Badges */}
					<div>
						<h2 className="mb-6">Hauts Faits & Badges</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
							{AVAILABLE_BADGES.map((badge: Badge) => {
								const isUnlocked = unlockedBadgeIds.has(badge.id);

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
				</>
			)}
		</div>
	);
}
