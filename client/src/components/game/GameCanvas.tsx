import { useEffect, useRef } from 'react';
import { GameState, GameStatus } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Particle } from '@/hooks/useParticles';

interface GameCanvasProps {
  gameState: GameState;
  gameStatus: GameStatus;
  particles: Particle[];
  onStartGame: (playerCount: number) => void;
  onRestartGame: () => void;
}

export function GameCanvas({ gameState, gameStatus, particles, onStartGame, onRestartGame }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gameState.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gameState.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render snakes with enhanced effects
    gameState.players.forEach(player => {
      if (!player.isAlive) return;
      
      ctx.fillStyle = player.color;
      
      // Enhanced effects for power-ups
      if (player.powerups.invincible > 0) {
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 25;
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
      } else if (player.powerups.speed > 0) {
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowBlur = 5;
        ctx.shadowColor = player.color;
      }
      
      player.segments.forEach((segment, index) => {
        const x = segment.x * gameState.gridSize;
        const y = segment.y * gameState.gridSize;
        
        if (index === 0) {
          // Head - enhanced with eyes and direction indicator
          const headSize = gameState.gridSize - 2;
          ctx.fillRect(x + 1, y + 1, headSize, headSize);
          
          // Add eyes to the head
          ctx.fillStyle = '#ffffff';
          const eyeSize = 3;
          const eyeOffset = 4;
          ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + gameState.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
          
          // Reset color for body
          ctx.fillStyle = player.color;
        } else {
          // Body with gradient effect
          const bodyAlpha = 1 - (index / player.segments.length) * 0.3;
          ctx.globalAlpha = bodyAlpha;
          const bodySize = gameState.gridSize - 4;
          ctx.fillRect(x + 2, y + 2, bodySize, bodySize);
        }
      });
      
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // Render food
    ctx.fillStyle = '#ff6b35';
    gameState.food.forEach(food => {
      const x = food.x * gameState.gridSize;
      const y = food.y * gameState.gridSize;
      ctx.beginPath();
      ctx.arc(x + gameState.gridSize/2, y + gameState.gridSize/2, gameState.gridSize/3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render power-ups
    gameState.powerups.forEach(powerup => {
      const x = powerup.x * gameState.gridSize;
      const y = powerup.y * gameState.gridSize;
      
      ctx.fillStyle = powerup.color;
      ctx.shadowColor = powerup.color;
      ctx.shadowBlur = 15;
      
      // Draw different shapes for different power-ups
      switch (powerup.type) {
        case 'speed':
          // Lightning bolt shape
          ctx.beginPath();
          ctx.moveTo(x + gameState.gridSize * 0.3, y + gameState.gridSize * 0.2);
          ctx.lineTo(x + gameState.gridSize * 0.7, y + gameState.gridSize * 0.4);
          ctx.lineTo(x + gameState.gridSize * 0.5, y + gameState.gridSize * 0.4);
          ctx.lineTo(x + gameState.gridSize * 0.7, y + gameState.gridSize * 0.8);
          ctx.lineTo(x + gameState.gridSize * 0.3, y + gameState.gridSize * 0.6);
          ctx.lineTo(x + gameState.gridSize * 0.5, y + gameState.gridSize * 0.6);
          ctx.closePath();
          ctx.fill();
          break;
        case 'invincible':
          // Shield shape
          ctx.beginPath();
          ctx.arc(x + gameState.gridSize/2, y + gameState.gridSize/2, gameState.gridSize/3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'length':
          // Plus sign
          const size = gameState.gridSize * 0.6;
          const thickness = size * 0.3;
          const centerX = x + gameState.gridSize/2;
          const centerY = y + gameState.gridSize/2;
          
          ctx.fillRect(centerX - thickness/2, centerY - size/2, thickness, size);
          ctx.fillRect(centerX - size/2, centerY - thickness/2, size, thickness);
          break;
      }
      
      ctx.shadowBlur = 0;
    });

    // Render particles with amazing effects
    if (particles && particles.length > 0) {
      particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
      
      if (particle.type === 'explosion') {
        // Explosion particles - expanding circles
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 - alpha), 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'sparkle') {
        // Sparkle particles - twinkling stars
        const size = particle.size * alpha;
        ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
        // Add cross sparkle effect
        ctx.fillRect(particle.x - size, particle.y - 1, size * 2, 2);
        ctx.fillRect(particle.x - 1, particle.y - size, 2, size * 2);
      } else if (particle.type === 'powerup') {
        // Power-up particles - glowing orbs
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        // Add inner glow
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Default particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
    }
  }, [gameState, particles]);

  const showOverlay = gameStatus === 'waiting' || gameStatus === 'gameOver';

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={gameState.canvasWidth} 
          height={gameState.canvasHeight} 
          className="border-2 border-accent bg-canvas-bg shadow-glow rounded-lg"
        />
        
        {showOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              {gameStatus === 'waiting' ? (
                <>
                  <h2 className="text-4xl font-black text-accent mb-4 font-orbitron">PRESS SPACE TO START</h2>
                  <p className="text-lg mb-8">Choose number of players: 1-4</p>
                  <div className="flex space-x-3 justify-center">
                    <Button 
                      onClick={() => onStartGame(1)} 
                      className="bg-accent text-white px-4 py-3 rounded font-bold hover:shadow-glow transition-all"
                    >
                      1 PLAYER
                    </Button>
                    <Button 
                      onClick={() => onStartGame(2)} 
                      className="bg-player1 text-black px-4 py-3 rounded font-bold hover:shadow-glow-green transition-all"
                    >
                      2 PLAYERS
                    </Button>
                    <Button 
                      onClick={() => onStartGame(3)} 
                      className="bg-player2 text-white px-4 py-3 rounded font-bold hover:shadow-glow-red transition-all"
                    >
                      3 PLAYERS
                    </Button>
                    <Button 
                      onClick={() => onStartGame(4)} 
                      className="bg-player3 text-white px-4 py-3 rounded font-bold hover:shadow-glow-blue transition-all"
                    >
                      4 PLAYERS
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-black text-accent mb-4 font-orbitron">GAME OVER</h2>
                  <p className="text-lg mb-8">Press R to restart or click below</p>
                  <Button 
                    onClick={onRestartGame} 
                    className="bg-accent hover:bg-red-600 px-6 py-3 rounded font-bold transition-all"
                  >
                    RESTART GAME
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
