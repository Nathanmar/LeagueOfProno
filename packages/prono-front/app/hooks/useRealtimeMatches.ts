/**
 * Hook personnalisé pour accéder aux matchs en temps réel depuis RealtimeContext
 */

import { useRealtime } from "../contexts/RealtimeContext";
import type { Match } from "../services/matchesService";

export interface UseRealtimeMatches {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  connected: boolean;
}

/**
 * Hook pour obtenir les matchs en temps réel avec mises à jour automatiques
 * Utilise le context RealtimeContext qui fait du polling toutes les 10 secondes
 */
export function useRealtimeMatches(): UseRealtimeMatches {
  const { matches, isLoading, error, connected } = useRealtime();

  return {
    matches,
    loading: isLoading,
    error,
    connected,
  };
}
