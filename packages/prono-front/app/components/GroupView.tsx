import { useState, useEffect } from "react";
import { MatchCard } from "./MatchCard";
import { Leaderboard } from "./Leaderboard";
import { PredictionModal } from "./PredictionModal";
import { MatchPredictionsModal } from "./MatchPredictionsModal";
import { UserStatsCard } from "./UserStatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { ArrowLeft, Share2, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { getGroup } from "../services/groupsService";
import {
	getGroupPredictions,
	submitGroupPrediction,
} from "../services/predictionsService";
import { useRealtimeMatches } from "../hooks/useRealtimeMatches";
import { useMatchPointsCalculation } from "../hooks/useMatchPointsCalculation";
import { useAuth } from "../contexts/AuthContext";
import { getUserGroupScore } from "../services/userStatsService";
import type { Match as MatchType } from "../services/matchesService";
import type { UserStats } from "../services/userStatsService";

interface Group {
	id: string;
	name: string;
	description?: string;
	members: string[];
	invite_code?: string;
}

interface Prediction {
	id: string;
	match_id: string;
	user_id: string;
	user_name?: string;
	prediction: string;
	predicted_winner?: string;
	predicted_score_a?: number;
	predicted_score_b?: number;
	is_correct?: boolean;
	is_exact_score?: boolean;
	points_earned?: number;
}

interface GroupViewProps {
	groupId: string;
	onBack: () => void;
}

