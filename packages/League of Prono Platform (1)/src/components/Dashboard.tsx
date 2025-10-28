import { useState } from "react";
import { 
  Group, 
  groups as initialGroups, 
  currentUser,
  matches,
  predictions,
  Match,
  Prediction
} from "../data/mockData";
import { friends } from "../data/friendsData";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { MatchCard } from "./MatchCard";
import { MatchPredictionsModal } from "./MatchPredictionsModal";
import { Users, Plus, LogIn, Trophy, UserPlus } from "lucide-react";

interface DashboardProps {
  onSelectGroup: (groupId: string) => void;
  onNavigateToFriends: () => void;
}

export function Dashboard({ onSelectGroup, onNavigateToFriends }: DashboardProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isMatchPredictionsModalOpen, setIsMatchPredictionsModalOpen] = useState(false);

  // Groupes de l'utilisateur actuel
  const userGroups = groups.filter(g => g.members.includes(currentUser.id));

  // Matchs en cours
  const liveMatches = matches.filter(m => m.status === "live");

  // Obtenir la prédiction de l'utilisateur pour un match
  const getUserPrediction = (matchId: string): Prediction | undefined => {
    return predictions.find(
      p => p.user_id === currentUser.id && p.match_id === matchId
    );
  };

  // Obtenir tous les pronostics pour un match (tous groupes confondus)
  const getMatchPredictions = (matchId: string): Prediction[] => {
    return predictions.filter(p => p.match_id === matchId);
  };

  const handleOpenMatchPredictionsModal = (match: Match) => {
    setSelectedMatch(match);
    setIsMatchPredictionsModalOpen(true);
  };

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

    const group = groups.find(g => g.invite_code.toUpperCase() === inviteCode.toUpperCase());
    
    if (!group) {
      alert("Groupe introuvable. Vérifiez le code d'invitation.");
      return;
    }

    if (group.members.includes(currentUser.id)) {
      alert("Vous êtes déjà membre de ce groupe.");
      return;
    }

    // Ajouter l'utilisateur au groupe
    const updatedGroups = groups.map(g => 
      g.id === group.id 
        ? { ...g, members: [...g.members, currentUser.id] }
        : g
    );

    setGroups(updatedGroups);
    setInviteCode("");
    setIsJoinModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <h1 className="mb-3">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue, {currentUser.name} ! Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Grid principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Matchs en cours */}
          {liveMatches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2>Matchs en direct</h2>
                <div className="flex items-center gap-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm" style={{ fontWeight: 600 }}>{liveMatches.length} LIVE</span>
                </div>
              </div>
              <div className="space-y-4">
                {liveMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={getUserPrediction(match.id)}
                    onViewPredictions={() => handleOpenMatchPredictionsModal(match)}
                    groupPredictionsCount={getMatchPredictions(match.id).length}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Mes Groupes */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2>Mes Groupes</h2>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  size="sm"
                  className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </Button>
                <Button
                  onClick={() => setIsJoinModalOpen(true)}
                  size="sm"
                  variant="outline"
                  className="border-[#548CB4] text-[#548CB4] hover:bg-[#548CB4] hover:text-white flex-1 sm:flex-none"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Rejoindre
                </Button>
              </div>
            </div>

            {userGroups.length === 0 ? (
              <div className="bg-white border border-[#E5E4E1] p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">Aucun groupe</h3>
                <p className="text-gray-600 mb-6">
                  Créez votre premier groupe ou rejoignez-en un avec un code d'invitation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGroups.map(group => (
                  <div
                    key={group.id}
                    className="bg-white border border-[#E5E4E1] p-6 hover:border-[#548CB4] transition-colors cursor-pointer"
                    onClick={() => onSelectGroup(group.id)}
                  >
                    <div className="mb-4">
                      <h4 className="mb-1">{group.name}</h4>
                      {group.description && (
                        <p className="text-gray-600 text-sm">{group.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{group.members.length} membre{group.members.length > 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-xs font-mono bg-[#F5F4F1] px-2 py-1">
                        {group.invite_code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mes Amis */}
          <section className="bg-white border border-[#E5E4E1] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Mes Amis</h3>
              <Button
                onClick={onNavigateToFriends}
                size="sm"
                variant="ghost"
                className="hover:bg-[#F5F4F1]"
              >
                Voir tout
              </Button>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">Aucun ami pour le moment</p>
                <Button
                  onClick={onNavigateToFriends}
                  size="sm"
                  variant="outline"
                  className="border-[#548CB4] text-[#548CB4] hover:bg-[#548CB4] hover:text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter des amis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.slice(0, 5).map(friend => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-[#F5F4F1] hover:bg-[#E5E4E1] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#548CB4] bg-opacity-10 flex items-center justify-center text-[#548CB4]" style={{ fontWeight: 600 }}>
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }} className="text-sm">{friend.name}</div>
                        <div className="text-xs text-gray-600">{friend.total_points} pts</div>
                      </div>
                    </div>
                    <Trophy className="w-4 h-4 text-[#C4A15B]" />
                  </div>
                ))}
                {friends.length > 5 && (
                  <Button
                    onClick={onNavigateToFriends}
                    variant="outline"
                    size="sm"
                    className="w-full border-[#E5E4E1] hover:bg-[#F5F4F1]"
                  >
                    Voir tous mes amis ({friends.length})
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Statistiques rapides */}
          <section className="bg-gradient-to-br from-[#548CB4] to-[#4a7ca0] text-white p-6">
            <h3 className="mb-4 text-white">Vos statistiques</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm opacity-90">Points totaux</div>
                <div className="text-3xl" style={{ fontWeight: 700 }}>{currentUser.total_points}</div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="text-sm opacity-90">Groupes actifs</div>
                <div className="text-2xl" style={{ fontWeight: 700 }}>{userGroups.length}</div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="text-sm opacity-90">Amis</div>
                <div className="text-2xl" style={{ fontWeight: 700 }}>{friends.length}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

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

      {/* Modale des pronostics d'un match */}
      <MatchPredictionsModal
        match={selectedMatch}
        predictions={selectedMatch ? getMatchPredictions(selectedMatch.id) : []}
        isOpen={isMatchPredictionsModalOpen}
        onClose={() => setIsMatchPredictionsModalOpen(false)}
      />
    </div>
  );
}
