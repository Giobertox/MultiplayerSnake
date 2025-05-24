import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award } from 'lucide-react';
import { GameScore } from '@shared/schema';

export function Leaderboard() {
  const { data: topScores, isLoading } = useQuery<GameScore[]>({
    queryKey: ['/api/scores/top'],
    queryFn: async () => {
      const response = await fetch('/api/scores/top?limit=10');
      if (!response.ok) throw new Error('Failed to fetch scores');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="bg-ui-dark border border-accent rounded-lg p-6">
        <h3 className="text-xl font-bold text-accent mb-4 font-orbitron flex items-center">
          <Trophy className="mr-2" size={20} />
          LEADERBOARD
        </h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-game-bg p-3 rounded animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="text-yellow-400" size={16} />;
      case 2:
        return <Medal className="text-gray-400" size={16} />;
      case 3:
        return <Award className="text-orange-400" size={16} />;
      default:
        return <span className="text-accent font-bold text-sm w-4 text-center">{position}</span>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-ui-dark border border-accent rounded-lg p-6">
      <h3 className="text-xl font-bold text-accent mb-4 font-orbitron flex items-center">
        <Trophy className="mr-2" size={20} />
        LEADERBOARD
      </h3>
      
      {!topScores || topScores.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Trophy className="mx-auto mb-2 opacity-50" size={32} />
          <p>No scores yet!</p>
          <p className="text-sm">Play a game to see your score here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topScores.map((score, index) => (
            <div 
              key={score.id} 
              className={`bg-game-bg p-3 rounded border ${
                index < 3 ? 'border-accent shadow-glow' : 'border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPositionIcon(index + 1)}
                  <div>
                    <div className="font-bold text-white">{score.playerName}</div>
                    <div className="text-xs text-gray-400">
                      {score.playerCount} player{score.playerCount > 1 ? 's' : ''} • {formatTime(score.gameTime)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-accent">{score.score}</div>
                  <div className="text-xs text-gray-400">
                    {score.foodEaten} food
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}