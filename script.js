/**
 * ============================================
 * TETRIS — Alina Edition ✨
 * Complete Game Logic
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // GAME CONSTANTS
    // ============================================
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const NEXT_BLOCK_SIZE = 25;
    const NEXT_PREVIEW_SIZE = 5;

    // Tetromino definitions (shapes and colors)
    const TETROMINOES = {
        I: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: '#b8e6ff'
        },
        O: {
            shape: [
                [1, 1],
                [1, 1]
            ],
            color: '#fff5b8'
        },
        T: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#e8b8ff'
        },
        S: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: '#b8ffb8'
        },
        Z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: '#ffb8b8'
        },
        J: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#b8c8ff'
        },
        L: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#ffe0b8'
        }
    };

    const TETROMINO_KEYS = Object.keys(TETROMINOES);

    // Scoring system
    const SCORE_TABLE = {
        1: 100,
        2: 300,
        3: 500,
        4: 800
    };

    // Level speed (ms per drop)
    const LEVEL_SPEEDS = [
        800, 750, 700, 650, 600,  // Levels 1-5
        550, 500, 450, 400, 350,  // Levels 6-10
        300, 250, 200, 150, 100   // Levels 11-15
    ];

    // ============================================
    // GAME STATE
    // ============================================
    let gameState = {
        board: [],
        currentPiece: null,
        nextPiece: null,
        score: 0,
        level: 1,
        lines: 0,
        highScore: 0,
        isPlaying: false,
        isPaused: false,
        isGameOver: false,
        dropInterval: 800,
        lastDropTime: 0,
        bag: []
    };

    // ============================================
    // CANVAS & CONTEXT
    // ============================================
    let canvas, ctx;
    let nextCanvas, nextCtx;

    // ============================================
    // AUDIO SYSTEM
    // ============================================
    let audioContext = null;
    let soundEnabled = true;

    function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            soundEnabled = false;
        }
    }

    function playSound(type) {
        if (!soundEnabled || !audioContext) return;
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'move':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'rotate':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.08);
                break;
            case 'drop':
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'clear':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                
                // Add second tone for harmony
                setTimeout(() => {
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioContext.destination);
                    osc2.frequency.setValueAtTime(600, audioContext.currentTime);
                    osc2.type = 'sine';
                    gain2.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    osc2.start(audioContext.currentTime);
                    osc2.stop(audioContext.currentTime + 0.15);
                }, 50);
                break;
            case 'gameover':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================
    function loadHighScore() {
        const saved = localStorage.getItem('tetrisAlinaHighScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    function saveHighScore(score) {
        localStorage.setItem('tetrisAlinaHighScore', score.toString());
    }

    // ============================================
    // 7-BAG RANDOMIZER
    // ============================================
    function refillBag() {
        const newBag = [...TETROMINO_KEYS];
        // Fisher-Yates shuffle
        for (let i = newBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
        }
        return newBag;
    }

    function getNextPieceType() {
        if (gameState.bag.length === 0) {
            gameState.bag = refillBag();
        }
        return gameState.bag.pop();
    }

    // ============================================
    // PIECE FACTORY
    // ============================================
    function createPiece(type) {
        const tetromino = TETROMINOES[type];
        return {
            type: type,
            shape: tetromino.shape.map(row => [...row]),
            color: tetromino.color,
            x: Math.floor(COLS / 2) - Math.ceil(tetromino.shape[0].length / 2),
            y: 0
        };
    }

    // ============================================
    // BOARD MANAGEMENT
    // ============================================
    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    function isValidMove(piece, offsetX = 0, offsetY = 0, newShape = null) {
        const shape = newShape || piece.shape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;

                    // Check boundaries
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return false;
                    }

                    // Check collision with locked pieces
                    if (newY >= 0 && gameState.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function lockPiece() {
        const piece = gameState.currentPiece;
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const boardY = piece.y + row;
                    const boardX = piece.x + col;
                    if (boardY >= 0) {
                        gameState.board[boardY][boardX] = piece.color;
                    }
                }
            }
        }
    }

    function clearLines() {
        let linesCleared = 0;
        const linesToClear = [];

        // Find full lines
        for (let row = ROWS - 1; row >= 0; row--) {
            if (gameState.board[row].every(cell => cell !== null)) {
                linesToClear.push(row);
                linesCleared++;
            }
        }

        // Clear lines and move down
        if (linesCleared > 0) {
            linesToClear.forEach(row => {
                gameState.board.splice(row, 1);
                gameState.board.unshift(Array(COLS).fill(null));
            });

            // Update score
            const baseScore = SCORE_TABLE[linesCleared] || 0;
            gameState.score += baseScore * gameState.level;
            gameState.lines += linesCleared;

            // Level up every 10 lines
            const newLevel = Math.floor(gameState.lines / 10) + 1;
            if (newLevel > gameState.level && newLevel <= LEVEL_SPEEDS.length) {
                gameState.level = newLevel;
                gameState.dropInterval = LEVEL_SPEEDS[newLevel - 1];
            }

            playSound('clear');
            updateUI();
        }

        return linesCleared;
    }

    // ============================================
    // ROTATION (with wall kick)
    // ============================================
    function rotatePiece() {
        const piece = gameState.currentPiece;
        const shape = piece.shape;
        const N = shape.length;

        // Create rotated shape (90 degrees clockwise)
        const rotated = shape[0].map((_, i) =>
            shape.map(row => row[i]).reverse()
        );

        // Try normal rotation
        if (isValidMove(piece, 0, 0, rotated)) {
            piece.shape = rotated;
            playSound('rotate');
            return true;
        }

        // Wall kick attempts
        const kicks = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: -2, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
            { x: 1, y: -1 }
        ];

        for (const kick of kicks) {
            if (isValidMove(piece, kick.x, kick.y, rotated)) {
                piece.x += kick.x;
                piece.y += kick.y;
                piece.shape = rotated;
                playSound('rotate');
                return true;
            }
        }

        return false;
    }

    // ============================================
    // PIECE MOVEMENT
    // ============================================
    function movePiece(dir) {
        if (!gameState.isPlaying || gameState.isPaused) return false;

        if (isValidMove(gameState.currentPiece, dir, 0)) {
            gameState.currentPiece.x += dir;
            playSound('move');
            return true;
        }
        return false;
    }

    function dropPiece() {
        if (!gameState.isPlaying || gameState.isPaused) return false;

        if (isValidMove(gameState.currentPiece, 0, 1)) {
            gameState.currentPiece.y++;
            return true;
        }
        return false;
    }

    function hardDrop() {
        if (!gameState.isPlaying || gameState.isPaused) return;

        let dropDistance = 0;
        while (isValidMove(gameState.currentPiece, 0, dropDistance + 1)) {
            dropDistance++;
        }

        gameState.currentPiece.y += dropDistance;
        playSound('drop');
        lockPiece();
        
        if (clearLines() === 0) {
            playSound('drop');
        }
        
        spawnPiece();
    }

    // ============================================
    // SPAWN NEW PIECE
    // ============================================
    function spawnPiece() {
        if (!gameState.nextPiece) {
            gameState.nextPiece = createPiece(getNextPieceType());
        }

        gameState.currentPiece = gameState.nextPiece;
        gameState.nextPiece = createPiece(getNextPieceType());

        // Check if spawn position is valid
        if (!isValidMove(gameState.currentPiece, 0, 0)) {
            gameOver();
        }

        drawNextPiece();
    }

    // ============================================
    // GAME OVER
    // ============================================
    function gameOver() {
        gameState.isPlaying = false;
        gameState.isGameOver = true;
        playSound('gameover');

        // Update high score
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            saveHighScore(gameState.highScore);
        }

        // Show game over overlay
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('finalLevel').textContent = gameState.level;
        document.getElementById('finalLines').textContent = gameState.lines;
        document.getElementById('gameOverOverlay').classList.add('active');

        updateUI();
    }

    // ============================================
    // RENDERING
    // ============================================
    function drawBlock(context, x, y, size, color, isGhost = false) {
        const padding = 1;
        const innerSize = size - padding * 2;

        if (isGhost) {
            context.fillStyle = color + '40'; // 25% opacity
            context.fillRect(x * size + padding, y * size + padding, innerSize, innerSize);
            context.strokeStyle = color + '80';
            context.lineWidth = 1;
            context.strokeRect(x * size + padding, y * size + padding, innerSize, innerSize);
        } else {
            // Main block
            const gradient = context.createLinearGradient(
                x * size, y * size,
                x * size + size, y * size + size
            );
            gradient.addColorStop(0, lightenColor(color, 20));
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, darkenColor(color, 15));

            context.fillStyle = gradient;
            context.beginPath();
            context.roundRect(x * size + padding, y * size + padding, innerSize, innerSize, 4);
            context.fill();

            // Highlight
            context.fillStyle = 'rgba(255, 255, 255, 0.4)';
            context.beginPath();
            context.roundRect(x * size + padding + 2, y * size + padding + 2, innerSize / 2 - 1, innerSize / 3, 2);
            context.fill();

            // Shadow
            context.fillStyle = 'rgba(0, 0, 0, 0.1)';
            context.beginPath();
            context.roundRect(x * size + padding + 2, y * size + size - padding - 4, innerSize - 4, 3, 1);
            context.fill();
        }
    }

    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }

        // Draw locked pieces
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (gameState.board[row][col]) {
                    drawBlock(ctx, col, row, BLOCK_SIZE, gameState.board[row][col]);
                }
            }
        }

        // Draw ghost piece
        if (gameState.currentPiece) {
            let ghostY = gameState.currentPiece.y;
            while (isValidMove(gameState.currentPiece, 0, ghostY - gameState.currentPiece.y + 1)) {
                ghostY++;
            }

            const piece = gameState.currentPiece;
            for (let row = 0; row < piece.shape.length; row++) {
                for (let col = 0; col < piece.shape[row].length; col++) {
                    if (piece.shape[row][col] && piece.y + row >= 0) {
                        drawBlock(ctx, piece.x + col, ghostY + row, BLOCK_SIZE, piece.color, true);
                    }
                }
            }

            // Draw current piece
            for (let row = 0; row < piece.shape.length; row++) {
                for (let col = 0; col < piece.shape[row].length; col++) {
                    if (piece.shape[row][col] && piece.y + row >= 0) {
                        drawBlock(ctx, piece.x + col, piece.y + row, BLOCK_SIZE, piece.color);
                    }
                }
            }
        }
    }

    function drawNextPiece() {
        if (!nextCtx || !gameState.nextPiece) return;

        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

        const piece = gameState.nextPiece;
        const shape = piece.shape;
        const previewSize = NEXT_PREVIEW_SIZE;

        // Center the piece in preview
        const offsetX = Math.floor((previewSize - shape[0].length) / 2);
        const offsetY = Math.floor((previewSize - shape.length) / 2);

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    drawBlock(nextCtx, offsetX + col, offsetY + row, NEXT_BLOCK_SIZE, piece.color);
                }
            }
        }
    }

    // Color utilities
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // ============================================
    // UI UPDATES
    // ============================================
    function updateUI() {
        document.getElementById('score').textContent = gameState.score.toLocaleString();
        document.getElementById('level').textContent = gameState.level;
        document.getElementById('lines').textContent = gameState.lines;
        document.getElementById('highScore').textContent = gameState.highScore.toLocaleString();
    }

    // ============================================
    // GAME LOOP
    // ============================================
    let animationId = null;

    function gameLoop(timestamp) {
        if (!gameState.isPlaying || gameState.isPaused) {
            animationId = requestAnimationFrame(gameLoop);
            return;
        }

        if (!gameState.lastDropTime) gameState.lastDropTime = timestamp;

        const deltaTime = timestamp - gameState.lastDropTime;

        if (deltaTime >= gameState.dropInterval) {
            if (!dropPiece()) {
                lockPiece();
                if (clearLines() === 0) {
                    playSound('drop');
                }
                spawnPiece();
            }
            gameState.lastDropTime = timestamp;
        }

        drawBoard();
        animationId = requestAnimationFrame(gameLoop);
    }

    // ============================================
    // GAME CONTROL
    // ============================================
    function startGame() {
        // Reset game state
        gameState.board = createBoard();
        gameState.score = 0;
        gameState.level = 1;
        gameState.lines = 0;
        gameState.dropInterval = LEVEL_SPEEDS[0];
        gameState.bag = [];
        gameState.nextPiece = null;
        gameState.isPlaying = true;
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.lastDropTime = 0;

        // Hide overlays
        document.getElementById('startOverlay').classList.remove('active');
        document.getElementById('gameOverOverlay').classList.remove('active');
        document.getElementById('pauseOverlay').classList.remove('active');

        // Initialize audio on first interaction
        initAudio();

        // Spawn first piece
        spawnPiece();

        // Update UI
        updateUI();

        // Start game loop
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animationId = requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        if (!gameState.isPlaying || gameState.isGameOver) return;

        gameState.isPaused = !gameState.isPaused;
        
        const pauseOverlay = document.getElementById('pauseOverlay');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (gameState.isPaused) {
            pauseOverlay.classList.add('active');
            pauseBtn.querySelector('.btn-icon').textContent = '▶️';
        } else {
            pauseOverlay.classList.remove('active');
            pauseBtn.querySelector('.btn-icon').textContent = '⏸️';
            gameState.lastDropTime = 0;
        }
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        soundBtn.querySelector('.btn-icon').textContent = soundEnabled ? '🔊' : '🔇';
    }

    // ============================================
    // INPUT HANDLING
    // ============================================
    function handleKeydown(e) {
        if (!gameState.isPlaying) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                movePiece(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                movePiece(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (dropPiece()) {
                    gameState.score += 1;
                    updateUI();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                rotatePiece();
                break;
            case ' ':
                e.preventDefault();
                hardDrop();
                break;
            case 'p':
            case 'P':
            case 'Escape':
                e.preventDefault();
                pauseGame();
                break;
        }
    }

    // Touch controls
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let longPressTimer = null;
    const LONG_PRESS_DURATION = 400;
    const SWIPE_THRESHOLD = 30;

    function handleTouchStart(e) {
        if (!gameState.isPlaying || gameState.isPaused) return;
        
        const touch = e.touches[0];
        touchStartTime = Date.now();
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        // Start long press timer for hard drop
        longPressTimer = setTimeout(() => {
            hardDrop();
            touchStartTime = 0; // Prevent further action
        }, LONG_PRESS_DURATION);
    }

    function handleTouchMove(e) {
        if (!gameState.isPlaying || gameState.isPaused || !touchStartTime) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Detect swipe down for soft drop
        if (deltaY > SWIPE_THRESHOLD && Math.abs(deltaX) < SWIPE_THRESHOLD) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (dropPiece()) {
                gameState.score += 1;
                updateUI();
            }
            touchStartTime = 0;
        }
    }

    function handleTouchEnd(e) {
        if (!gameState.isPlaying || gameState.isPaused) return;

        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }

        // If touch was short, check for tap zones
        if (touchStartTime && Date.now() - touchStartTime < LONG_PRESS_DURATION) {
            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            const zoneWidth = rect.width / 4;
            const zoneHeight = rect.height / 3;

            // Determine which zone was tapped
            if (touchY < zoneHeight && touchX >= zoneWidth && touchX <= zoneWidth * 2) {
                // Top center - rotate
                rotatePiece();
            } else if (touchY > zoneHeight * 2 && touchX >= zoneWidth && touchX <= zoneWidth * 2) {
                // Bottom center - soft drop
                if (dropPiece()) {
                    gameState.score += 1;
                    updateUI();
                }
            } else if (touchX < zoneWidth) {
                // Left side - move left
                movePiece(-1);
            } else if (touchX > zoneWidth * 3) {
                // Right side - move right
                movePiece(1);
            } else if (touchX >= zoneWidth && touchX <= zoneWidth * 2) {
                // Center - rotate
                rotatePiece();
            }
        }

        touchStartTime = 0;
    }

    // Mobile button handlers
    function setupMobileButtons() {
        // Left button
        document.getElementById('mobileLeft').addEventListener('click', (e) => {
            e.preventDefault();
            movePiece(-1);
        });

        // Right button
        document.getElementById('mobileRight').addEventListener('click', (e) => {
            e.preventDefault();
            movePiece(1);
        });

        // Rotate button
        document.getElementById('mobileRotate').addEventListener('click', (e) => {
            e.preventDefault();
            rotatePiece();
        });

        // Down button
        document.getElementById('mobileDrop').addEventListener('click', (e) => {
            e.preventDefault();
            if (dropPiece()) {
                gameState.score += 1;
                updateUI();
            }
        });

        // Hard drop button
        document.getElementById('mobileHardDrop').addEventListener('click', (e) => {
            e.preventDefault();
            hardDrop();
        });

        // Touch zones on canvas
        canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Control panel buttons
    function setupControlButtons() {
        document.getElementById('pauseBtn').addEventListener('click', pauseGame);
        document.getElementById('soundBtn').addEventListener('click', toggleSound);
        document.getElementById('restartBtn').addEventListener('click', startGame);
        document.getElementById('playAgainBtn').addEventListener('click', startGame);
        document.getElementById('resumeBtn').addEventListener('click', pauseGame);
        document.getElementById('startBtn').addEventListener('click', startGame);
    }

    // ============================================
    // CANVAS RESIZING
    // ============================================
    function resizeCanvas() {
        const container = document.querySelector('.board-container');
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight * 0.55;

        let canvasWidth = COLS * BLOCK_SIZE;
        let canvasHeight = ROWS * BLOCK_SIZE;

        // Scale to fit
        const scale = Math.min(
            maxWidth / canvasWidth,
            maxHeight / canvasHeight
        );

        canvas.width = canvasWidth * scale;
        canvas.height = canvasHeight * scale;
        canvas.style.width = canvasWidth * scale + 'px';
        canvas.style.height = canvasHeight * scale + 'px';

        // Scale context
        ctx.scale(scale, scale);

        // Next piece canvas
        nextCanvas.width = NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE;
        nextCanvas.height = NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE;

        // Redraw
        drawBoard();
        drawNextPiece();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Get canvas elements
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        nextCanvas = document.getElementById('nextCanvas');
        nextCtx = nextCanvas.getContext('2d');

        // Load high score
        gameState.highScore = loadHighScore();
        updateUI();

        // Setup controls
        setupMobileButtons();
        setupControlButtons();

        // Keyboard controls
        document.addEventListener('keydown', handleKeydown);

        // Resize handling
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Initial draw
        drawBoard();
        drawNextPiece();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
