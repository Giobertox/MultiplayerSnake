import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Player, Position, Direction, Food, GamePowerUp, GameStatus } from '@/types/game';
import { apiRequest } from '@/lib/queryClient';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INITIAL_GAME_SPEED = 150;

const PLAYER_COLORS = ['#00ff00', '#ff0040', '#0080ff', '#ffff00'];
const START_POSITIONS: Position[] = [
  { x: 5, y: 5 },
  { x: 35, y: 25 },
  { x: 5, y: 25 },
  { x: 35, y: 5 }
];

const CONTROLS = {
  // Player 1: WASD
  'w': { player: 0, direction: { x: 0, y: -1 } },
  'a': { player: 0, direction: { x: -1, y: 0 } },
  's': { player: 0, direction: { x: 0, y: 1 } },
  'd': { player: 0, direction: { x: 1, y: 0 } },
  
  // Player 2: Arrow keys
  'ArrowUp': { player: 1, direction: { x: 0, y: -1 } },
  'ArrowLeft': { player: 1, direction: { x: -1, y: 0 } },
  'ArrowDown': { player: 1, direction: { x: 0, y: 1 } },
  'ArrowRight': { player: 1, direction: { x: 1, y: 0 } },
  
  // Player 3: IJKL
  'i': { player: 2, direction: { x: 0, y: -1 } },
  'j': { player: 2, direction: { x: -1, y: 0 } },
  'k': { player: 2, direction: { x: 0, y: 1 } },
  'l': { player: 2, direction: { x: 1, y: 0 } },
  
  // Player 4: TFGH
  't': { player: 3, direction: { x: 0, y: -1 } },
  'f': { player: 3, direction: { x: -1, y: 0 } },
  'g': { player: 3, direction: { x: 0, y: 1 } },
  'h': { player: 3, direction: { x: 1, y: 0 } }
};

