import { Calendar, Trophy, Users } from "lucide-react";
import { Button } from "./ui/button";

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
	match_date?: string;
	status?: string;
	tournament?: string;
	winner?: string;
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

interface MatchCardProps {
	match: Match;
	prediction?: Prediction;
	onPredict?: () => void;
	onEditPrediction?: () => void;
	onViewPredictions?: () => void;
	groupPredictionsCount?: number;
}

export function MatchCard({
	match,
	prediction,
	onPredict,
	onEditPrediction,
	onViewPredictions,
	groupPredictionsCount,
}: MatchCardProps) {
	const isUpcoming = match.status === "upcoming";
	const isLive = match.status === "live";
	const matchDate = new Date(match.match_date || match.scheduled_at || "");

	return (
		<div
			className={`relative border-2 bg-white p-4 sm:p-6 hover:border-[#548CB4] transition-colors ${
				isLive ? "border-red-500" : "border-[#E5E4E1]"
			}`}
		>
			{/* Badge LIVE */}
			{isLive && (
				<div
					className="absolute top-0 left-0 bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm animate-pulse"
					style={{ fontWeight: 700 }}
				>
					● LIVE
				</div>
			)}

			{/* Tournament et Date */}
			<div
				className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 ${isLive ? "mt-6 sm:mt-8" : ""}`}
			>
				<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
					<Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
					<span>{match.tournament}</span>
				</div>
				<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
					<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
					<span className="hidden sm:inline">
						{matchDate.toLocaleDateString("fr-FR", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</span>
					<span className="sm:hidden">
						{matchDate.toLocaleDateString("fr-FR", {
							day: "2-digit",
							month: "short",
						})}
					</span>
				</div>
			</div>

			{/* Équipes */}
			<div className="flex items-center justify-between mb-4 sm:mb-6">
				<div className="flex-1 text-center">
					<div className="text-lg sm:text-2xl mb-2">{match.team_a}</div>
					{(isLive || !isUpcoming) && match.score_a !== undefined && (
						<div className="text-2xl sm:text-3xl" style={{ fontWeight: 700 }}>
							{match.score_a}
						</div>
					)}
				</div>

				<div className="px-3 sm:px-6 text-lg sm:text-2xl text-gray-400">vs</div>

				<div className="flex-1 text-center">
					<div className="text-lg sm:text-2xl mb-2">{match.team_b}</div>
					{(isLive || !isUpcoming) && match.score_b !== undefined && (
						<div className="text-2xl sm:text-3xl" style={{ fontWeight: 700 }}>
							{match.score_b}
						</div>
					)}
				</div>
			</div>

			{/* Action ou Résultat */}
			{isUpcoming || isLive ? (
				<div className="space-y-3">
					{prediction ? (
						<>
							<div className="bg-[#F5F4F1] p-3 sm:p-4 border-l-4 border-[#548CB4]">
								<p className="text-xs sm:text-sm text-gray-700">
									Votre pronostic :{" "}
									<span style={{ fontWeight: 600 }}>
										{prediction.predicted_winner === "team_a"
											? match.team_a
											: match.team_b}
									</span>
									{prediction.predicted_score_a !== undefined &&
										prediction.predicted_score_b !== undefined && (
											<span>
												{" "}
												({prediction.predicted_score_a}-
												{prediction.predicted_score_b})
											</span>
										)}
								</p>
							</div>
							{!isLive && onEditPrediction && (
								<Button
									onClick={onEditPrediction}
									className="w-full bg-[#C4A15B] hover:bg-[#b39546] text-white"
								>
									✏️ Éditer mon pronostic
								</Button>
							)}
						</>
					) : (
						!isLive && (
							<Button
								onClick={onPredict}
								className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
							>
								Faire un pronostic
							</Button>
						)
					)}{" "}
					{/* Bouton pour voir les pronostics du groupe - Pour les matchs LIVE et UPCOMING */}
					{onViewPredictions && (
						<Button
							onClick={onViewPredictions}
							variant="outline"
							className="w-full border-[#E5E4E1] hover:bg-[#F5F4F1]"
						>
							<Users className="w-4 h-4 mr-2" />
							Voir les pronostics
							{groupPredictionsCount !== undefined &&
								groupPredictionsCount > 0 && (
									<span className="ml-2">({groupPredictionsCount})</span>
								)}
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{/* Résultat Final */}
					{match.winner && (
						<div className="mb-4 p-4 sm:p-5 bg-linear-to-r from-[#C4A15B]/10 to-[#548CB4]/5 border-2 border-[#C4A15B] rounded-lg">
							<div className="flex items-center justify-center gap-2 mb-2">
								<Trophy className="w-5 h-5 text-[#C4A15B]" />
								<span className="text-xs sm:text-sm font-bold text-gray-800">
									RÉSULTAT FINAL
								</span>
							</div>
							<p className="text-center text-lg sm:text-xl font-bold text-[#548CB4]">
								{match.winner === "team_a" ? match.team_a : match.team_b}{" "}
								<span className="text-gray-400 font-normal text-sm">
									vainqueur
								</span>
							</p>
						</div>
					)}

					{/* Votre Pronostic avec Résultat */}
					{prediction ? (
						<div
							className={`p-4 sm:p-5 rounded-lg border-2 transition-all ${
								prediction.is_correct
									? "bg-green-50 border-green-400"
									: "bg-red-50 border-red-400"
							}`}
						>
							<div className="flex flex-col gap-3">
								{/* Statut du pronostic */}
								<div className="flex items-center gap-2">
									{prediction.is_correct ? (
										<div className="flex items-center gap-2 px-3 py-1 bg-green-200 text-green-700 rounded-full text-xs font-semibold">
											<span>✓</span>
											<span>Pronostic correct!</span>
										</div>
									) : (
										<div className="flex items-center gap-2 px-3 py-1 bg-red-200 text-red-700 rounded-full text-xs font-semibold">
											<span>✗</span>
											<span>Pronostic incorrect</span>
										</div>
									)}
								</div>

								{/* Détails du pronostic */}
								<div className="text-sm text-gray-700">
									<span className="block text-xs text-gray-600 mb-1">
										Vous aviez prédit :
									</span>
									<span style={{ fontWeight: 600 }} className="text-base">
										{prediction.predicted_winner === "team_a"
											? match.team_a
											: match.team_b}
									</span>
									{prediction.predicted_score_a !== undefined &&
										prediction.predicted_score_b !== undefined && (
											<span className="block text-gray-600">
												({prediction.predicted_score_a}-
												{prediction.predicted_score_b})
											</span>
										)}
									{prediction.is_exact_score && (
										<span className="block text-green-600 font-semibold mt-1">
											🎯 Score exact!
										</span>
									)}
								</div>

								{/* Points gagnés */}
								<div className="border-t pt-3 flex items-center justify-between">
									<span className="text-xs font-semibold text-gray-600">
										Points gagnés
									</span>
									<span
										className={`text-2xl sm:text-3xl font-bold ${
											(prediction.points_earned ?? 0) > 0
												? "text-green-600"
												: "text-gray-400"
										}`}
									>
										+{prediction.points_earned ?? 0}
									</span>
								</div>
							</div>
						</div>
					) : (
						<div className="p-4 sm:p-5 bg-gray-50 border-2 border-gray-300 rounded-lg text-center">
							<p className="text-sm text-gray-600">
								Vous n'aviez pas fait de pronostic pour ce match.
							</p>
						</div>
					)}

					{/* Bouton pour voir les pronostics du groupe */}
					{onViewPredictions &&
						groupPredictionsCount !== undefined &&
						groupPredictionsCount > 0 && (
							<Button
								onClick={onViewPredictions}
								variant="outline"
								className="w-full border-[#E5E4E1] hover:bg-[#F5F4F1]"
							>
								<Users className="w-4 h-4 mr-2" />
								Voir les pronostics ({groupPredictionsCount})
							</Button>
						)}
				</div>
			)}
		</div>
	);
}
