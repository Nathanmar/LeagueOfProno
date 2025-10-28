import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Trophy, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	registerUser,
	loginUser,
	type User as UserType,
} from "../services/authService";

interface AuthPageProps {
	onLogin: (user: UserType) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
	// Login state
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [loginLoading, setLoginLoading] = useState(false);

	// Register state
	const [registerName, setRegisterName] = useState("");
	const [registerEmail, setRegisterEmail] = useState("");
	const [registerPassword, setRegisterPassword] = useState("");
	const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
	const [registerLoading, setRegisterLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!loginEmail || !loginPassword) {
			toast.error("Veuillez remplir tous les champs");
			return;
		}

		setLoginLoading(true);
		const { user, error } = await loginUser(loginEmail, loginPassword);

		if (error) {
			toast.error(error);
			setLoginLoading(false);
			return;
		}

		if (user) {
			toast.success("Connexion réussie !");
			onLogin(user);
		}

		setLoginLoading(false);
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!registerName ||
			!registerEmail ||
			!registerPassword ||
			!registerConfirmPassword
		) {
			toast.error("Veuillez remplir tous les champs");
			return;
		}

		if (registerPassword !== registerConfirmPassword) {
			toast.error("Les mots de passe ne correspondent pas");
			return;
		}

		if (registerPassword.length < 6) {
			toast.error("Le mot de passe doit contenir au moins 6 caractères");
			return;
		}

		setRegisterLoading(true);
		const { user, error } = await registerUser(
			registerName,
			registerEmail,
			registerPassword,
		);

		if (error) {
			toast.error(error);
			setRegisterLoading(false);
			return;
		}

		if (user) {
			toast.success("Compte créé avec succès !");
			onLogin(user);
		}

		setRegisterLoading(false);
	};

	return (
		<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-6 sm:mb-8">
					<div className="inline-flex items-center justify-center mb-4">
						<Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-[#548CB4]" />
					</div>
					<h1 className="mb-2">League of Prono</h1>
					<p className="text-gray-600">
						Connectez-vous pour commencer à pronostiquer
					</p>
				</div>

				{/* Auth Forms */}
				<div className="bg-white border border-[#E5E4E1] p-6 sm:p-8">
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F4F1] border border-[#E5E4E1]">
							<TabsTrigger
								value="login"
								className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white"
							>
								Connexion
							</TabsTrigger>
							<TabsTrigger
								value="register"
								className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white"
							>
								Inscription
							</TabsTrigger>
						</TabsList>

						<TabsContent value="login">
							<form onSubmit={handleLogin} className="space-y-4">
								<div>
									<Label htmlFor="login-email">Email</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											id="login-email"
											type="email"
											value={loginEmail}
											onChange={(e) => setLoginEmail(e.target.value)}
											placeholder="votre@email.com"
											className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
											disabled={loginLoading}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="login-password">Mot de passe</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											id="login-password"
											type="password"
											value={loginPassword}
											onChange={(e) => setLoginPassword(e.target.value)}
											placeholder="••••••••"
											className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
											disabled={loginLoading}
										/>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white mt-6"
									disabled={loginLoading}
								>
									{loginLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Connexion en cours...
										</>
									) : (
										"Se connecter"
									)}
								</Button>

								<div className="text-center mt-4">
									<button
										type="button"
										className="text-sm text-[#548CB4] hover:underline"
										disabled={loginLoading}
									>
										Mot de passe oublié ?
									</button>
								</div>
							</form>
						</TabsContent>

						{/* Register Form */}
						<TabsContent value="register">
							<form onSubmit={handleRegister} className="space-y-4">
								<div>
									<Label htmlFor="register-name">Pseudo</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											id="register-name"
											type="text"
											value={registerName}
											onChange={(e) => setRegisterName(e.target.value)}
											placeholder="Votre pseudo"
											className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
											disabled={registerLoading}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="register-email">Email</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											id="register-email"
											type="email"
											value={registerEmail}
											onChange={(e) => setRegisterEmail(e.target.value)}
											placeholder="votre@email.com"
											className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
											disabled={registerLoading}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="register-password">Mot de passe</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											id="register-password"
											type="password"
											value={registerPassword}
											onChange={(e) => setRegisterPassword(e.target.value)}
											placeholder="••••••••"
											className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
											disabled={registerLoading}
										/>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Minimum 6 caractères
									</p>
								</div>

								<div>
									<Label htmlFor="register-confirm-password">
										Confirmer le mot de passe
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<Input
											id="register-confirm-password"
											type="password"
											value={registerConfirmPassword}
											onChange={(e) =>
												setRegisterConfirmPassword(e.target.value)
											}
											placeholder="••••••••"
											className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
											disabled={registerLoading}
										/>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white mt-6"
									disabled={registerLoading}
								>
									{registerLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Création en cours...
										</>
									) : (
										"Créer mon compte"
									)}
								</Button>

								<div className="text-center mt-4">
									<p className="text-xs text-gray-600">
										En créant un compte, vous acceptez nos conditions
										d'utilisation
									</p>
								</div>
							</form>
						</TabsContent>
					</Tabs>
				</div>

				{/* Demo credentials */}
				<div className="mt-6 p-4 bg-[#548CB4] bg-opacity-10 border border-[#548CB4]">
					<p className="text-sm text-center text-gray-700">
						<span style={{ fontWeight: 600 }}>Mode démo :</span> Utilisez
						n'importe quel email/mot de passe pour tester l'application
					</p>
				</div>
			</div>
		</div>
	);
}
