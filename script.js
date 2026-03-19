const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;

let grid, piece;
let score, lines, level;

let loopId = null;
let isGameOver = false;

/* ===== 7-BAG RANDOM (как в настоящем тетрисе) ===== */
const SHAPES = [
  [[1,1,1,1]],               // I
  [[1,1],[1,1]],             // O
  [[0,1,0],[1,1,1]],         // T
  [[1,1,0],[0,1,1]],         // S
  [[0,1,1],[1,1,0]],         // Z
  [[1,0,0],[1,1,1]],         // L
  [[0,0,1],[1,1,1]]          // J
];

const COLORS = ["#00e5ff","#ffd600","#d500f9","#00e676","#ff1744","#ff9100","#2979ff"];

let bag = [];

function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i],array[j]] = [array[j],array[i]];
  }
}

function getNextShape(){
  if(bag.length === 0){
    bag = SHAPES.map(s => s);
    shuffle(bag);
  }
  return bag.pop();
}

/* ===== INIT ===== */
function createPiece(){
  const shape = getNextShape();
  return {
    x: Math.floor(COLS/2) - Math.floor(shape[0].length/2),
    y: -2,
    shape: shape.map(r=>[...r]),
    color: COLORS[Math.floor(Math.random()*COLORS.length)]
  };
}

function resetGame(){
  grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  bag = [];
  piece = createPiece();

  score = 0;
  lines = 0;
  level = 1;

  isGameOver = false;

  document.getElementById("gameOver").style.display = "none";

  if(!loopId){
    loop();
  }
}

/* ===== RESIZE ===== */
function resizeCanvas(){
  const wrapper = document.querySelector(".game-wrapper");
  const block = Math.floor(Math.min(wrapper.clientHeight/ROWS, wrapper.clientWidth/COLS));
  canvas.width = block * COLS;
  canvas.height = block * ROWS;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", ()=>setTimeout(resizeCanvas,50));

/* ===== COLLISION ===== */
function collide(p){
  for(let y=0;y<p.shape.length;y++){
    for(let x=0;x<p.shape[y].length;x++){
      if(!p.shape[y][x]) continue;

      const nx = p.x + x;
      const ny = p.y + y;

      if(nx<0 || nx>=COLS || ny>=ROWS) return true;
      if(ny>=0 && grid[ny][nx]) return true;
    }
  }
  return false;
}

/* ===== MERGE ===== */
function merge(){
  piece.shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        const ny = piece.y + y;
        if(ny >= 0){
          grid[ny][piece.x+x] = piece.color;
        }
      }
    });
  });
}

/* ===== CLEAR LINES ===== */
function clearLines(){
  let cleared = 0;

  outer: for(let y=ROWS-1;y>=0;y--){
    for(let x=0;x<COLS;x++){
      if(!grid[y][x]) continue outer;
    }

    grid.splice(y,1);
    grid.unshift(Array(COLS).fill(0));
    cleared++;
    y++;
  }

  if(cleared){
    lines += cleared;
    score += cleared * 100;
    level = 1 + Math.floor(lines/10);
  }
}

/* ===== ROTATE ===== */
function rotate(m){
  return m[0].map((_,i)=>m.map(r=>r[i]).reverse());
}

/* ===== LOOP ===== */
let lastTime = 0;
let dropCounter = 0;

function update(time=0){
  if(isGameOver) return;

  const delta = time - lastTime;
  lastTime = time;

  dropCounter += delta;

  const speed = Math.max(120, 600 - level * 40);

  if(dropCounter > speed){
    piece.y++;

    if(collide(piece)){
      piece.y--;
      merge();
      clearLines();
      piece = createPiece();

      /* ===== GAME OVER FIX ===== */
      if(collide(piece)){
        isGameOver = true;
        document.getElementById("gameOver").style.display = "flex";
        return;
      }
    }

    dropCounter = 0;
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const size = canvas.width/COLS;

  grid.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        ctx.fillStyle = v;
        ctx.fillRect(x*size,y*size,size,size);
      }
    });
  });

  ctx.fillStyle = piece.color;
  piece.shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        ctx.fillRect((piece.x+x)*size,(piece.y+y)*size,size,size);
      }
    });
  });

  document.getElementById("score").innerText = score;
  document.getElementById("lines").innerText = lines;
  document.getElementById("level").innerText = level;
}

function loop(time){
  update(time);
  draw();
  loopId = requestAnimationFrame(loop);
}

/* ===== CONTROLS ===== */
function move(dx){
  if(isGameOver) return;
  piece.x += dx;
  if(collide(piece)) piece.x -= dx;
}

function drop(){
  if(isGameOver) return;
  piece.y++;
  if(collide(piece)) piece.y--;
}

function rotatePiece(){
  if(isGameOver) return;
  const prev = piece.shape;
  piece.shape = rotate(piece.shape);
  if(collide(piece)) piece.shape = prev;
}

document.getElementById("left").onclick = ()=>move(-1);
document.getElementById("right").onclick = ()=>move(1);
document.getElementById("down").onclick = drop;
document.getElementById("rotate").onclick = rotatePiece;

document.getElementById("restart").onclick = restartGame;
document.getElementById("playAgainBtn").onclick = restartGame;

/* ===== RESTART FIX ===== */
function restartGame(){
  cancelAnimationFrame(loopId);
  loopId = null;
  resetGame();
}

/* ===== START ===== */
resetGame();
loop();

/* ===== SAFARI ZOOM FIX ===== */
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, false);
