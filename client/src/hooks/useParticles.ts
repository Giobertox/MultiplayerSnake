import { useState, useCallback, useRef, useEffect } from 'react';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'explosion' | 'sparkle' | 'powerup' | 'trail';
}

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();

  const createParticle = useCallback((
    x: number, 
    y: number, 
    type: Particle['type'], 
    color: string = '#ffffff'
  ): Particle => {
    const speed = type === 'explosion' ? 3 : type === 'powerup' ? 1.5 : 1;
    const angle = Math.random() * Math.PI * 2;
    
    return {
      id: Math.random().toString(36),
      x,
      y,
      vx: Math.cos(angle) * speed * (0.5 + Math.random()),
      vy: Math.sin(angle) * speed * (0.5 + Math.random()),
      life: type === 'explosion' ? 30 : type === 'powerup' ? 60 : 20,
      maxLife: type === 'explosion' ? 30 : type === 'powerup' ? 60 : 20,
      color,
      size: type === 'explosion' ? 3 : type === 'powerup' ? 4 : 2,
      type
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color?: string) => {
    const newParticles = Array.from({ length: count }, () => 
      createParticle(x, y, type, color)
    );
    
    setParticles(prev => [...prev, ...newParticles]);
  }, [createParticle]);

  const spawnTrailParticles = useCallback((segments: Array<{x: number, y: number}>, color: string) => {
    if (segments.length > 1) {
      const tail = segments[segments.length - 1];
      const newParticles = Array.from({ length: 3 }, () => 
        createParticle(tail.x * 20 + 10, tail.y * 20 + 10, 'trail', color)
      );
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [createParticle]);

  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98, // Friction
        vy: particle.vy * 0.98,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    );
  }, []);

  useEffect(() => {
    const animate = () => {
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length, updateParticles]);

  const effects = {
    foodEaten: (x: number, y: number) => spawnParticles(x, y, 25, 'sparkle', '#ff6b35'),
    powerupCollected: (x: number, y: number, color: string) => spawnParticles(x, y, 35, 'powerup', color),
    snakeDeath: (x: number, y: number, color: string) => spawnParticles(x, y, 50, 'explosion', color),
    gameStart: (x: number, y: number) => spawnParticles(x, y, 100, 'sparkle', '#e94560'),
    snakeTrail: spawnTrailParticles,
  };

  return { particles, effects };
}