export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface PowerUp {
  speed: number;
  invincible: number;
  extraLength: number;
}

export interface Player {
  id: number;
  segments: Position[];
  direction: Direction;
  color: string;
  score: number;
  length: number;
  powerups: PowerUp;
  isAlive: boolean;
}

export interface Food {
  x: number;
  y: number;
}

export interface GamePowerUp {
  x: number;
  y: number;
  type: 'speed' | 'invincible' | 'length';
  color: string;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  players: Player[];
  food: Food[];
  powerups: GamePowerUp[];
  gridSize: number;
  gameSpeed: number;
  canvasWidth: number;
  canvasHeight: number;
  gameTime: number;
  foodEaten: number;
  powerupsUsed: number;
  activePlayers: number;
}

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'gameOver';

export interface KeyControls {
  [key: string]: {
    player: number;
    direction: Direction;
  };
}
