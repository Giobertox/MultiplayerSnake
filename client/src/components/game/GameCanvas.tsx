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

    // Dynamic background with pulsing effect
    const time = Date.now() * 0.001;
    const pulseIntensity = Math.sin(time * 2) * 0.1 + 0.9;
    
    // Gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, `rgba(26, 26, 46, ${pulseIntensity})`);
    gradient.addColorStop(1, `rgba(16, 16, 32, ${pulseIntensity})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Enhanced animated grid with glow
    ctx.strokeStyle = `rgba(42, 42, 62, ${0.6 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 1;
    ctx.shadowColor = '#2a2a3e';
    ctx.shadowBlur = 2;
    
    for (let x = 0; x <= canvas.width; x += gameState.gridSize) {
      const lineAlpha = 0.3 + Math.sin(time * 2 + x * 0.01) * 0.2;
      ctx.globalAlpha = lineAlpha;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gameState.gridSize) {
      const lineAlpha = 0.3 + Math.sin(time * 2 + y * 0.01) * 0.2;
      ctx.globalAlpha = lineAlpha;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

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

    // Render food with spectacular effects
    gameState.food.forEach(food => {
      const x = food.x * gameState.gridSize + gameState.gridSize/2;
      const y = food.y * gameState.gridSize + gameState.gridSize/2;
      
      // Pulsing glow effect
      const pulse = Math.sin(time * 8 + food.x + food.y) * 0.3 + 0.7;
      const radius = gameState.gridSize/3 * pulse;
      
      // Outer glow
      ctx.shadowColor = '#ff6b35';
      ctx.shadowBlur = 20 * pulse;
      
      // Create gradient for food
      const foodGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      foodGradient.addColorStop(0, '#ffaa66');
      foodGradient.addColorStop(0.7, '#ff6b35');
      foodGradient.addColorStop(1, '#cc4422');
      
      ctx.fillStyle = foodGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add sparkle effect
      for (let i = 0; i < 6; i++) {
        const angle = (time * 3 + i * Math.PI / 3) % (Math.PI * 2);
        const sparkleX = x + Math.cos(angle) * radius * 1.5;
        const sparkleY = y + Math.sin(angle) * radius * 1.5;
        
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.sin(time * 5 + i) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    // Render power-ups with incredible effects
    gameState.powerups.forEach(powerup => {
      const centerX = powerup.x * gameState.gridSize + gameState.gridSize/2;
      const centerY = powerup.y * gameState.gridSize + gameState.gridSize/2;
      
      // Rotating and pulsing effects
      const rotation = time * 2 + powerup.x + powerup.y;
      const pulse = Math.sin(time * 6 + powerup.x * powerup.y) * 0.4 + 0.8;
      const scale = pulse * 1.2;
      
      // Massive glow effect
      ctx.shadowColor = powerup.color;
      ctx.shadowBlur = 30 * pulse;
      
      // Energy ring around power-up
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = (gameState.gridSize * 0.7 * scale) + (ring * 8);
        const ringAlpha = (0.3 - ring * 0.1) * pulse;
        
        ctx.globalAlpha = ringAlpha;
        ctx.strokeStyle = powerup.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
      
      // Power-up core with gradient
      const powerupGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, gameState.gridSize * 0.5 * scale
      );
      powerupGradient.addColorStop(0, '#ffffff');
      powerupGradient.addColorStop(0.3, powerup.color);
      powerupGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
      
      ctx.fillStyle = powerupGradient;
      
      // Animated shapes based on type
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      
      switch (powerup.type) {
        case 'speed':
          // Enhanced lightning bolt with animation
          ctx.beginPath();
          ctx.moveTo(-6, -8);
          ctx.lineTo(2, -2);
          ctx.lineTo(-2, -2);
          ctx.lineTo(6, 8);
          ctx.lineTo(-2, 2);
          ctx.lineTo(2, 2);
          ctx.closePath();
          ctx.fill();
          
          // Lightning effects
          for (let i = 0; i < 5; i++) {
            const sparkAngle = (time * 10 + i * Math.PI * 0.4) % (Math.PI * 2);
            const sparkX = Math.cos(sparkAngle) * 12;
            const sparkY = Math.sin(sparkAngle) * 12;
            
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = Math.sin(time * 8 + i) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'invincible':
          // Rotating shield with energy
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Protective barrier effect
          for (let i = 0; i < 8; i++) {
            const angle = (time * 4 + i * Math.PI / 4) % (Math.PI * 2);
            const barrierX = Math.cos(angle) * 12;
            const barrierY = Math.sin(angle) * 12;
            
            ctx.fillStyle = powerup.color;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(barrierX, barrierY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'length':
          // Expanding plus with energy waves
          ctx.fillRect(-2, -10, 4, 20);
          ctx.fillRect(-10, -2, 20, 4);
          
          // Energy waves
          for (let wave = 0; wave < 4; wave++) {
            const waveSize = 8 + Math.sin(time * 5 + wave) * 4;
            ctx.strokeStyle = powerup.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 - wave * 0.1;
            ctx.beginPath();
            ctx.rect(-waveSize, -waveSize, waveSize * 2, waveSize * 2);
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
      ctx.globalAlpha = 1;
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
