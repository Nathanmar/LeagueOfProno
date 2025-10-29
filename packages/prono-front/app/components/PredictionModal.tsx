import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar, Trophy } from "lucide-react";

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
	tournament?: string;
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

interface PredictionModalProps {
	match: Match | null;
	groupId: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (prediction: {
		matchId: string;
		groupId: string;
		predictedWinner: "team_a" | "team_b";
		predictedScoreA?: number;
		predictedScoreB?: number;
	}) => void;
	existingPrediction?: Prediction;
}

export function PredictionModal({
	match,
	groupId,
	isOpen,
	onClose,
	onSubmit,
	existingPrediction,
}: PredictionModalProps) {
	const [selectedWinner, setSelectedWinner] = useState<
		"team_a" | "team_b" | null
	>(null);
	const [scoreA, setScoreA] = useState<string>("");
	const [scoreB, setScoreB] = useState<string>("");

	// Initialiser avec les données existantes
	useEffect(() => {
		if (existingPrediction && isOpen) {
			setSelectedWinner(
				(existingPrediction.predicted_winner as "team_a" | "team_b") || null,
			);
			setScoreA(existingPrediction.predicted_score_a?.toString() || "");
			setScoreB(existingPrediction.predicted_score_b?.toString() || "");
		} else if (isOpen) {
			setSelectedWinner(null);
			setScoreA("");
			setScoreB("");
		}
	}, [existingPrediction, isOpen]);

	if (!match) return null;

	const handleSubmit = () => {
		if (!selectedWinner) return;

		onSubmit({
			matchId: match.id,
			groupId,
			predictedWinner: selectedWinner,
			predictedScoreA: scoreA ? Number.parseInt(scoreA) : undefined,
			predictedScoreB: scoreB ? Number.parseInt(scoreB) : undefined,
		});

		// Reset - la modale se fermera depuis le parent (GroupView)
		setSelectedWinner(null);
		setScoreA("");
		setScoreB("");
	};

	const matchDate = new Date(match.match_date || match.scheduled_at || "");
	const isEditing = !!existingPrediction;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl bg-white border-[#E5E4E1]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Éditer mon pronostic" : "Faire un pronostic"}
					</DialogTitle>
					<DialogDescription className="text-gray-600">
						{isEditing
							? "Modifiez votre prédiction avant que le match ne commence"
							: "Prédisez le vainqueur et optionnellement le score exact pour gagner des points bonus"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Info du match */}
					<div className="bg-[#F5F4F1] p-4 space-y-2">
						{match.tournament && (
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Trophy className="w-4 h-4" />
								<span>{match.tournament}</span>
							</div>
						)}
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Calendar className="w-4 h-4" />
							<span>
								{matchDate.toLocaleDateString("fr-FR", {
									weekday: "long",
									day: "numeric",
									month: "long",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</div>
					</div>

					{/* Partie 1: Sélection du vainqueur */}
					<div>
						<Label className="mb-4 block">
							Qui va gagner ? <span className="text-red-500">*</span>
						</Label>
						<div className="grid grid-cols-2 gap-3 sm:gap-4">
							<button
								type="button"
								onClick={() => setSelectedWinner("team_a")}
								className={`p-4 sm:p-6 border-2 transition-all ${
									selectedWinner === "team_a"
										? "border-[#548CB4] bg-[#548CB4] bg-opacity-10"
										: "border-[#E5E4E1] hover:border-[#C4A15B]"
								}`}
							>
								<div className="text-center">
									<div
										className="text-lg sm:text-2xl mb-2"
										style={{ fontWeight: 600 }}
									>
										{match.team_a}
									</div>
									{selectedWinner === "team_a" && (
										<div
											className="text-xs sm:text-sm text-[#548CB4]"
											style={{ fontWeight: 600 }}
										>
											✓ Sélectionné
										</div>
									)}
								</div>
							</button>

							<button
								type="button"
								onClick={() => setSelectedWinner("team_b")}
								className={`p-4 sm:p-6 border-2 transition-all ${
									selectedWinner === "team_b"
										? "border-[#548CB4] bg-[#548CB4] bg-opacity-10"
										: "border-[#E5E4E1] hover:border-[#C4A15B]"
								}`}
							>
								<div className="text-center">
									<div
										className="text-lg sm:text-2xl mb-2"
										style={{ fontWeight: 600 }}
									>
										{match.team_b}
									</div>
									{selectedWinner === "team_b" && (
										<div
											className="text-sm text-[#548CB4]"
											style={{ fontWeight: 600 }}
										>
											✓ Sélectionné
										</div>
									)}
								</div>
							</button>
						</div>
					</div>

					{/* Partie 2: Prédiction du score (optionnel) */}
					<div>
						<Label className="mb-4 block text-sm sm:text-base">
							Prédire le score exact (optionnel - +2 pts bonus)
						</Label>
						<div className="flex items-center justify-center gap-3 sm:gap-6">
							<div className="flex-1">
								<Label
									htmlFor="scoreA"
									className="text-xs sm:text-sm text-gray-600 mb-2 block"
								>
									{match.team_a}
								</Label>
								<Input
									id="scoreA"
									type="number"
									min="0"
									max="5"
									value={scoreA}
									onChange={(e) => setScoreA(e.target.value)}
									placeholder="0"
									className="text-center text-lg sm:text-xl border-[#E5E4E1] focus:border-[#548CB4]"
								/>
							</div>

							<div className="pt-6 text-xl sm:text-2xl text-gray-400">-</div>

							<div className="flex-1">
								<Label
									htmlFor="scoreB"
									className="text-xs sm:text-sm text-gray-600 mb-2 block"
								>
									{match.team_b}
								</Label>
								<Input
									id="scoreB"
									type="number"
									min="0"
									max="5"
									value={scoreB}
									onChange={(e) => setScoreB(e.target.value)}
									placeholder="0"
									className="text-center text-lg sm:text-xl border-[#E5E4E1] focus:border-[#548CB4]"
								/>
							</div>
						</div>
					</div>

					{/* Règles de scoring */}
					<div className="bg-[#F5F4F1] p-4 text-sm text-gray-600">
						<p style={{ fontWeight: 600 }} className="mb-2">
							Règles de scoring :
						</p>
						<ul className="space-y-1">
							<li>
								• Vainqueur correct :{" "}
								<span style={{ fontWeight: 600 }}>3 points</span>
							</li>
							<li>
								• Score exact :{" "}
								<span style={{ fontWeight: 600 }}>
									3 + 2 points bonus = 5 points
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="flex gap-3 justify-end">
					<Button
						variant="outline"
						onClick={onClose}
						className="border-[#E5E4E1] hover:bg-[#F5F4F1]"
					>
						Annuler
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedWinner}
						className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white disabled:opacity-50"
					>
						{isEditing ? "Mettre à jour le pronostic" : "Valider le pronostic"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
