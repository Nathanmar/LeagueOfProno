import { useState } from "react";
import { useNavigate } from "react-router";
import { groups as initialGroups, currentUser } from "../data/mockData";
import type { Group } from "../data/mockData";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Users, Plus, LogIn } from "lucide-react";

export function Dashboard() {
	const navigate = useNavigate();
	const [groups, setGroups] = useState(initialGroups);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
	const [newGroupName, setNewGroupName] = useState("");
	const [newGroupDescription, setNewGroupDescription] = useState("");
	const [inviteCode, setInviteCode] = useState("");

	// Groupes de l'utilisateur actuel
	const userGroups = groups.filter((g) => g.members.includes(currentUser.id));

	const handleCreateGroup = () => {
		if (!newGroupName.trim()) return;

		// Générer un code d'invitation aléatoire
		const code = Math.random().toString(36).substring(2, 10).toUpperCase();

		const newGroup: Group = {
			id: `group_${Date.now()}`,
			name: newGroupName,
			invite_code: code,
			description: newGroupDescription,
			members: [currentUser.id],
			created_by: currentUser.id,
		};

		setGroups([...groups, newGroup]);
		setNewGroupName("");
		setNewGroupDescription("");
		setIsCreateModalOpen(false);
	};

	const handleJoinGroup = () => {
		if (!inviteCode.trim()) return;

		const group = groups.find(
			(g) => g.invite_code.toUpperCase() === inviteCode.toUpperCase(),
		);

		if (!group) {
			alert("Groupe introuvable. Vérifiez le code d'invitation.");
			return;
		}

		if (group.members.includes(currentUser.id)) {
			alert("Vous êtes déjà membre de ce groupe.");
			return;
		}

		// Ajouter l'utilisateur au groupe
		const updatedGroups = groups.map((g) =>
			g.id === group.id ? { ...g, members: [...g.members, currentUser.id] } : g,
		);

		setGroups(updatedGroups);
		setInviteCode("");
		setIsJoinModalOpen(false);
	};

	return (
		<div className="max-w-7xl mx-auto px-6 py-12">
			<div className="mb-12">
				<h1 className="mb-3">Mes Groupes</h1>
				<p className="text-gray-600 text-lg">
					Bienvenue, {currentUser.name} ! Sélectionnez un groupe pour voir les
					matchs et faire vos pronostics.
				</p>
			</div>

			{/* Actions */}
			<div className="flex gap-4 mb-8">
				<Button
					onClick={() => setIsCreateModalOpen(true)}
					className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
				>
					<Plus className="w-4 h-4 mr-2" />
					Créer un groupe
				</Button>
				<Button
					onClick={() => setIsJoinModalOpen(true)}
					variant="outline"
					className="border-[#548CB4] text-[#548CB4] hover:bg-[#548CB4] hover:text-white"
				>
					<LogIn className="w-4 h-4 mr-2" />
					Rejoindre un groupe
				</Button>
			</div>

			{/* Liste des groupes */}
			{userGroups.length === 0 ? (
				<div className="bg-white border border-[#E5E4E1] p-12 text-center">
					<Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
					<h3 className="mb-2">Aucun groupe</h3>
					<p className="text-gray-600 mb-6">
						Créez votre premier groupe ou rejoignez-en un avec un code
						d'invitation.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{userGroups.map((group) => (
						<div
							key={group.id}
							className="bg-white border border-[#E5E4E1] p-6 hover:border-[#548CB4] transition-colors"
						>
							<div className="mb-4">
								<h3 className="mb-2">{group.name}</h3>
								{group.description && (
									<p className="text-gray-600 text-sm">{group.description}</p>
								)}
							</div>

							<div className="mb-6">
								<div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
									<Users className="w-4 h-4" />
									<span>
										{group.members.length} membre
										{group.members.length > 1 ? "s" : ""}
									</span>
								</div>
								<div className="text-sm text-gray-600">
									Code :{" "}
									<span
										className="font-mono bg-[#F5F4F1] px-2 py-1"
										style={{ fontWeight: 600 }}
									>
										{group.invite_code}
									</span>
								</div>
							</div>

							<Button
								onClick={() => navigate(`/groups/${group.id}`)}
								className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
							>
								Voir le groupe
							</Button>
						</div>
					))}
				</div>
			)}

			{/* Modale Créer un groupe */}
			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent className="bg-white border-[#E5E4E1]">
					<DialogHeader>
						<DialogTitle>Créer un nouveau groupe</DialogTitle>
						<DialogDescription>
							Créez un groupe privé pour faire des pronostics avec vos amis
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div>
							<Label htmlFor="groupName">Nom du groupe *</Label>
							<Input
								id="groupName"
								value={newGroupName}
								onChange={(e) => setNewGroupName(e.target.value)}
								placeholder="Ex: Les experts de la LEC"
								className="border-[#E5E4E1] focus:border-[#548CB4]"
							/>
						</div>

						<div>
							<Label htmlFor="groupDescription">Description (optionnel)</Label>
							<Textarea
								id="groupDescription"
								value={newGroupDescription}
								onChange={(e) => setNewGroupDescription(e.target.value)}
								placeholder="Décrivez votre groupe..."
								className="border-[#E5E4E1] focus:border-[#548CB4]"
								rows={3}
							/>
						</div>
					</div>

					<div className="flex gap-3 justify-end">
						<Button
							variant="outline"
							onClick={() => setIsCreateModalOpen(false)}
							className="border-[#E5E4E1] hover:bg-[#F5F4F1]"
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateGroup}
							disabled={!newGroupName.trim()}
							className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white disabled:opacity-50"
						>
							Créer le groupe
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Modale Rejoindre un groupe */}
			<Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
				<DialogContent className="bg-white border-[#E5E4E1]">
					<DialogHeader>
						<DialogTitle>Rejoindre un groupe</DialogTitle>
						<DialogDescription>
							Entrez le code d'invitation pour rejoindre un groupe existant
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="inviteCode">Code d'invitation</Label>
						<Input
							id="inviteCode"
							value={inviteCode}
							onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
							placeholder="Ex: HRQO3ACS"
							className="font-mono border-[#E5E4E1] focus:border-[#548CB4]"
						/>
					</div>

					<div className="flex gap-3 justify-end">
						<Button
							variant="outline"
							onClick={() => setIsJoinModalOpen(false)}
							className="border-[#E5E4E1] hover:bg-[#F5F4F1]"
						>
							Annuler
						</Button>
						<Button
							onClick={handleJoinGroup}
							disabled={!inviteCode.trim()}
							className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white disabled:opacity-50"
						>
							Rejoindre
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
