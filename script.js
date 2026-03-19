<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Tetris — Alina Edition ✨</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <!-- Header -->
        <header class="game-header">
            <h1 class="game-title">
                <span class="title-icon">🌸</span>
                Tetris
                <span class="title-icon">🌸</span>
            </h1>
        </header>

        <!-- Game Board -->
        <div class="game-wrapper">
            <div class="board-container">
                <canvas id="gameCanvas" class="game-canvas"></canvas>

                <!-- Touch Zones -->
                <div class="touch-controls">
                    <div class="touch-zone touch-left" data-action="left"></div>
                    <div class="touch-zone touch-rotate" data-action="rotate"></div>
                    <div class="touch-zone touch-right" data-action="right"></div>
                    <div class="touch-zone touch-down" data-action="down"></div>
                </div>
            </div>
        </div>

        <!-- Info Bar -->
        <div class="info-bar">
            <div class="info-item">
                <span class="info-label">Score</span>
                <span class="info-value" id="score">0</span>
            </div>
            <div class="info-item">
                <span class="info-label">Level</span>
                <span class="info-value" id="level">1</span>
            </div>
            <div class="info-item">
                <span class="info-label">Lines</span>
                <span class="info-value" id="lines">0</span>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls-bar">
            <button class="control-btn" id="pauseBtn" title="Pause">⏸</button>
            <button class="control-btn" id="soundBtn" title="Sound">🔊</button>
            <button class="control-btn control-btn-lg" id="mobileLeft">◀</button>
            <button class="control-btn control-btn-lg" id="mobileRotate">↻</button>
            <button class="control-btn control-btn-lg" id="mobileRight">▶</button>
            <button class="control-btn" id="mobileDrop">⬇</button>
            <button class="control-btn" id="restartBtn" title="Restart">♻</button>
        </div>

        <!-- Game Over Overlay -->
        <div class="overlay" id="gameOverOverlay">
            <div class="overlay-content">
                <div class="overlay-icon">💔</div>
                <h2 class="overlay-title">Game Over</h2>
                <div class="final-score">
                    <span class="final-label">Score</span>
                    <span class="final-value" id="finalScore">0</span>
                </div>
                <div class="final-stats">
                    <div class="stat">
                        <span class="stat-label">Level</span>
                        <span class="stat-value" id="finalLevel">1</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Lines</span>
                        <span class="stat-value" id="finalLines">0</span>
                    </div>
                </div>
                <button class="play-again-btn" id="playAgainBtn">
                    <span class="btn-text">Play Again</span>
                    <span class="btn-emoji">🌸</span>
                </button>
            </div>
        </div>

        <!-- Pause Overlay -->
        <div class="overlay" id="pauseOverlay">
            <div class="overlay-content">
                <div class="overlay-icon">⏸</div>
                <h2 class="overlay-title">Paused</h2>
                <button class="play-again-btn" id="resumeBtn">
                    <span class="btn-text">Resume</span>
                    <span class="btn-emoji">▶</span>
                </button>
            </div>
        </div>

        <!-- Start Screen -->
        <div class="overlay" id="startOverlay">
            <div class="overlay-content">
                <div class="overlay-icon">🎮</div>
                <h2 class="overlay-title">Tetris</h2>
                <p class="overlay-subtitle">Alina Edition ✨</p>
                <div class="controls-hint">
                    <p>📱 Tap zones or use buttons</p>
                    <p>⌨️ Arrow keys + Space</p>
                </div>
                <button class="play-again-btn" id="startBtn">
                    <span class="btn-text">Start Game</span>
                    <span class="btn-emoji">🌸</span>
                </button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
