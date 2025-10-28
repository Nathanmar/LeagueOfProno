import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredAuth?: boolean;
}

/**
 * Composant wrapper pour protéger les routes
 * - Si requiredAuth=true: l'utilisateur doit être connecté
 * - Si requiredAuth=false: l'utilisateur ne doit pas être connecté (ex: page auth)
 */
export function ProtectedRoute({
	children,
	requiredAuth = true,
}: ProtectedRouteProps) {
	const { isAuthenticated, loading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Si en train de charger, ne rien faire
		if (loading) {
			return;
		}

		// Si la route demande l'authentification
		if (requiredAuth) {
			// Rediriger vers auth si pas connecté
			if (!isAuthenticated) {
				navigate("/auth", { replace: true });
			}
		} else {
			// Si c'est la page auth et l'utilisateur est déjà connecté
			if (isAuthenticated) {
				navigate("/dashboard", { replace: true });
			}
		}
	}, [isAuthenticated, loading, requiredAuth, navigate]);

	// Afficher le contenu seulement si l'authentification est OK
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-[#548CB4] border-t-transparent mx-auto mb-4" />
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	if (requiredAuth && !isAuthenticated) {
		return null;
	}

	if (!requiredAuth && isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
