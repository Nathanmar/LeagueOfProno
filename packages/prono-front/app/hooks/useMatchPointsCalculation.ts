import { useEffect, useRef } from "react";
import { calculateMatchPoints } from "../services/matchesService";
import type { Match } from "../services/matchesService";

/**
 * Hook pour calculer automatiquement les points quand un match se termine
 */
export function useMatchPointsCalculation(
	matches: Match[],
	onPointsCalculated?: () => void
) {
	const processedMatches = useRef<Set<string>>(new Set());

	useEffect(() => {
		const calculatePoints = async () => {
			let pointsCalculated = false;
			for (const match of matches) {
				// Si le match est finished et on ne l'a pas encore traité
				if (
					match.status === "finished" &&
					!processedMatches.current.has(match.id)
				) {
					console.log(
						`[POINTS_CALCULATION] Calculating points for finished match: ${match.id}`
					);
					try {
						const { error, updated } = await calculateMatchPoints(match.id);
						if (!error) {
							console.log(
								`[POINTS_CALCULATION] Points calculated for ${updated} predictions`
							);
							processedMatches.current.add(match.id);
							pointsCalculated = true;
						} else {
							console.error(
								`[POINTS_CALCULATION] Error calculating points: ${error}`
							);
						}
					} catch (err) {
						console.error("[POINTS_CALCULATION] Exception:", err);
					}
				}
			}
			// Appeler le callback si des points ont été calculés
			if (pointsCalculated && onPointsCalculated) {
				onPointsCalculated();
			}
		};

		if (matches.length > 0) {
			calculatePoints();
		}
	}, [matches, onPointsCalculated]);
}
