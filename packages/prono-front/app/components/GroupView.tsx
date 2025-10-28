import { useState, useEffect } from "react";
import { MatchCard } from "./MatchCard";
import { Leaderboard } from "./Leaderboard";
import { PredictionModal } from "./PredictionModal";
import { MatchPredictionsModal } from "./MatchPredictionsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { getGroup } from "../services/groupsService";

interface Match {
	id: string;
	team1: string;
	team2: string;
	team_a?: string;
	team_b?: string;
	score1?: number;
	score2?: number;
	score_a?: number;
	score_b?: number;
	scheduled_at: string;
	status?: string;
}

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
	const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
	const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
	const [isMatchPredictionsModalOpen, setIsMatchPredictionsModalOpen] =
		useState(false);
	const [selectedMatchForPredictions, setSelectedMatchForPredictions] =
		useState<Match | null>(null);

	// Charger les données du groupe
	useEffect(() => {
		const loadGroup = async () => {
			try {
				setLoading(true);
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

	if (loading) {
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
	const liveMatches: Match[] = [];
	const upcomingMatches: Match[] = [];
	const completedMatches: Match[] = [];

	// Obtenir les prédictions de l'utilisateur pour ce groupe
	const getUserPrediction = (matchId: string): Prediction | undefined => {
		return predictions.find((p) => p.match_id === matchId);
	};

	// Obtenir les prédictions du groupe pour un match
	const getMatchPredictions = (matchId: string): Prediction[] => {
		return predictions.filter((p) => p.match_id === matchId);
	};

	// Classement du groupe
	const leaderboard: Array<{
		userId: string;
		userName: string;
		score: number;
	}> = [];

	const handleOpenPredictionModal = (match: Match) => {
		setSelectedMatch(match);
		setIsPredictionModalOpen(true);
	};

	const handleOpenMatchPredictionsModal = (match: Match) => {
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
		const newPrediction: Prediction = {
			id: `pred_${Date.now()}`,
			user_id: groupId,
			match_id: predictionData.matchId,
			prediction: "",
			predicted_winner: predictionData.predictedWinner,
			predicted_score_a: predictionData.predictedScoreA,
			predicted_score_b: predictionData.predictedScoreB,
			points_earned: 0,
			is_correct: false,
			is_exact_score: false,
		};

		setPredictions([...predictions, newPrediction]);
		toast.success("Pronostic enregistré avec succès !");
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
						<Leaderboard entries={leaderboard} currentUserId={groupId} />
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
			/>
		</div>
	);
}
