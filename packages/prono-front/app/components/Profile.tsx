import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { ArrowLeft, Trophy, Target, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfile } from "../services/profileService";
import { getGroups } from "../services/groupsService";
import { getUserBadges, AVAILABLE_BADGES } from "../services/badgesService";
import type { UserProfile } from "../services/profileService";
import type { Group } from "../services/groupsService";
import type { Badge } from "../services/badgesService";

interface ProfileProps {
	onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [userGroups, setUserGroups] = useState<Group[]>([]);
	const [userBadges, setUserBadges] = useState<Badge[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadProfileData = async () => {
			try {
				setLoading(true);
				const [profileRes, groupsRes, badgesRes] = await Promise.all([
					getProfile(),
					getGroups(),
					getUserBadges(),
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
			} catch (err) {
				setError("Erreur lors du chargement du profil");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadProfileData();
	}, []);

	// Calcul du taux de réussite
	const totalPredictions = profile?.predictions_count || 0;
	const correctPredictions = profile?.wins_count || 0;
	const successRate =
		totalPredictions > 0
			? Math.round((correctPredictions / totalPredictions) * 100)
			: 0;

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
					{/* Statistiques principales */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
						<div className="bg-white border border-[#E5E4E1] p-6">
							<div className="flex items-center gap-3 mb-3">
								<Trophy className="w-6 h-6 text-[#C4A15B]" />
								<h4>Points Totaux</h4>
							</div>
							<div className="text-4xl" style={{ fontWeight: 700 }}>
								{profile?.score || 0}
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
								{correctPredictions}/{totalPredictions} pronostics corrects
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
						</div>
					</div>

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
