import React, { useState, useEffect, useRef } from 'react';

const SnakeGame = ({ t }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef(null);
  const snakeRef = useRef([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]); // Initial length: 3
  const directionRef = useRef({ x: 1, y: 0 }); // Start moving right
  const foodRef = useRef({ x: 5, y: 5 });
  const gameOverRef = useRef(false); // Ref to track game over state
  const gridSize = 20;
  const gameSpeed = 100;

  // Update gameOverRef when gameOver state changes
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Generate initial food
    generateFood();

    // Handle keyboard input
    const handleKeyDown = (e) => {
      // Prevent default behavior for arrow keys and space to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      // Don't process controls if game is over - use ref to get current value
      if (gameOverRef.current && e.key !== 'r') {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) {
            directionRef.current = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          if (directionRef.current.y === 0) {
            directionRef.current = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current.x === 0) {
            directionRef.current = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          if (directionRef.current.x === 0) {
            directionRef.current = { x: 1, y: 0 };
          }
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
        case 'r':
          if (gameOver) {
            resetGame();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Start game loop
    startGameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  const startGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(() => {
      if (!isPaused && !gameOver) {
        updateGame();
        drawGame();
      }
    }, gameSpeed);
  };

  const generateFood = () => {
    const canvas = canvasRef.current;
    const snake = snakeRef.current;
    let newFood;
    let foodOnSnake;
    
    do {
      const x = Math.floor(Math.random() * (canvas.width / gridSize));
      const y = Math.floor(Math.random() * (canvas.height / gridSize));
      newFood = { x, y };
      
      // Check if food would spawn on snake
      foodOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (foodOnSnake);
    
    foodRef.current = newFood;
  };

  const updateGame = () => {
    const snake = snakeRef.current;
    const direction = directionRef.current;
    
    // Calculate new head position
    const head = { 
      x: snake[0].x + direction.x, 
      y: snake[0].y + direction.y 
    };

    // Check for wall collision
    const canvas = canvasRef.current;
    if (
      head.x < 0 || 
      head.x >= canvas.width / gridSize ||
      head.y < 0 || 
      head.y >= canvas.height / gridSize
    ) {
      setGameOver(true);
      return;
    }

    // Check for self collision (skip the head itself)
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        setGameOver(true);
        return;
      }
    }

    // Check for food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      // Add new segment without removing tail
      snake.unshift(head);
      setScore(prev => prev + 1);
      generateFood();
    } else {
      // Move snake
      snake.unshift(head);
      snake.pop();
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const snake = snakeRef.current;
    const food = foodRef.current;

    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * gridSize, 
      food.y * gridSize, 
      gridSize, 
      gridSize
    );

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : '#059669';
      ctx.fillRect(
        segment.x * gridSize, 
        segment.y * gridSize, 
        gridSize, 
        gridSize
      );
      
      // Draw border around snake segments
      ctx.strokeStyle = '#047857';
      ctx.strokeRect(
        segment.x * gridSize, 
        segment.y * gridSize, 
        gridSize, 
        gridSize
      );
    });

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; // Reset to 3 segments
    directionRef.current = { x: 1, y: 0 }; // Start moving right
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    generateFood();
    drawGame();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t.snakeGameTitle}</h3>
        <div className="text-sm font-medium text-gray-600">
          {t.snakeGameScore} <span className="text-blue-600">{score}</span>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-md mx-auto block"
          style={{ cursor: 'pointer' }}
          onClick={() => canvasRef.current?.focus()}
          tabIndex="0"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
            <div className="bg-white p-4 rounded-md text-center">
              <p className="text-lg font-semibold text-red-600 mb-2">{t.snakeGameOver}</p>
              <p className="text-gray-700 mb-4">{t.snakeFinalScore} {score}</p>
              <button
                onClick={resetGame}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {t.snakeRestart}
              </button>
            </div>
          </div>
        )}
        
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
            <div className="bg-white p-4 rounded-md text-center">
              <p className="text-lg font-semibold text-yellow-600">{t.snakePaused}</p>
              <p className="text-sm text-gray-600">{t.snakeContinue}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">{t.snakeInstructionsTitle}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t.snakeInstruction1}</li>
          <li>{t.snakeInstruction2}</li>
          <li>{t.snakeInstruction3}</li>
          <li>{t.snakeInstruction4}</li>
        </ul>
      </div>
      
      {!gameOver && !isPaused && (
        <div className="mt-4 text-xs text-blue-600 text-center">
          {t.snakeProcessing}
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
