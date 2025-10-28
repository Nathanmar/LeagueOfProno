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
	onViewPredictions?: () => void;
	groupPredictionsCount?: number;
}

export function MatchCard({
	match,
	prediction,
	onPredict,
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
					) : (
						!isLive && (
							<Button
								onClick={onPredict}
								className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
							>
								Faire un pronostic
							</Button>
						)
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
			) : (
				<div className="space-y-3">
					{match.winner && (
						<div className="mb-3 text-center">
							<span className="inline-flex items-center gap-2 bg-[#F5F4F1] px-4 py-2 text-sm">
								<Trophy className="w-4 h-4 text-[#C4A15B]" />
								Vainqueur :{" "}
								{match.winner === "team_a" ? match.team_a : match.team_b}
							</span>
						</div>
					)}
					{prediction && (
						<div
							className={`p-4 border-l-4 ${
								prediction.is_correct
									? "bg-green-50 border-green-500"
									: "bg-red-50 border-red-500"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="text-sm">
									<p className="text-gray-700">
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
								<div className="text-right">
									<div style={{ fontWeight: 700 }} className="text-lg">
										+{prediction.points_earned} pts
									</div>
									{prediction.is_exact_score && (
										<span className="text-xs text-green-600">
											Score parfait!
										</span>
									)}
								</div>
							</div>
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
