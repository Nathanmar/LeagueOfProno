import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
	getFriends,
	getFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
} from "../services/friendsService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	UserPlus,
	Users,
	Mail,
	Check,
	X,
	Clock,
	Trophy,
	Search,
} from "lucide-react";
import { toast } from "sonner";

interface FriendsProps {
	onBack: () => void;
}

interface Friend {
	id: string;
	username: string;
	avatar?: string;
	score: number;
}

interface FriendRequest {
	id: string;
	from_user_id: string;
	from_username: string;
	status: "pending" | "accepted" | "rejected" | "blocked";
	created_at: string;
}

export function Friends({ onBack }: FriendsProps) {
	const { user } = useAuth();
	const [friends, setFriends] = useState<Friend[]>([]);
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [sendingRequest, setSendingRequest] = useState(false);
	const [searchEmail, setSearchEmail] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	// Charger les amis et les demandes
	useEffect(() => {
		const loadData = async () => {
			if (!user) return;
			try {
				setLoading(true);
				console.log("[Friends] Loading data for user:", user.id);

				const [friendsRes, requestsRes] = await Promise.all([
					getFriends(),
					getFriendRequests(),
				]);

				console.log("[Friends] Friends response:", friendsRes);
				console.log("[Friends] Requests response:", requestsRes);

				if (!friendsRes.error) {
					console.log("[Friends] Setting friends:", friendsRes.friends);
					setFriends(friendsRes.friends);
				}

				if (!requestsRes.error) {
					console.log(
						"[Friends] Setting friend requests:",
						requestsRes.requests,
					);
					setFriendRequests(requestsRes.requests);
				} else {
					console.error("[Friends] Error loading requests:", requestsRes.error);
				}
			} catch (error) {
				console.error("Erreur lors du chargement des amis:", error);
				toast.error("Erreur lors du chargement des données");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [user]);

	const handleAcceptRequest = async (requestId: string) => {
		try {
			const { success, error } = await acceptFriendRequest(requestId);
			if (success) {
				// Recharger les données
				const [friendsRes, requestsRes] = await Promise.all([
					getFriends(),
					getFriendRequests(),
				]);
				setFriends(friendsRes.friends);
				setFriendRequests(requestsRes.requests);
				toast.success("Demande d'ami acceptée !");
			} else {
				toast.error(error || "Erreur lors de l'acceptation");
			}
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de l'acceptation de la demande");
		}
	};

	const handleRejectRequest = async (requestId: string) => {
		try {
			const { success, error } = await rejectFriendRequest(requestId);
			if (success) {
				setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
				toast.success("Demande d'ami refusée");
			} else {
				toast.error(error || "Erreur lors du refus");
			}
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors du refus de la demande");
		}
	};

	const handleSendRequest = async (email: string) => {
		if (!email) {
			toast.error("Veuillez entrer un email");
			return;
		}

		try {
			setSendingRequest(true);
			const { success, error } = await sendFriendRequest(email);
			if (success) {
				setSearchEmail("");
				toast.success("Demande d'ami envoyée !");
			} else {
				toast.error(error || "Erreur lors de l'envoi de la demande");
			}
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de l'envoi de la demande");
		} finally {
			setSendingRequest(false);
		}
	};

	const handleRemoveFriend = async (friendId: string) => {
		try {
			const { error } = await removeFriend(friendId);
			if (!error) {
				setFriends(friends.filter((f) => f.id !== friendId));
				toast.success("Ami retiré");
			} else {
				toast.error(error || "Erreur lors de la suppression");
			}
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de la suppression de l'ami");
		}
	};

	const filteredFriends = friends.filter((friend) =>
		friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
			<div className="mb-8">
				<h1 className="mb-2">Mes Amis</h1>
				<p className="text-gray-600">
					Gérez vos amis et invitez de nouveaux pronostiqueurs
				</p>
			</div>

			{loading ? (
				<div className="text-center py-12">
					<p className="text-gray-600">Chargement des amis...</p>
				</div>
			) : (
				<Tabs defaultValue="friends" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-8 bg-[#F5F4F1] border border-[#E5E4E1]">
						<TabsTrigger
							value="friends"
							className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
						>
							<Users className="w-4 h-4 sm:mr-2" />
							<span className="hidden sm:inline">Amis ({friends.length})</span>
							<span className="sm:hidden">{friends.length}</span>
						</TabsTrigger>
						<TabsTrigger
							value="requests"
							className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
						>
							<Mail className="w-4 h-4 sm:mr-2" />
							<span className="hidden sm:inline">
								Demandes ({friendRequests.length})
							</span>
							<span className="sm:hidden">{friendRequests.length}</span>
						</TabsTrigger>
						<TabsTrigger
							value="add"
							className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
						>
							<UserPlus className="w-4 h-4 sm:mr-2" />
							<span className="hidden sm:inline">Ajouter</span>
							<span className="sm:hidden">+</span>
						</TabsTrigger>
					</TabsList>

					{/* Liste des amis */}
					<TabsContent value="friends">
						{/* Barre de recherche */}
						<div className="mb-6">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<Input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Rechercher un ami..."
									className="pl-10 border-[#E5E4E1] focus:border-[#548CB4]"
								/>
							</div>
						</div>

						{filteredFriends.length === 0 ? (
							<div className="bg-white border border-[#E5E4E1] p-12 text-center">
								<Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
								<h3 className="mb-2">Aucun ami</h3>
								<p className="text-gray-600">
									Ajoutez des amis pour comparer vos performances !
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{filteredFriends.map((friend) => (
									<div
										key={friend.id}
										className="bg-white border border-[#E5E4E1] p-4 sm:p-6 hover:border-[#548CB4] transition-colors"
									>
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
											<div className="flex items-center gap-3 sm:gap-4">
												<div
													className="w-10 h-10 sm:w-12 sm:h-12 bg-[#548CB4] bg-opacity-10 flex items-center justify-center text-[#548CB4] text-lg sm:text-xl"
													style={{ fontWeight: 600 }}
												>
													{friend.username.charAt(0).toUpperCase()}
												</div>
												<div>
													<h4 className="mb-1">{friend.username}</h4>
													<p className="text-sm text-gray-600">
														{friend.score} points
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between sm:gap-4">
												<div>
													<div className="flex items-center gap-2 text-[#C4A15B]">
														<Trophy className="w-4 h-4" />
														<span style={{ fontWeight: 600 }}>
															{friend.score} pts
														</span>
													</div>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleRemoveFriend(friend.id)}
													className="border-red-200 text-red-600 hover:bg-red-50"
												>
													Retirer
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					{/* Demandes reçues */}
					<TabsContent value="requests">
						{friendRequests.length === 0 ? (
							<div className="bg-white border border-[#E5E4E1] p-12 text-center">
								<Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
								<h3 className="mb-2">Aucune demande</h3>
								<p className="text-gray-600">
									Vous n'avez pas de demande d'ami en attente
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{friendRequests.map((request) => (
									<div
										key={request.id}
										className="bg-white border border-[#E5E4E1] p-6"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												<div
													className="w-12 h-12 bg-[#548CB4] bg-opacity-10 flex items-center justify-center text-[#548CB4] text-xl"
													style={{ fontWeight: 600 }}
												>
													{request.from_username.charAt(0).toUpperCase()}
												</div>
												<div>
													<h4 className="mb-1">{request.from_username}</h4>
													<p className="text-sm text-gray-600 mt-1">
														Demande reçue
													</p>
												</div>
											</div>

											<div className="flex items-center gap-3">
												<Button
													onClick={() => handleAcceptRequest(request.id)}
													className="bg-green-600 hover:bg-green-700 text-white"
												>
													<Check className="w-4 h-4 mr-2" />
													Accepter
												</Button>
												<Button
													onClick={() => handleRejectRequest(request.id)}
													variant="outline"
													className="border-red-200 text-red-600 hover:bg-red-50"
												>
													<X className="w-4 h-4 mr-2" />
													Refuser
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					{/* Ajouter un ami */}
					<TabsContent value="add">
						<div className="bg-white border border-[#E5E4E1] p-8">
							<h3 className="mb-4">Ajouter un ami par email</h3>
							<p className="text-gray-600 mb-6">
								Entrez l'adresse email d'un utilisateur pour lui envoyer une
								demande d'ami
							</p>

							<div className="flex gap-3">
								<div className="flex-1">
									<Input
										type="email"
										value={searchEmail}
										onChange={(e) => setSearchEmail(e.target.value)}
										placeholder="email@example.com"
										className="border-[#E5E4E1] focus:border-[#548CB4]"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleSendRequest(searchEmail);
											}
										}}
										disabled={sendingRequest}
									/>
								</div>
								<Button
									onClick={() => handleSendRequest(searchEmail)}
									className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
									disabled={sendingRequest}
								>
									<UserPlus className="w-4 h-4 mr-2" />
									{sendingRequest ? "Envoi..." : "Envoyer"}
								</Button>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