export function useGame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isPaused: false,
    players: [],
    food: [],
    powerups: [],
    gridSize: GRID_SIZE,
    gameSpeed: INITIAL_GAME_SPEED,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    gameTime: 0,
    foodEaten: 0,
    powerupsUsed: 0,
    activePlayers: 0
  });

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);

  const saveGameResults = useCallback(async (finalState: GameState) => {
    try {
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Find winner (highest score)
      const winner = finalState.players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );

      // Save individual scores for each player
      for (let i = 0; i < finalState.players.length; i++) {
        const player = finalState.players[i];
        await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerName: `Player ${i + 1}`,
            score: player.score,
            gameTime: finalState.gameTime,
            playerCount: finalState.players.length,
            foodEaten: finalState.foodEaten,
            powerupsUsed: finalState.powerupsUsed,
            gameMode: 'classic'
          })
        });
      }

      // Save game result
      await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          totalPlayers: finalState.players.length,
          gameDuration: finalState.gameTime,
          totalFoodEaten: finalState.foodEaten,
          totalPowerupsUsed: finalState.powerupsUsed,
          winnerName: `Player ${winner.id + 1}`,
          playerScores: finalState.players.map((p, i) => ({
            playerName: `Player ${i + 1}`,
            score: p.score,
            isAlive: p.isAlive
          }))
        })
      });
    } catch (error) {
      console.log('Failed to save game results:', error);
    }
  }, []);

  const initializePlayers = useCallback((playerCount: number): Player[] => {
    const players: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: i,
        segments: [{ ...START_POSITIONS[i] }],
        direction: { x: 1, y: 0 },
        color: PLAYER_COLORS[i],
        score: 0,
        length: 1,
        powerups: {
          speed: 0,
          invincible: 0,
          extraLength: 0
        },
        isAlive: true
      });
    }
    return players;
  }, []);

  const spawnFood = useCallback((excludePositions: Position[] = []): Food => {
    const gridWidth = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    const gridHeight = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
    
    let food: Food;
    let attempts = 0;
    
    do {
      food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
      };
      attempts++;
    } while (
      attempts < 100 &&
      excludePositions.some(pos => pos.x === food.x && pos.y === food.y)
    );
    
    return food;
  }, []);

  const spawnPowerUp = useCallback((excludePositions: Position[] = []): GamePowerUp => {
    const gridWidth = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    const gridHeight = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
    const types: Array<'speed' | 'invincible' | 'length'> = ['speed', 'invincible', 'length'];
    const colors = ['#ff6b35', '#7209b7', '#f72585'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    let powerup: GamePowerUp;
    let attempts = 0;
    
    do {
      powerup = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
        type,
        color: colors[types.indexOf(type)]
      };
      attempts++;
    } while (
      attempts < 100 &&
      excludePositions.some(pos => pos.x === powerup.x && pos.y === powerup.y)
    );
    
    return powerup;
  }, []);

  const checkCollision = useCallback((head: Position, segments: Position[]): boolean => {
    // Wall collision
    const gridWidth = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    const gridHeight = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
    
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      return true;
    }
    
    // Self collision
    return segments.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const checkSnakeCollision = useCallback((head: Position, otherPlayers: Player[]): boolean => {
    return otherPlayers.some(player => 
      player.isAlive && player.segments.some(segment => segment.x === head.x && segment.y === head.y)
    );
  }, []);

  const updateGame = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.isRunning || prevState.isPaused) return prevState;

      const newState = { ...prevState };
      const allSegments: Position[] = [];
      
      // Collect all segments for collision detection
      newState.players.forEach(player => {
        if (player.isAlive) {
          allSegments.push(...player.segments);
        }
      });

      // Update each player
      newState.players.forEach(player => {
        if (!player.isAlive) return;

        const head = { ...player.segments[0] };
        head.x += player.direction.x;
        head.y += player.direction.y;

        // Check collisions
        const hitWall = checkCollision(head, player.segments);
        const hitOtherSnake = checkSnakeCollision(head, newState.players.filter(p => p.id !== player.id));
        
        if ((hitWall || hitOtherSnake) && player.powerups.invincible === 0) {
          player.isAlive = false;
          return;
        }

        player.segments.unshift(head);

        // Check food collision
        const foodIndex = newState.food.findIndex(food => food.x === head.x && food.y === head.y);
        if (foodIndex !== -1) {
          player.score += 10;
          player.length = player.segments.length;
          newState.food.splice(foodIndex, 1);
          newState.foodEaten++;
          
          // Spawn new food
          newState.food.push(spawnFood(allSegments));
        } else {
          player.segments.pop();
        }

        // Check power-up collision
        const powerupIndex = newState.powerups.findIndex(powerup => powerup.x === head.x && powerup.y === head.y);
        if (powerupIndex !== -1) {
          const powerup = newState.powerups[powerupIndex];
          
          switch (powerup.type) {
            case 'speed':
              player.powerups.speed = 300; // 5 seconds at 60fps
              break;
            case 'invincible':
              player.powerups.invincible = 300; // 5 seconds
              break;
            case 'length':
              player.powerups.extraLength = 3;
              // Add segments immediately
              for (let i = 0; i < 3; i++) {
                player.segments.push({ ...player.segments[player.segments.length - 1] });
              }
              break;
          }
          
          newState.powerups.splice(powerupIndex, 1);
          newState.powerupsUsed++;
        }

        // Update power-up timers
        if (player.powerups.speed > 0) player.powerups.speed--;
        if (player.powerups.invincible > 0) player.powerups.invincible--;
        
        player.length = player.segments.length;
      });

      // Spawn power-ups randomly
      if (Math.random() < 0.005 && newState.powerups.length < 3) { // 0.5% chance per frame
        newState.powerups.push(spawnPowerUp(allSegments));
      }

      // Update active players count
      newState.activePlayers = newState.players.filter(p => p.isAlive).length;

      // Check game over
      if (newState.players.length === 1) {
        // Single player: game over when player dies
        if (newState.activePlayers === 0) {
          newState.isRunning = false;
          setGameStatus('gameOver');
          saveGameResults(newState);
        }
      } else {
        // Multiplayer: game over when only one or no players remain
        if (newState.activePlayers <= 1) {
          newState.isRunning = false;
          setGameStatus('gameOver');
          saveGameResults(newState);
        }
      }

      return newState;
    });
  }, [checkCollision, checkSnakeCollision, spawnFood, spawnPowerUp, saveGameResults]);

  const gameLoop = useCallback((currentTime: number) => {
    if (currentTime - lastTimeRef.current >= gameState.gameSpeed) {
      updateGame();
      lastTimeRef.current = currentTime;
      
      if (gameState.isRunning && !gameState.isPaused) {
        gameTimeRef.current += gameState.gameSpeed;
        setGameState(prev => ({ ...prev, gameTime: Math.floor(gameTimeRef.current / 1000) }));
      }
    }
    
    if (gameState.isRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState.gameSpeed, gameState.isRunning, gameState.isPaused, updateGame]);

  const startGame = useCallback((playerCount: number) => {
    const players = initializePlayers(playerCount);
    const initialFood = spawnFood();
    
    setGameState({
      isRunning: true,
      isPaused: false,
      players,
      food: [initialFood],
      powerups: [],
      gridSize: GRID_SIZE,
      gameSpeed: INITIAL_GAME_SPEED,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      gameTime: 0,
      foodEaten: 0,
      powerupsUsed: 0,
      activePlayers: playerCount
    });
    
    setGameStatus('playing');
    gameTimeRef.current = 0;
    lastTimeRef.current = 0;
  }, [initializePlayers, spawnFood]);

  const togglePause = useCallback(() => {
    if (gameState.isRunning) {
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      setGameStatus(prev => prev === 'paused' ? 'playing' : 'paused');
    }
  }, [gameState.isRunning]);

  const restartGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    setGameState({
      isRunning: false,
      isPaused: false,
      players: [],
      food: [],
      powerups: [],
      gridSize: GRID_SIZE,
      gameSpeed: INITIAL_GAME_SPEED,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      gameTime: 0,
      foodEaten: 0,
      powerupsUsed: 0,
      activePlayers: 0
    });
    
    setGameStatus('waiting');
    gameTimeRef.current = 0;
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    
    // Game controls
    if (key === ' ') {
      event.preventDefault();
      togglePause();
      return;
    }
    
    if (key.toLowerCase() === 'r' && gameStatus === 'gameOver') {
      restartGame();
      return;
    }
    
    // Player controls
    const control = CONTROLS[key] || CONTROLS[key.toLowerCase()];
    if (control && gameState.players[control.player] && gameState.players[control.player].isAlive) {
      const player = gameState.players[control.player];
      const currentDir = player.direction;
      const newDir = control.direction;
      
      // Prevent reverse direction
      if (currentDir.x !== -newDir.x || currentDir.y !== -newDir.y) {
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => 
            p.id === control.player ? { ...p, direction: newDir } : p
          )
        }));
      }
    }
  }, [gameState.players, gameStatus, togglePause, restartGame]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Start game loop when game is running
  useEffect(() => {
    if (gameState.isRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isRunning, gameLoop]);

  return {
    gameState,
    gameStatus,
    startGame,
    togglePause,
    restartGame
  };
}
