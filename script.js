const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;

let grid;
let piece;

let score = 0;
let lines = 0;
let level = 1;

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]]
];

const COLORS = ["#00e5ff","#ffd600","#d500f9","#00e676","#ff1744"];

/* init */
function resetGame(){
  grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  piece = createPiece();

  score = 0;
  lines = 0;
  level = 1;

  document.getElementById("gameOver").style.display = "none";
}

function createPiece(){
  const shape = SHAPES[Math.floor(Math.random()*SHAPES.length)];
  return {
    x: 3,
    y: -1,
    shape: shape.map(r=>[...r]),
    color: COLORS[Math.floor(Math.random()*COLORS.length)]
  };
}

/* resize */
function resizeCanvas(){
  const wrapper = document.querySelector(".game-wrapper");
  const h = wrapper.clientHeight;
  const w = wrapper.clientWidth;

  const block = Math.floor(Math.min(h/ROWS, w/COLS));

  canvas.width = block * COLS;
  canvas.height = block * ROWS;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", ()=>setTimeout(resizeCanvas,50));

/* collision */
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

/* merge */
function merge(){
  piece.shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        grid[piece.y+y][piece.x+x] = piece.color;
      }
    });
  });
}

/* clear lines */
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
    level = 1 + Math.floor(lines / 10);
  }
}

/* rotate */
function rotate(matrix){
  return matrix[0].map((_,i)=>matrix.map(r=>r[i]).reverse());
}

/* loop */
let lastTime = 0;
let dropCounter = 0;

function update(time=0){
  const delta = time - lastTime;
  lastTime = time;

  dropCounter += delta;

  const speed = 600 - level * 40;

  if(dropCounter > speed){
    piece.y++;

    if(collide(piece)){
      piece.y--;
      merge();
      clearLines();
      piece = createPiece();

      if(collide(piece)){
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
  requestAnimationFrame(loop);
}

/* controls */
function move(dx){
  piece.x += dx;
  if(collide(piece)) piece.x -= dx;
}

function drop(){
  piece.y++;
  if(collide(piece)) piece.y--;
}

function rotatePiece(){
  const prev = piece.shape;
  piece.shape = rotate(piece.shape);
  if(collide(piece)) piece.shape = prev;
}

document.getElementById("left").onclick = ()=>move(-1);
document.getElementById("right").onclick = ()=>move(1);
document.getElementById("down").onclick = drop;
document.getElementById("rotate").onclick = rotatePiece;

document.getElementById("restart").onclick = restartGame;

function restartGame(){
  resetGame();
}

/* start */
resetGame();
loop();

/* anti zoom safari */
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, false);
