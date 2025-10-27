import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-[#C4A15B]" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-[#CD7F32]" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-[#E5E4E1] p-6">
      <h3 className="mb-6">Classement</h3>
      
      <div className="space-y-3">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.userId === currentUserId;
          
          return (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-4 transition-colors ${
                isCurrentUser 
                  ? "bg-[#548CB4] bg-opacity-10 border border-[#548CB4]" 
                  : "bg-[#F5F4F1]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-center">
                  {getRankIcon(rank) || (
                    <span className="text-gray-500" style={{ fontWeight: 600 }}>
                      {rank}
                    </span>
                  )}
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>
                    {entry.userName}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-[#548CB4]">(Vous)</span>
                    )}
                  </p>
                </div>
              </div>
              <div style={{ fontWeight: 700 }} className="text-lg">
                {entry.score} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
