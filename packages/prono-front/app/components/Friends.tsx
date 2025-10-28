import { useState } from "react";
import {
	friends as initialFriends,
	friendRequests as initialFriendRequests,
	sentRequests as initialSentRequests,
	friendSuggestions,
	Friend,
} from "../data/friendsData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	ArrowLeft,
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

export function Friends({ onBack }: FriendsProps) {
	const [friends, setFriends] = useState(initialFriends);
	const [friendRequests, setFriendRequests] = useState(initialFriendRequests);
	const [sentRequests, setSentRequests] = useState(initialSentRequests);
	const [searchEmail, setSearchEmail] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const handleAcceptRequest = (friendId: string) => {
		const request = friendRequests.find((r) => r.id === friendId);
		if (request) {
			// Déplacer vers les amis
			setFriends([...friends, { ...request, status: "accepted" }]);
			setFriendRequests(friendRequests.filter((r) => r.id !== friendId));
			toast.success("Demande d'ami acceptée !");
		}
	};

	const handleRejectRequest = (friendId: string) => {
		setFriendRequests(friendRequests.filter((r) => r.id !== friendId));
		toast.success("Demande d'ami refusée");
	};

	const handleSendRequest = (email: string) => {
		if (!email) {
			toast.error("Veuillez entrer un email");
			return;
		}

		// Vérifier si déjà ami ou demande déjà envoyée
		const isAlreadyFriend = friends.some((f) => f.email === email);
		const isAlreadySent = sentRequests.some((r) => r.email === email);

		if (isAlreadyFriend) {
			toast.error("Cette personne est déjà votre ami");
			return;
		}

		if (isAlreadySent) {
			toast.error("Demande déjà envoyée à cette personne");
			return;
		}

		// Dans une vraie app, on enverrait la demande via Convex
		const newRequest: Friend = {
			id: `user_${Date.now()}`,
			name: email.split("@")[0],
			email: email,
			total_points: 0,
			status: "sent",
			common_groups: 0,
		};

		setSentRequests([...sentRequests, newRequest]);
		setSearchEmail("");
		toast.success("Demande d'ami envoyée !");
	};

	const handleAddSuggestion = (suggestion: Friend) => {
		// Ajouter à la liste des demandes envoyées
		setSentRequests([...sentRequests, { ...suggestion, status: "sent" }]);
		toast.success(`Demande d'ami envoyée à ${suggestion.name}`);
	};

	const handleRemoveFriend = (friendId: string) => {
		setFriends(friends.filter((f) => f.id !== friendId));
		toast.success("Ami retiré");
	};

	const filteredFriends = friends.filter(
		(friend) =>
			friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			friend.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
			<div className="mb-8">
				<h1 className="mb-2">Mes Amis</h1>
				<p className="text-gray-600">
					Gérez vos amis et invitez de nouveaux pronostiqueurs
				</p>
			</div>

			<Tabs defaultValue="friends" className="w-full">
				<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8 bg-[#F5F4F1] border border-[#E5E4E1]">
					<TabsTrigger
						value="friends"
						className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
					>
						<Users className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">Amis ({friends.length})</span>
						<span className="sm:hidden ml-1">{friends.length}</span>
					</TabsTrigger>
					<TabsTrigger
						value="requests"
						className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
					>
						<Mail className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">
							Demandes ({friendRequests.length})
						</span>
						<span className="sm:hidden ml-1">{friendRequests.length}</span>
					</TabsTrigger>
					<TabsTrigger
						value="sent"
						className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
					>
						<Clock className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">
							Envoyées ({sentRequests.length})
						</span>
						<span className="sm:hidden ml-1">{sentRequests.length}</span>
					</TabsTrigger>
					<TabsTrigger
						value="add"
						className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white text-xs sm:text-sm"
					>
						<UserPlus className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">Ajouter</span>
						<span className="sm:hidden ml-1">+</span>
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
												{friend.name.charAt(0).toUpperCase()}
											</div>
											<div>
												<h4 className="mb-1">{friend.name}</h4>
												<p className="text-sm text-gray-600 break-all">
													{friend.email}
												</p>
												{friend.common_groups !== undefined &&
													friend.common_groups > 0 && (
														<p className="text-xs text-[#548CB4] mt-1">
															{friend.common_groups} groupe
															{friend.common_groups > 1 ? "s" : ""} en commun
														</p>
													)}
											</div>
										</div>

										<div className="flex items-center justify-between sm:gap-4">
											<div>
												<div className="flex items-center gap-2 text-[#C4A15B]">
													<Trophy className="w-4 h-4" />
													<span style={{ fontWeight: 600 }}>
														{friend.total_points} pts
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
												{request.name.charAt(0).toUpperCase()}
											</div>
											<div>
												<h4 className="mb-1">{request.name}</h4>
												<p className="text-sm text-gray-600">{request.email}</p>
												{request.common_groups !== undefined &&
													request.common_groups > 0 && (
														<p className="text-xs text-[#548CB4] mt-1">
															{request.common_groups} groupe
															{request.common_groups > 1 ? "s" : ""} en commun
														</p>
													)}
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

				{/* Demandes envoyées */}
				<TabsContent value="sent">
					{sentRequests.length === 0 ? (
						<div className="bg-white border border-[#E5E4E1] p-12 text-center">
							<Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
							<h3 className="mb-2">Aucune demande envoyée</h3>
							<p className="text-gray-600">
								Vos demandes d'ami en attente apparaîtront ici
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{sentRequests.map((request) => (
								<div
									key={request.id}
									className="bg-white border border-[#E5E4E1] p-6"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div
												className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-600 text-xl"
												style={{ fontWeight: 600 }}
											>
												{request.name.charAt(0).toUpperCase()}
											</div>
											<div>
												<h4 className="mb-1">{request.name}</h4>
												<p className="text-sm text-gray-600">{request.email}</p>
											</div>
										</div>

										<div className="flex items-center gap-2 text-sm text-gray-500">
											<Clock className="w-4 h-4" />
											<span>En attente</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</TabsContent>

				{/* Ajouter un ami */}
				<TabsContent value="add">
					<div className="space-y-8">
						{/* Recherche par email */}
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
									/>
								</div>
								<Button
									onClick={() => handleSendRequest(searchEmail)}
									className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
								>
									<UserPlus className="w-4 h-4 mr-2" />
									Envoyer
								</Button>
							</div>
						</div>

						{/* Suggestions */}
						<div>
							<h3 className="mb-4">Suggestions d'amis</h3>
							<p className="text-gray-600 mb-6">
								Utilisateurs que vous pourriez connaître (dans vos groupes)
							</p>

							<div className="space-y-3">
								{friendSuggestions.map((suggestion) => (
									<div
										key={suggestion.id}
										className="bg-white border border-[#E5E4E1] p-6 hover:border-[#548CB4] transition-colors"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												<div
													className="w-12 h-12 bg-[#C4A15B] bg-opacity-10 flex items-center justify-center text-[#C4A15B] text-xl"
													style={{ fontWeight: 600 }}
												>
													{suggestion.name.charAt(0).toUpperCase()}
												</div>
												<div>
													<h4 className="mb-1">{suggestion.name}</h4>
													<p className="text-sm text-gray-600">
														{suggestion.email}
													</p>
													{suggestion.common_groups !== undefined &&
														suggestion.common_groups > 0 && (
															<p className="text-xs text-[#548CB4] mt-1">
																{suggestion.common_groups} groupe
																{suggestion.common_groups > 1 ? "s" : ""} en
																commun
															</p>
														)}
												</div>
											</div>

											<div className="flex items-center gap-4">
												<div className="text-right">
													<div className="flex items-center gap-2 text-[#C4A15B]">
														<Trophy className="w-4 h-4" />
														<span style={{ fontWeight: 600 }}>
															{suggestion.total_points} pts
														</span>
													</div>
												</div>
												<Button
													onClick={() => handleAddSuggestion(suggestion)}
													variant="outline"
													className="border-[#548CB4] text-[#548CB4] hover:bg-[#548CB4] hover:text-white"
												>
													<UserPlus className="w-4 h-4 mr-2" />
													Ajouter
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
