import type { Match, Prediction } from "../data/mockData";
import { Calendar, Trophy } from "lucide-react";
import { Button } from "./ui/button";

interface MatchCardProps {
	match: Match;
	prediction?: Prediction;
	onPredict?: () => void;
}

export function MatchCard({ match, prediction, onPredict }: MatchCardProps) {
	const isUpcoming = match.status === "upcoming";
	const matchDate = new Date(match.match_date);

	return (
		<div className="border border-[#E5E4E1] bg-white p-6 hover:border-[#548CB4] transition-colors">
			{/* Tournament et Date */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<Trophy className="w-4 h-4" />
					<span>{match.tournament}</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<Calendar className="w-4 h-4" />
					<span>
						{matchDate.toLocaleDateString("fr-FR", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</span>
				</div>
			</div>

			{/* Équipes */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex-1 text-center">
					<div className="text-2xl mb-2">{match.team_a}</div>
					{!isUpcoming && match.score_a !== undefined && (
						<div className="text-3xl" style={{ fontWeight: 700 }}>
							{match.score_a}
						</div>
					)}
				</div>

				<div className="px-6 text-2xl text-gray-400">vs</div>

				<div className="flex-1 text-center">
					<div className="text-2xl mb-2">{match.team_b}</div>
					{!isUpcoming && match.score_b !== undefined && (
						<div className="text-3xl" style={{ fontWeight: 700 }}>
							{match.score_b}
						</div>
					)}
				</div>
			</div>

			{/* Action ou Résultat */}
			{isUpcoming ? (
				<div>
					{prediction ? (
						<div className="bg-[#F5F4F1] p-4 border-l-4 border-[#548CB4]">
							<p className="text-sm text-gray-700">
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
						<Button
							onClick={onPredict}
							className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
						>
							Faire un pronostic
						</Button>
					)}
				</div>
			) : (
				<div>
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
				</div>
			)}
		</div>
	);
}
