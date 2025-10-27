import { useEffect, useState, useCallback } from "react";
import { apiClient, realtimeClient, endpoints } from "../services/api";

/**
 * Hook pour récupérer les données et les synchroniser en temps réel
 */
export function useRealtimeData<T>(
  endpoint: string,
  eventType?: string
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchData();

    // S'abonner aux mises à jour en temps réel si eventType est fourni
    let unsubscribe: (() => void) | undefined;
    if (eventType) {
      unsubscribe = realtimeClient.subscribe(eventType, (newData) => {
        setData(newData as T);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchData, eventType]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook pour effectuer une mutation (créer/modifier/supprimer)
 */
export function useMutation<TInput, TOutput>(
  method: "post" | "put" | "delete" = "post"
): {
  mutate: (endpoint: string, data?: TInput) => Promise<TOutput>;
  loading: boolean;
  error: Error | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (endpoint: string, data?: TInput): Promise<TOutput> => {
    try {
      setLoading(true);
      setError(null);

      let result: TOutput;
      if (method === "post") {
        result = await apiClient.post<TOutput>(endpoint, data);
      } else if (method === "put") {
        result = await apiClient.put<TOutput>(endpoint, data);
      } else {
        result = await apiClient.delete<TOutput>(endpoint);
      }

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

/**
 * Hook pour gérer les scores en temps réel
 */
export function useScoreUpdates(matchId: string) {
  const { data: match, ...rest } = useRealtimeData(
    endpoints.matchById(matchId),
    `match:${matchId}:updated`
  );

  const { mutate: updateScore } = useMutation<
    { score_a: number; score_b: number },
    unknown
  >("put");

  const handleUpdateScore = async (scoreA: number, scoreB: number) => {
    await updateScore(endpoints.updateScore(matchId), {
      score_a: scoreA,
      score_b: scoreB,
    });
  };

  return {
    match,
    updateScore: handleUpdateScore,
    ...rest,
  };
}
