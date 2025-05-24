import { GameState } from '@/types/game';
import { Zap, Shield, Plus } from 'lucide-react';
import { Leaderboard } from './Leaderboard';

interface GameSidebarProps {
  gameState: GameState;
}

export function GameSidebar({ gameState }: GameSidebarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayerOpacity = (index: number) => {
    return index < gameState.players.length ? 'opacity-100' : 'opacity-50';
  };

  const getPlayerData = (index: number) => {
    if (index < gameState.players.length) {
      const player = gameState.players[index];
      return {
        score: player.score,
        length: player.length,
        isAlive: player.isAlive
      };
    }
    return { score: 0, length: 3, isAlive: true };
  };

  return (
    <div className="lg:w-80 bg-ui-dark border-l-2 border-accent p-6 space-y-6">
      {/* Player Scores */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-accent border-b border-accent pb-2 font-orbitron">SCORES</h3>
        
        {[0, 1, 2, 3].map((index) => {
          const playerData = getPlayerData(index);
          const colors = ['player1', 'player2', 'player3', 'player4'];
          const glowColors = ['shadow-glow-green', 'shadow-glow-red', 'shadow-glow-blue', 'shadow-glow-yellow'];
          
          return (
            <div 
              key={index}
              className={`bg-game-bg p-4 rounded border border-${colors[index]} ${glowColors[index]} ${getPlayerOpacity(index)} ${!playerData.isAlive ? 'opacity-30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 bg-${colors[index]} rounded`}></div>
                  <span className="font-bold font-orbitron">PLAYER {index + 1}</span>
                  {!playerData.isAlive && <span className="text-red-500 text-xs">(DEAD)</span>}
                </div>
                <span className={`text-2xl font-mono font-bold text-${colors[index]}`}>
                  {playerData.score}
                </span>
              </div>
              <div className="mt-2 text-sm font-mono text-gray-400">
                Length: <span>{playerData.length}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Power-up Status */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-accent border-b border-accent pb-2 font-orbitron">POWER-UPS</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-game-bg p-3 rounded border border-powerup-speed text-center">
            <Zap className="text-powerup-speed text-xl mb-2 mx-auto" size={20} />
            <div className="text-xs font-bold">SPEED</div>
            <div className="text-xs font-mono text-gray-400">
              {gameState.players.length > 0 ? 
                Math.max(...gameState.players.map(p => Math.ceil(p.powerups.speed / 60))) : 0}s
            </div>
          </div>
          
          <div className="bg-game-bg p-3 rounded border border-powerup-invincible text-center">
            <Shield className="text-powerup-invincible text-xl mb-2 mx-auto" size={20} />
            <div className="text-xs font-bold">SHIELD</div>
            <div className="text-xs font-mono text-gray-400">
              {gameState.players.length > 0 ? 
                Math.max(...gameState.players.map(p => Math.ceil(p.powerups.invincible / 60))) : 0}s
            </div>
          </div>
          
          <div className="bg-game-bg p-3 rounded border border-powerup-length text-center">
            <Plus className="text-powerup-length text-xl mb-2 mx-auto" size={20} />
            <div className="text-xs font-bold">LENGTH</div>
            <div className="text-xs font-mono text-gray-400">
              {gameState.powerups.filter(p => p.type === 'length').length}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Guide */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-accent border-b border-accent pb-2 font-orbitron">CONTROLS</h3>
        
        <div className="space-y-3 text-sm">
          {[
            { player: 'Player 1:', keys: 'W A S D', color: 'player1' },
            { player: 'Player 2:', keys: '↑ ← ↓ →', color: 'player2' },
            { player: 'Player 3:', keys: 'I J K L', color: 'player3' },
            { player: 'Player 4:', keys: 'T F G H', color: 'player4' }
          ].map((control, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 bg-${control.color} rounded`}></div>
                <span>{control.player}</span>
              </div>
              <div className="font-mono bg-game-bg px-2 py-1 rounded">{control.keys}</div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-gray-600 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Pause/Resume:</span>
            <span className="font-mono bg-game-bg px-2 py-1 rounded">SPACE</span>
          </div>
          <div className="flex justify-between">
            <span>Restart:</span>
            <span className="font-mono bg-game-bg px-2 py-1 rounded">R</span>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-accent border-b border-accent pb-2 font-orbitron">GAME STATS</h3>
        
        <div className="bg-game-bg p-4 rounded space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Game Time:</span>
            <span className="font-mono text-accent">{formatTime(gameState.gameTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Food Eaten:</span>
            <span className="font-mono text-accent">{gameState.foodEaten}</span>
          </div>
          <div className="flex justify-between">
            <span>Power-ups Used:</span>
            <span className="font-mono text-accent">{gameState.powerupsUsed}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Players:</span>
            <span className="font-mono text-accent">{gameState.activePlayers}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard />
    </div>
  );
}
