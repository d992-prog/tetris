/* ============================================
   TETRIS — Alina Edition ✨
   CSS Grid Layout - Mobile First
   ============================================ */

*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --gradient-start: #ffd6e7;
    --gradient-mid: #e8d5f5;
    --gradient-end: #d4e9ff;
    
    --primary-pink: #ffb6c1;
    --primary-lavender: #d8bfd8;
    --primary-blue: #b8d4e8;
    
    --text-dark: #4a4a6a;
    --text-light: #7a7a9a;
    --white: #ffffff;
    --shadow: rgba(150, 100, 180, 0.2);
    --shadow-strong: rgba(150, 100, 180, 0.35);
    
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-full: 50%;
}

html, body {
    height: 100%;
    overflow: hidden;
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-mid) 50%, var(--gradient-end) 100%);
    -webkit-font-smoothing: antialiased;
    touch-action: none;
    overscroll-behavior: none;
}

/* Game Container - CSS Grid Layout */
.game-container {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-rows: 24px 1fr 40px 50px;
    padding: 2px;
    max-width: 500px;
    margin: 0 auto;
}

/* Header */
.game-header {
    grid-row: 1;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.game-title {
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-dark);
    text-shadow: 1px 1px 2px var(--shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.title-icon {
    font-size: 0.7rem;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}

/* Game Wrapper */
.game-wrapper {
    grid-row: 2;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
}

/* Board Container */
.board-container {
    position: relative;
    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%);
    border-radius: var(--radius-lg);
    padding: 2px;
    box-shadow: 0 4px 20px var(--shadow);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.game-canvas {
    display: block;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.3);
    box-shadow: inset 0 2px 10px var(--shadow);
}

/* Touch Controls */
.touch-controls {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    pointer-events: none;
}

.touch-zone {
    pointer-events: auto;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    display: block;
}

.touch-left {
    position: absolute;
    left: 0;
    top: 20%;
    width: 25%;
    height: 60%;
}

.touch-right {
    position: absolute;
    right: 0;
    top: 20%;
    width: 25%;
    height: 60%;
}

.touch-rotate {
    position: absolute;
    left: 25%;
    top: 0;
    width: 50%;
    height: 30%;
}

.touch-down {
    position: absolute;
    left: 25%;
    bottom: 0;
    width: 50%;
    height: 30%;
}

/* Info Bar */
.info-bar {
    grid-row: 3;
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 2px;
    padding: 1px 3px;
    background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%);
    border-radius: var(--radius-md);
    margin: 2px;
    box-shadow: 0 1px 6px var(--shadow);
    height: 40px;
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: auto;
    padding: 0 4px;
    flex: 1;
}

.info-label {
    font-size: 0.38rem;
    font-weight: 700;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    line-height: 1;
}

.info-value {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-dark);
    text-shadow: 1px 1px 1px var(--shadow);
    line-height: 1.2;
}

/* Controls Bar */
.controls-bar {
    grid-row: 4;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    padding: 2px 1px;
    height: 50px;
    position: relative;
    z-index: 10;
}

.control-btn {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-lavender) 100%);
    color: var(--white);
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 8px var(--shadow);
    transition: transform 0.1s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

.control-btn:active {
    transform: scale(0.85);
}

.control-btn-lg {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
}

/* Overlays */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(100, 80, 120, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    animation: fadeIn 0.2s ease;
}

.overlay.active {
    display: flex;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.overlay-content {
    background: linear-gradient(135deg, var(--white) 0%, var(--gradient-mid) 100%);
    border-radius: var(--radius-lg);
    padding: 20px;
    text-align: center;
    box-shadow: 0 20px 60px var(--shadow-strong);
    max-width: 260px;
    width: 100%;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.overlay-icon {
    font-size: 2.2rem;
    margin-bottom: 10px;
    animation: bounce 1s ease infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

.overlay-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--text-dark);
    margin-bottom: 6px;
}

.overlay-subtitle {
    font-size: 0.85rem;
    color: var(--text-light);
    margin-bottom: 14px;
}

.controls-hint {
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-sm);
    padding: 10px;
    margin-bottom: 14px;
    text-align: left;
}

.controls-hint p {
    font-size: 0.7rem;
    color: var(--text-dark);
    margin-bottom: 3px;
}

.controls-hint p:last-child {
    margin-bottom: 0;
}

.final-score {
    margin-bottom: 14px;
}

.final-label {
    display: block;
    font-size: 0.65rem;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
}

.final-value {
    display: block;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text-dark);
}

.final-stats {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 14px;
}

.stat {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 0.55rem;
    color: var(--text-light);
    text-transform: uppercase;
    margin-bottom: 3px;
}

.stat-value {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dark);
}

.play-again-btn {
    width: 100%;
    padding: 10px 18px;
    border: none;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-lavender) 100%);
    color: var(--white);
    font-size: 0.95rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 4px 16px var(--shadow-strong);
    transition: transform 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    -webkit-tap-highlight-color: transparent;
}

.play-again-btn:active {
    transform: scale(0.95);
}

.btn-emoji {
    font-size: 1.1rem;
}

/* Mobile - Show touch controls */
@media (max-width: 600px) {
    .touch-controls {
        display: block;
    }
}

/* Very small screens */
@media (max-height: 550px) {
    .game-container {
        grid-template-rows: 20px 1fr 36px 44px;
        padding: 1px;
    }

    .game-title {
        font-size: 0.7rem;
    }

    .title-icon {
        font-size: 0.6rem;
    }

    .game-wrapper {
        padding: 1px;
    }

    .board-container {
        padding: 2px;
    }

    .info-bar {
        padding: 1px 2px;
        margin: 1px;
        height: 36px;
        gap: 1px;
    }

    .info-label {
        font-size: 0.35rem;
    }

    .info-value {
        font-size: 0.6rem;
    }

    .controls-bar {
        padding: 1px;
        height: 44px;
        gap: 1px;
    }

    .control-btn {
        width: 30px;
        height: 30px;
        font-size: 0.85rem;
    }

    .control-btn-lg {
        width: 36px;
        height: 36px;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
