import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { getCurrentUser, logoutUser, type User } from "../services/authService";

interface AuthContextType {
	isAuthenticated: boolean;
	user: User | null;
	loading: boolean;
	error: string | null;
	login: (user: User) => void;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const login = (userData: User) => {
		setUser(userData);
		setIsAuthenticated(true);
		setError(null);
	};

	const logout = async () => {
		setLoading(true);
		const { error: logoutError } = await logoutUser();
		setUser(null);
		setIsAuthenticated(false);
		if (logoutError) {
			setError(logoutError);
		} else {
			setError(null);
		}
		setLoading(false);
	};

	const checkAuth = async () => {
		setLoading(true);
		const { user: currentUser, error: authError } = await getCurrentUser();
		if (currentUser) {
			setUser(currentUser);
			setIsAuthenticated(true);
			setError(null);
		} else {
			setUser(null);
			setIsAuthenticated(false);
			setError(authError);
		}
		setLoading(false);
	};

	// Vérifier l'authentification au montage du provider
	useEffect(() => {
		const initAuth = async () => {
			setLoading(true);
			const { user: currentUser, error: authError } = await getCurrentUser();
			if (currentUser) {
				setUser(currentUser);
				setIsAuthenticated(true);
				setError(null);
			} else {
				setUser(null);
				setIsAuthenticated(false);
				setError(authError);
			}
			setLoading(false);
		};

		initAuth();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				loading,
				error,
				login,
				logout,
				checkAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
