import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import { getMatches, type Match } from "../services/matchesService";

interface RealtimeContextType {
	connected: boolean;
	error: Error | null;
	matches: Match[];
	isLoading: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
	undefined,
);

export function RealtimeProvider({ children }: { children: ReactNode }) {
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [matches, setMatches] = useState<Match[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Fonction pour charger les matchs
	const loadMatches = useCallback(async () => {
		try {
			const { matches: fetchedMatches, error: fetchError } = await getMatches();
			if (fetchError) {
				setError(new Error(fetchError));
				setConnected(false);
			} else {
				setMatches(fetchedMatches);
				setConnected(true);
				setError(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error(String(err)));
			setConnected(false);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isClient) return;

		// Charger les matchs immédiatement
		loadMatches();

		// Puis mettre à jour toutes les 10 secondes
		const interval = setInterval(() => {
			loadMatches();
		}, 10000);

		return () => {
			clearInterval(interval);
		};
	}, [isClient, loadMatches]);

	return (
		<RealtimeContext.Provider value={{ connected, error, matches, isLoading }}>
			{children}
		</RealtimeContext.Provider>
	);
}

export function useRealtime() {
	const context = useContext(RealtimeContext);
	if (!context) {
		throw new Error("useRealtime must be used within a RealtimeProvider");
	}
	return context;
}
