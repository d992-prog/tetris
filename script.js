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
    const NEXT_PREVIEW_SIZE = 5;
    
    // Dynamic block size
    let BLOCK_SIZE = 30;
    let NEXT_BLOCK_SIZE = 20;

    // Tetromino definitions with vibrant colors
    const TETROMINOES = {
        I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00e5ff' },
        O: { shape: [[1,1],[1,1]], color: '#ffd600' },
        T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#d500f9' },
        S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#00e676' },
        Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#ff1744' },
        J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#2979ff' },
        L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#ff9100' }
    };

    const TETROMINO_KEYS = Object.keys(TETROMINOES);

    // Scoring
    const SCORE_TABLE = { 1: 100, 2: 300, 3: 500, 4: 800 };

    // Level speeds
    const LEVEL_SPEEDS = [800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100];

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
        isRunning: false,
        isPaused: false,
        isGameOver: false,
        dropInterval: 800,
        lastDropTime: 0,
        bag: []
    };
    
    // Game loop
    let animationId = null;
    let uiUpdateCounter = 0;

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
    let audioInitialized = false;

    function initAudio() {
        if (audioInitialized) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
        } catch (e) {
            soundEnabled = false;
        }
    }

    // Unlock audio on first user interaction
    function unlockAudio() {
        if (!audioInitialized) {
            initAudio();
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }
        document.body.removeEventListener('touchstart', unlockAudio);
        document.body.removeEventListener('click', unlockAudio);
    }

    // Setup audio unlock on first interaction
    document.body.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    document.body.addEventListener('click', unlockAudio, { once: true });

    function playSound(type) {
        if (!soundEnabled || !audioContext) return;
        
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'move':
                oscillator.frequency.setValueAtTime(220, now);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;
            case 'rotate':
                oscillator.frequency.setValueAtTime(330, now);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;
            case 'drop':
                oscillator.frequency.setValueAtTime(165, now);
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.12, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'clear':
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                
                // Second tone for harmony
                setTimeout(() => {
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioContext.destination);
                    osc2.frequency.setValueAtTime(554, audioContext.currentTime);
                    osc2.type = 'sine';
                    gain2.gain.setValueAtTime(0.12, audioContext.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
                    osc2.start(audioContext.currentTime);
                    osc2.stop(audioContext.currentTime + 0.12);
                }, 40);
                break;
            case 'gameover':
                oscillator.frequency.setValueAtTime(220, now);
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
        }
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================
    function loadHighScore() {
        try {
            const saved = localStorage.getItem('tetrisAlinaHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    function saveHighScore(score) {
        try {
            localStorage.setItem('tetrisAlinaHighScore', score.toString());
        } catch (e) {}
    }

    // ============================================
    // 7-BAG RANDOMIZER
    // ============================================
    function refillBag() {
        const newBag = [...TETROMINO_KEYS];
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

                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return false;
                    }

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
                    if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                        gameState.board[boardY][boardX] = piece.color;
                    }
                }
            }
        }
    }

    function clearLines() {
        let linesCleared = 0;
        const linesToClear = [];

        for (let row = ROWS - 1; row >= 0; row--) {
            if (gameState.board[row].every(cell => cell !== null)) {
                linesToClear.push(row);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            linesToClear.sort((a, b) => a - b);
            for (let i = linesToClear.length - 1; i >= 0; i--) {
                gameState.board.splice(linesToClear[i], 1);
            }
            for (let i = 0; i < linesCleared; i++) {
                gameState.board.unshift(Array(COLS).fill(null));
            }

            const baseScore = SCORE_TABLE[linesCleared] || 0;
            gameState.score += baseScore * gameState.level;
            gameState.lines += linesCleared;

            const newLevel = Math.floor(gameState.lines / 10) + 1;
            if (newLevel > gameState.level && newLevel <= LEVEL_SPEEDS.length) {
                gameState.level = newLevel;
                gameState.dropInterval = LEVEL_SPEEDS[newLevel - 1];
            }

            playSound('clear');
            updateUI();
        } else {
            uiUpdateCounter = 9;
        }

        return linesCleared;
    }

    // ============================================
    // ROTATION (with wall kick)
    // ============================================
    function rotatePiece() {
        if (!gameState.currentPiece || !gameState.isRunning || gameState.isPaused) return false;

        const piece = gameState.currentPiece;
        const shape = piece.shape;
        const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());

        if (isValidMove(piece, 0, 0, rotated)) {
            piece.shape = rotated;
            playSound('rotate');
            drawBoard();
            return true;
        }

        const kicks = [
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -2, y: 0 }, { x: 2, y: 0 },
            { x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }
        ];

        for (const kick of kicks) {
            if (isValidMove(piece, kick.x, kick.y, rotated)) {
                piece.x += kick.x;
                piece.y += kick.y;
                piece.shape = rotated;
                playSound('rotate');
                drawBoard();
                return true;
            }
        }

        return false;
    }

    // ============================================
    // PIECE MOVEMENT
    // ============================================
    function movePiece(dir) {
        if (!gameState.isRunning || gameState.isPaused || !gameState.currentPiece) return false;

        if (isValidMove(gameState.currentPiece, dir, 0)) {
            gameState.currentPiece.x += dir;
            playSound('move');
            drawBoard();
            return true;
        }
        return false;
    }

    function dropPiece() {
        if (!gameState.isRunning || gameState.isPaused || !gameState.currentPiece) return false;

        if (isValidMove(gameState.currentPiece, 0, 1)) {
            gameState.currentPiece.y++;
            gameState.score += 1;
            drawBoard();
            return true;
        }
        return false;
    }

    function hardDrop() {
        if (!gameState.isRunning || gameState.isPaused || !gameState.currentPiece) return;

        let dropDistance = 0;
        while (isValidMove(gameState.currentPiece, 0, dropDistance + 1)) {
            dropDistance++;
        }

        gameState.currentPiece.y += dropDistance;
        playSound('drop');
        drawBoard();
        lockPiece();

        if (clearLines() === 0) {
            playSound('drop');
        }
        
        updateUI();
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

        if (!isValidMove(gameState.currentPiece, 0, 0)) {
            gameOver();
            return;
        }

        if (gameState.isRunning) {
            drawNextPiece();
            drawBoard();
        }
    }

    // ============================================
    // GAME OVER
    // ============================================
    function gameOver() {
        gameState.isRunning = false;
        gameState.isGameOver = true;
        playSound('gameover');

        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            saveHighScore(gameState.highScore);
        }

        document.getElementById('finalScore').textContent = gameState.score.toLocaleString();
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
            context.fillStyle = color + '40';
            context.fillRect(x * size + padding, y * size + padding, innerSize, innerSize);
            context.strokeStyle = color + '80';
            context.lineWidth = 1;
            context.strokeRect(x * size + padding, y * size + padding, innerSize, innerSize);
        } else {
            // Main block with gradient
            const gradient = context.createLinearGradient(x * size, y * size, x * size + size, y * size + size);
            gradient.addColorStop(0, lightenColor(color, 15));
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, darkenColor(color, 10));

            context.fillStyle = gradient;
            context.beginPath();
            if (context.roundRect) {
                context.roundRect(x * size + padding, y * size + padding, innerSize, innerSize, 3);
            } else {
                context.rect(x * size + padding, y * size + padding, innerSize, innerSize);
            }
            context.fill();

            // Highlight
            context.fillStyle = 'rgba(255, 255, 255, 0.35)';
            context.beginPath();
            if (context.roundRect) {
                context.roundRect(x * size + padding + 2, y * size + padding + 2, innerSize / 2 - 1, innerSize / 3, 2);
            } else {
                context.rect(x * size + padding + 2, y * size + padding + 2, innerSize / 2 - 1, innerSize / 3);
            }
            context.fill();

            // Border/shadow
            context.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            context.lineWidth = 1;
            context.strokeRect(x * size + padding, y * size + padding, innerSize, innerSize);
        }
    }

    function drawBoard() {
        if (!ctx) return;

        ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

        // Grid background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }

        // Locked pieces
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (gameState.board[row][col]) {
                    drawBlock(ctx, col, row, BLOCK_SIZE, gameState.board[row][col]);
                }
            }
        }

        // Ghost piece
        if (gameState.currentPiece) {
            const piece = gameState.currentPiece;
            let ghostY = piece.y;
            while (isValidMove(piece, 0, ghostY - piece.y + 1)) {
                ghostY++;
            }

            for (let row = 0; row < piece.shape.length; row++) {
                for (let col = 0; col < piece.shape[row].length; col++) {
                    if (piece.shape[row][col] && piece.y + row >= 0) {
                        drawBlock(ctx, piece.x + col, ghostY + row, BLOCK_SIZE, piece.color, true);
                    }
                }
            }

            // Current piece
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

        nextCtx.clearRect(0, 0, NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE, NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE);

        const piece = gameState.nextPiece;
        const shape = piece.shape;
        const offsetX = Math.floor((NEXT_PREVIEW_SIZE - shape[0].length) / 2);
        const offsetY = Math.floor((NEXT_PREVIEW_SIZE - shape.length) / 2);

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    drawBlock(nextCtx, offsetX + col, offsetY + row, NEXT_BLOCK_SIZE, piece.color);
                }
            }
        }
    }

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
        const scoreEl = document.getElementById('score');
        const levelEl = document.getElementById('level');
        const linesEl = document.getElementById('lines');

        if (scoreEl) scoreEl.textContent = gameState.score.toLocaleString();
        if (levelEl) levelEl.textContent = gameState.level;
        if (linesEl) linesEl.textContent = gameState.lines;
    }

    // ============================================
    // GAME LOOP
    // ============================================
    function gameLoop(timestamp) {
        if (!gameState.isRunning) {
            animationId = requestAnimationFrame(gameLoop);
            return;
        }

        if (gameState.isPaused) {
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
        
        // Update UI less frequently for performance
        uiUpdateCounter++;
        if (uiUpdateCounter >= 10) {
            updateUI();
            uiUpdateCounter = 0;
        }
        
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
        gameState.isRunning = true;
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.lastDropTime = 0;
        uiUpdateCounter = 0;

        // Hide overlays
        const startOverlay = document.getElementById('startOverlay');
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        const pauseOverlay = document.getElementById('pauseOverlay');

        if (startOverlay) startOverlay.classList.remove('active');
        if (gameOverOverlay) gameOverOverlay.classList.remove('active');
        if (pauseOverlay) pauseOverlay.classList.remove('active');

        initAudio();
        spawnPiece();
        updateUI();

        // Start game loop
        if (animationId) cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        if (!gameState.isRunning || gameState.isGameOver) return;

        gameState.isPaused = !gameState.isPaused;
        
        const pauseOverlay = document.getElementById('pauseOverlay');
        
        if (gameState.isPaused) {
            if (pauseOverlay) pauseOverlay.classList.add('active');
        } else {
            if (pauseOverlay) pauseOverlay.classList.remove('active');
            gameState.lastDropTime = 0;
            updateUI();
        }
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        }
    }

    // ============================================
    // INPUT HANDLING
    // ============================================
    function handleKeydown(e) {
        if (!gameState.isRunning || gameState.isPaused) {
            if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && gameState.isRunning && !gameState.isGameOver) {
                e.preventDefault();
                pauseGame();
            }
            return;
        }

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
                dropPiece();
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

    function handleTouchZone(action) {
        if (!gameState.isRunning || gameState.isPaused) return;

        switch (action) {
            case 'left': movePiece(-1); break;
            case 'right': movePiece(1); break;
            case 'rotate': rotatePiece(); break;
            case 'down': dropPiece(); break;
        }
    }

    // Mobile button handlers
    function setupMobileButtons() {
        const buttons = {
            'mobileLeft': () => movePiece(-1),
            'mobileRight': () => movePiece(1),
            'mobileRotate': () => rotatePiece(),
            'mobileDrop': () => dropPiece()
        };

        Object.keys(buttons).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    buttons[id]();
                }, { passive: false });
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    buttons[id]();
                });
            }
        });

        // Touch zones
        document.querySelectorAll('.touch-zone').forEach(zone => {
            const action = zone.getAttribute('data-action');
            const handler = (e) => {
                e.preventDefault();
                handleTouchZone(action);
            };
            zone.addEventListener('touchstart', handler, { passive: false });
            zone.addEventListener('click', handler);
        });
    }

    // Control panel buttons
    function setupControlButtons() {
        const pauseBtn = document.getElementById('pauseBtn');
        const soundBtn = document.getElementById('soundBtn');
        const restartBtn = document.getElementById('restartBtn');
        const startBtn = document.getElementById('startBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const playAgainBtn = document.getElementById('playAgainBtn');

        if (pauseBtn) pauseBtn.addEventListener('click', (e) => { e.preventDefault(); pauseGame(); });
        if (soundBtn) soundBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSound(); });
        if (restartBtn) restartBtn.addEventListener('click', (e) => { e.preventDefault(); startGame(); });
        if (startBtn) startBtn.addEventListener('click', (e) => { e.preventDefault(); startGame(); });
        if (resumeBtn) resumeBtn.addEventListener('click', (e) => { e.preventDefault(); pauseGame(); });
        if (playAgainBtn) playAgainBtn.addEventListener('click', (e) => { e.preventDefault(); startGame(); });
    }

    // ============================================
    // CANVAS RESIZING (FIXED - REAL HEIGHT CALCULATION)
    // ============================================
    function getRealHeight() {
        return window.visualViewport ? window.visualViewport.height : window.innerHeight;
    }

    function resizeCanvas() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Get UI elements
        const header = document.querySelector('.game-header');
        const info = document.querySelector('.info-bar');
        const controls = document.querySelector('.controls-bar');

        // Get real viewport height (Safari fix)
        const totalHeight = getRealHeight();

        // Calculate used height
        const usedHeight = (header ? header.offsetHeight : 0) +
                          (info ? info.offsetHeight : 0) +
                          (controls ? controls.offsetHeight : 0);

        // Available height for canvas (with 6px margin)
        const availableHeight = totalHeight - usedHeight - 6;

        // Available width
        const availableWidth = window.innerWidth - 10;

        // Calculate block size using BOTH constraints
        const blockSizeByHeight = Math.floor(availableHeight / ROWS);
        const blockSizeByWidth = Math.floor(availableWidth / COLS);

        // Use the smaller one to ensure fit
        const blockSize = Math.min(blockSizeByHeight, blockSizeByWidth);
        BLOCK_SIZE = Math.max(10, blockSize);
        NEXT_BLOCK_SIZE = Math.max(12, Math.floor(BLOCK_SIZE * 0.6));

        // Handle device pixel ratio
        const dpr = window.devicePixelRatio || 1;

        // Set internal resolution
        canvas.width = COLS * BLOCK_SIZE * dpr;
        canvas.height = ROWS * BLOCK_SIZE * dpr;

        // Scale context for DPR
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // CSS display size
        canvas.style.width = (COLS * BLOCK_SIZE) + 'px';
        canvas.style.height = (ROWS * BLOCK_SIZE) + 'px';

        // Next piece canvas
        nextCanvas.width = NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE * dpr;
        nextCanvas.height = NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE * dpr;
        nextCanvas.style.width = (NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE) + 'px';
        nextCanvas.style.height = (NEXT_PREVIEW_SIZE * NEXT_BLOCK_SIZE) + 'px';

        // Redraw
        drawBoard();
        drawNextPiece();
        updateUI();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas ? canvas.getContext('2d') : null;
        nextCanvas = document.getElementById('nextCanvas');
        nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;

        if (!canvas || !ctx || !nextCanvas || !nextCtx) {
            console.error('Canvas elements not found');
            return;
        }

        gameState.highScore = loadHighScore();
        uiUpdateCounter = 0;
        updateUI();

        setupMobileButtons();
        setupControlButtons();

        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('load', resizeCanvas);

        // Initial canvas setup
        resizeCanvas();

        // Initial draw
        drawBoard();
        drawNextPiece();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
