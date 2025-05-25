import { useGame } from '@/hooks/useGame';
import { GameHeader } from '@/components/game/GameHeader';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameSidebar } from '@/components/game/GameSidebar';

export default function Game() {
  const { gameState, gameStatus, particles, startGame, togglePause, restartGame } = useGame();

  return (
    <div className="min-h-screen bg-game-bg text-white font-orbitron overflow-hidden">
      <GameHeader gameStatus={gameStatus} onTogglePause={togglePause} />
      
      <div className="flex flex-col lg:flex-row h-screen">
        <GameCanvas 
          gameState={gameState}
          gameStatus={gameStatus}
          particles={particles}
          onStartGame={startGame}
          onRestartGame={restartGame}
        />
        <GameSidebar gameState={gameState} />
      </div>
    </div>
  );
}
