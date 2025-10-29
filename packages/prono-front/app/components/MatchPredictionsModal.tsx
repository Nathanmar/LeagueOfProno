import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "./ui/dialog";
import { Trophy, Target } from "lucide-react";
import { useEffect, useState } from "react";

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

interface MatchPredictionsModalProps {
	match: Match | null;
	predictions: Prediction[];
	isOpen: boolean;
	onClose: () => void;
	groupId?: string;
}

export function MatchPredictionsModal({
	match,
	predictions,
	isOpen,
	onClose,
	groupId,
}: MatchPredictionsModalProps) {
	const [displayPredictions, setDisplayPredictions] =
		useState<Prediction[]>(predictions);

	// Mettre à jour les prédictions affichées quand les props changent
	useEffect(() => {
		setDisplayPredictions(predictions);
		console.log("[PREDICTIONS_MODAL] Prédictions reçues:", predictions);
	}, [predictions]);

	if (!match) return null;

	// Compter les pronostics par équipe
	const teamAPredictions = displayPredictions.filter(
		(p) => p.predicted_winner === "team_a",
	).length;
	const teamBPredictions = displayPredictions.filter(
		(p) => p.predicted_winner === "team_b",
	).length;
	const totalPredictions = displayPredictions.length;

	const teamAPercentage =
		totalPredictions > 0
			? Math.round((teamAPredictions / totalPredictions) * 100)
			: 0;
	const teamBPercentage =
		totalPredictions > 0
			? Math.round((teamBPredictions / totalPredictions) * 100)
			: 0;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl bg-white border-[#E5E4E1]">
				<DialogHeader>
					<DialogTitle>Pronostics du groupe</DialogTitle>
					<DialogDescription className="text-gray-600">
						{match.team_a} vs {match.team_b} • {totalPredictions} pronostic
						{totalPredictions > 1 ? "s" : ""}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Statistiques globales */}
					<div className="bg-[#F5F4F1] p-6 space-y-4">
						<h4 className="mb-4">Répartition des pronostics</h4>

						<div className="space-y-3">
							{/* Team A */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span style={{ fontWeight: 600 }}>{match.team_a}</span>
									<span className="text-[#548CB4]" style={{ fontWeight: 600 }}>
										{teamAPredictions} ({teamAPercentage}%)
									</span>
								</div>
								<div className="h-3 bg-white overflow-hidden">
									<div
										className="h-full bg-[#548CB4]"
										style={{ width: `${teamAPercentage}%` }}
									/>
								</div>
							</div>

							{/* Team B */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span style={{ fontWeight: 600 }}>{match.team_b}</span>
									<span className="text-[#C4A15B]" style={{ fontWeight: 600 }}>
										{teamBPredictions} ({teamBPercentage}%)
									</span>
								</div>
								<div className="h-3 bg-white overflow-hidden">
									<div
										className="h-full bg-[#C4A15B]"
										style={{ width: `${teamBPercentage}%` }}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Liste détaillée des pronostics */}
					<div>
						<h4 className="mb-4">Détail des pronostics</h4>

						<div className="space-y-2 max-h-96 overflow-y-auto">
							{displayPredictions.length === 0 ? (
								<div className="bg-white border border-[#E5E4E1] p-8 text-center">
									<Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
									<p className="text-gray-600 text-sm">
										Aucun pronostic pour ce match
									</p>
								</div>
							) : (
								displayPredictions.map((prediction) => {
									const user = {
										id: prediction.user_id,
										username: "Utilisateur",
									};
									if (!user) return null;

									const predictedTeam =
										prediction.predicted_winner === "team_a"
											? match.team_a
											: match.team_b;
									const hasScore =
										prediction.predicted_score_a !== undefined &&
										prediction.predicted_score_b !== undefined;

									return (
										<div
											key={prediction.id}
											className={`border-2 p-4 ${
												prediction.predicted_winner === "team_a"
													? "border-[#548CB4] bg-[#548CB4] bg-opacity-5"
													: "border-[#C4A15B] bg-[#C4A15B] bg-opacity-5"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div
														className={`w-10 h-10 flex items-center justify-center ${
															prediction.predicted_winner === "team_a"
																? "bg-[#548CB4] bg-opacity-10 text-[#548CB4]"
																: "bg-[#C4A15B] bg-opacity-10 text-[#C4A15B]"
														} text-lg`}
														style={{ fontWeight: 600 }}
													>
														{user.username.charAt(0).toUpperCase()}
													</div>
													<div>
														<div style={{ fontWeight: 600 }}>
															{user.username}
														</div>
														<div className="text-sm text-gray-600">
															Prédit :{" "}
															<span style={{ fontWeight: 600 }}>
																{predictedTeam}
															</span>
															{hasScore && (
																<span>
																	{" "}
																	({prediction.predicted_score_a}-
																	{prediction.predicted_score_b})
																</span>
															)}
														</div>
													</div>
												</div>

												{/* Points si match terminé */}
												{match.status === "completed" && (
													<div className="text-right">
														<div className="flex items-center gap-2">
															<Trophy className="w-4 h-4 text-[#C4A15B]" />
															<span style={{ fontWeight: 700 }}>
																+{prediction.points_earned} pts
															</span>
														</div>
														{prediction.is_exact_score && (
															<span className="text-xs text-green-600">
																Score parfait!
															</span>
														)}
													</div>
												)}
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