export function GroupView({ groupId, onBack }: GroupViewProps) {
	const [group, setGroup] = useState<Group | null>(null);
	const [loading, setLoading] = useState(true);
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [selectedMatch, setSelectedMatch] = useState<MatchType | null>(null);
	const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
	const [isMatchPredictionsModalOpen, setIsMatchPredictionsModalOpen] =
		useState(false);
	const [selectedMatchForPredictions, setSelectedMatchForPredictions] =
		useState<MatchType | null>(null);
	const [userStats, setUserStats] = useState<UserStats | null>(null);

	// Utiliser le hook pour récupérer les matchs en temps réel
	const { matches, loading: matchesLoading } = useRealtimeMatches();

	// Récupérer l'utilisateur connecté
	const { user } = useAuth();

	// Charger les données du groupe
	useEffect(() => {
		const loadGroup = async () => {
			try {
				const { group: groupData, error } = await getGroup(groupId);
				if (error || !groupData) {
					console.error("Erreur lors du chargement du groupe:", error);
					setGroup(null);
				} else {
					setGroup(groupData);
				}
			} catch (err) {
				console.error("Erreur lors du chargement du groupe:", err);
				setGroup(null);
			} finally {
				setLoading(false);
			}
		};

		loadGroup();
	}, [groupId]);

	// Charger les prédictions du groupe
	useEffect(() => {
		const loadPredictions = async () => {
			try {
				const { predictions, error } = await getGroupPredictions(groupId);
				if (error) {
					console.error("Erreur lors du chargement des prédictions:", error);
					setPredictions([]);
				} else {
					setPredictions(predictions);
				}
			} catch (err) {
				console.error("Erreur lors du chargement des prédictions:", err);
				setPredictions([]);
			}
		};

		if (group) {
			loadPredictions();
		}
	}, [group, groupId]);

	// Charger les statistiques de l'utilisateur
	useEffect(() => {
		const loadUserStats = async () => {
			try {
				const { stats, error } = await getUserGroupScore(groupId);
				if (error) {
					console.error("Erreur lors du chargement des statistiques:", error);
					setUserStats(null);
				} else {
					setUserStats(stats);
				}
			} catch (err) {
				console.error("Erreur lors du chargement des statistiques:", err);
				setUserStats(null);
			}
		};

		if (group && user) {
			loadUserStats();
		}
	}, [group, groupId, user]);

	// Fonction pour recharger les prédictions et statistiques
	const reloadPredictionsAndStats = async () => {
		try {
			const { predictions, error } = await getGroupPredictions(groupId);
			if (!error) {
				setPredictions(predictions);
				console.log("[GROUPVIEW] Prédictions reloadées après calcul de points");
			}

			const { stats, error: statsError } = await getUserGroupScore(groupId);
			if (!statsError && stats) {
				setUserStats(stats);
				console.log("[GROUPVIEW] Statistiques reloadées");
			}
		} catch (err) {
			console.error("[GROUPVIEW] Erreur lors du rechargement:", err);
		}
	};

	// Utiliser le hook avec callback de rechargement
	useMatchPointsCalculation(matches, reloadPredictionsAndStats);

	if (loading || matchesLoading) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="flex items-center justify-center min-h-[500px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#548CB4] mx-auto mb-4" />
						<p className="text-gray-600">Chargement du groupe...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!group) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12">
				<p>Groupe introuvable</p>
			</div>
		);
	}

	// Filtrer les matchs par statut
	const liveMatches: MatchType[] = matches.filter((m) => m.status === "live");
	const upcomingMatches: MatchType[] = matches.filter(
		(m) => m.status === "scheduled" || m.status === "upcoming",
	);
	const completedMatches: MatchType[] = matches.filter(
		(m) => m.status === "finished",
	);

	console.log("[GROUPVIEW] Tous les matchs:", matches);
	console.log("[GROUPVIEW] Live matches:", liveMatches);
	console.log(
		"[GROUPVIEW] Upcoming matches (status === 'scheduled' or 'upcoming'):",
		upcomingMatches,
	);
	console.log("[GROUPVIEW] Completed matches:", completedMatches);

	// Obtenir les prédictions de l'utilisateur pour ce groupe
	const getUserPrediction = (matchId: string): Prediction | undefined => {
		return predictions.find((p) => p.match_id === matchId);
	};

	// Obtenir les prédictions du groupe pour un match
	const getMatchPredictions = (matchId: string): Prediction[] => {
		return predictions.filter((p) => p.match_id === matchId);
	};

	// Classement du groupe - Calculer les scores par utilisateur
	const leaderboard: Array<{
		userId: string;
		userName: string;
		score: number;
	}> = (() => {
		const scoreMap = new Map<
			string,
			{ userId: string; userName: string; score: number }
		>();

		// Initialiser avec tous les membres du groupe
		if (group?.members) {
			for (const memberId of group.members) {
				scoreMap.set(memberId, {
					userId: memberId,
					userName: memberId,
					score: 0,
				});
			}
		}

		// Agréger les points des prédictions
		for (const prediction of predictions) {
			const userId = prediction.user_id;
			const points = prediction.points_earned ?? 0;
			const userName = prediction.user_name || userId;

			const entry = scoreMap.get(userId);
			if (entry) {
				entry.score += points;
				entry.userName = userName; // Mettre à jour le nom réel
			} else {
				scoreMap.set(userId, {
					userId,
					userName,
					score: points,
				});
			}
		}

		// Trier par score décroissant
		return Array.from(scoreMap.values()).sort((a, b) => b.score - a.score);
	})();

	const handleOpenPredictionModal = (match: MatchType) => {
		setSelectedMatch(match);
		setIsPredictionModalOpen(true);
	};

	const handleOpenMatchPredictionsModal = (match: MatchType) => {
		setSelectedMatchForPredictions(match);
		setIsMatchPredictionsModalOpen(true);
	};

	const handleSubmitPrediction = (predictionData: {
		matchId: string;
		groupId: string;
		predictedWinner: "team_a" | "team_b";
		predictedScoreA?: number;
		predictedScoreB?: number;
	}) => {
		const submitPredictionAsync = async () => {
			try {
				const { prediction, error } = await submitGroupPrediction(
					predictionData.groupId,
					predictionData.matchId,
					{
						predicted_winner: predictionData.predictedWinner,
						predicted_score_a: predictionData.predictedScoreA,
						predicted_score_b: predictionData.predictedScoreB,
					},
				);

				if (error || !prediction) {
					toast.error(error || "Erreur lors de l'enregistrement du pronostic");
					return;
				}

				console.log("[GROUPVIEW] Prédiction soumise:", prediction);

				// Vérifier si c'est une mise à jour ou une création
				const existingIndex = predictions.findIndex(
					(p) => p.match_id === prediction.match_id,
				);

				let updatedPredictions: Prediction[];
				if (existingIndex !== -1) {
					// Remplacer la prédiction existante
					updatedPredictions = [...predictions];
					updatedPredictions[existingIndex] = prediction;
					console.log(
						"[GROUPVIEW] Prédiction mise à jour à l'index:",
						existingIndex,
					);
				} else {
					// Ajouter la nouvelle prédiction
					updatedPredictions = [...predictions, prediction];
					console.log("[GROUPVIEW] Nouvelle prédiction ajoutée");
				}

				setPredictions(updatedPredictions);

				// Fermer la modale
				setIsPredictionModalOpen(false);

				// Recharger les statistiques de l'utilisateur
				const { stats, error: statsError } = await getUserGroupScore(groupId);
				if (!statsError && stats) {
					setUserStats(stats);
				}

				toast.success(
					existingIndex !== -1
						? "Pronostic mis à jour avec succès !"
						: "Pronostic enregistré avec succès !",
				);
			} catch (err) {
				console.error("Erreur lors de l'envoi du pronostic:", err);
				toast.error("Erreur lors de l'enregistrement du pronostic");
			}
		};

		submitPredictionAsync();
	};

	const handleShareInviteCode = () => {
		if (group?.invite_code) {
			navigator.clipboard.writeText(group.invite_code);
			toast.success("Code d'invitation copié !");
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
			{/* Header */}
			<div className="mb-8">
				<Button
					onClick={onBack}
					variant="ghost"
					className="mb-4 hover:bg-[#F5F4F1]"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Retour
				</Button>

				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
					<div>
						<h1 className="mb-2">{group.name}</h1>
						{group.description && (
							<p className="text-gray-600">{group.description}</p>
						)}
					</div>

					<Button
						onClick={handleShareInviteCode}
						variant="outline"
						className="border-[#C4A15B] text-[#C4A15B] hover:bg-[#C4A15B] hover:text-white w-full sm:w-auto"
					>
						<Share2 className="w-4 h-4 mr-2" />
						Code : {group.invite_code || "N/A"}
					</Button>
				</div>
			</div>{" "}
			{/* Layout principal : Contenu + Sidebar */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
				{/* Contenu principal : Matchs */}
				<div className="lg:col-span-2">
					{/* Statistiques de l'utilisateur */}
					<UserStatsCard stats={userStats} userName={user?.username} />

					{/* Matchs LIVE */}
					{liveMatches.length > 0 && (
						<div className="mb-8">
							<h3 className="mb-4">Matchs en direct</h3>
							<div className="space-y-4">
								{liveMatches.map((match) => (
									<MatchCard
										key={match.id}
										match={match}
										prediction={getUserPrediction(match.id)}
										onViewPredictions={() =>
											handleOpenMatchPredictionsModal(match)
										}
										groupPredictionsCount={getMatchPredictions(match.id).length}
									/>
								))}
							</div>
						</div>
					)}

					<Tabs defaultValue="upcoming" className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F1] border border-[#E5E4E1]">
							<TabsTrigger
								value="upcoming"
								className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white"
							>
								Matchs à venir ({upcomingMatches.length})
							</TabsTrigger>
							<TabsTrigger
								value="history"
								className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white"
							>
								Historique ({completedMatches.length})
							</TabsTrigger>
						</TabsList>

						{/* Matchs à venir */}
						<TabsContent value="upcoming" className="space-y-4">
							{upcomingMatches.length === 0 ? (
								<div className="bg-white border border-[#E5E4E1] p-12 text-center">
									<p className="text-gray-600">
										Aucun match à venir pour le moment
									</p>
								</div>
							) : (
								upcomingMatches.map((match) => (
									<MatchCard
										key={match.id}
										match={match}
										prediction={getUserPrediction(match.id)}
										onPredict={() => handleOpenPredictionModal(match)}
										onEditPrediction={() => handleOpenPredictionModal(match)}
										onViewPredictions={() =>
											handleOpenMatchPredictionsModal(match)
										}
										groupPredictionsCount={getMatchPredictions(match.id).length}
									/>
								))
							)}
						</TabsContent>

						{/* Historique */}
						<TabsContent value="history" className="space-y-4">
							{completedMatches.length === 0 ? (
								<div className="bg-white border border-[#E5E4E1] p-12 text-center">
									<p className="text-gray-600">
										Aucun match terminé pour le moment
									</p>
								</div>
							) : (
								completedMatches.map((match) => (
									<MatchCard
										key={match.id}
										match={match}
										prediction={getUserPrediction(match.id)}
										onViewPredictions={() =>
											handleOpenMatchPredictionsModal(match)
										}
										groupPredictionsCount={getMatchPredictions(match.id).length}
									/>
								))
							)}
						</TabsContent>
					</Tabs>
				</div>

				{/* Sidebar : Classement */}
				<div className="lg:col-span-1">
					<div className="lg:sticky lg:top-6">
						<Leaderboard entries={leaderboard} currentUserId={user?.id} />
					</div>
				</div>
			</div>{" "}
			{/* Modale de pronostic */}
			<PredictionModal
				match={selectedMatch}
				groupId={groupId}
				isOpen={isPredictionModalOpen}
				onClose={() => setIsPredictionModalOpen(false)}
				onSubmit={handleSubmitPrediction}
				existingPrediction={
					selectedMatch ? getUserPrediction(selectedMatch.id) : undefined
				}
			/>
			{/* Modale des pronostics du groupe */}
			<MatchPredictionsModal
				match={selectedMatchForPredictions}
				predictions={
					selectedMatchForPredictions
						? getMatchPredictions(selectedMatchForPredictions.id)
						: []
				}
				isOpen={isMatchPredictionsModalOpen}
				onClose={() => setIsMatchPredictionsModalOpen(false)}
				groupId={groupId}
			/>
		</div>
	);
}
