import { Button } from '@/components/ui/button';
import { Gamepad, Pause, Play } from 'lucide-react';

interface GameHeaderProps {
  gameStatus: string;
  onTogglePause: () => void;
}

export function GameHeader({ gameStatus, onTogglePause }: GameHeaderProps) {
  const isPaused = gameStatus === 'paused';
  
  return (
    <header className="bg-ui-dark border-b-2 border-accent p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-black text-accent tracking-wider font-orbitron">
          <Gamepad className="inline mr-3" size={32} />
          MULTIPLAYER SNAKE
        </h1>
        <div className="flex items-center space-x-4">
          <div className="bg-game-bg px-4 py-2 rounded border border-accent">
            <span className="text-sm font-mono">FPS: <span className="text-accent">60</span></span>
          </div>
          <Button 
            onClick={onTogglePause} 
            className="bg-accent hover:bg-red-600 px-6 py-2 rounded font-bold transition-colors"
            disabled={gameStatus === 'waiting' || gameStatus === 'gameOver'}
          >
            {isPaused ? (
              <>
                <Play className="mr-2" size={16} />
                RESUME
              </>
            ) : (
              <>
                <Pause className="mr-2" size={16} />
                PAUSE
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
