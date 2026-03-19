const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;

let grid;
let piece;

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]]
];

const COLORS = ["#00e5ff","#ffd600","#d500f9","#00e676","#ff1744"];

/* ---------- INIT ---------- */
function resetGrid(){
  grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
}

function createPiece(){
  const shape = SHAPES[Math.floor(Math.random()*SHAPES.length)];

  return {
    x: Math.floor(COLS/2) - Math.floor(shape[0].length/2),
    y: -1,
    shape: shape.map(r=>[...r]),
    color: COLORS[Math.floor(Math.random()*COLORS.length)]
  };
}

/* ---------- RESIZE ---------- */
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

/* ---------- COLLISION ---------- */
function collide(p){
  for(let y=0;y<p.shape.length;y++){
    for(let x=0;x<p.shape[y].length;x++){
      if(!p.shape[y][x]) continue;

      const nx = p.x + x;
      const ny = p.y + y;

      if(nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if(ny >= 0 && grid[ny][nx]) return true;
    }
  }
  return false;
}

/* ---------- MERGE ---------- */
function merge(){
  piece.shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        grid[piece.y+y][piece.x+x] = piece.color;
      }
    });
  });
}

/* ---------- ROTATE ---------- */
function rotate(matrix){
  return matrix[0].map((_,i)=>
    matrix.map(r=>r[i]).reverse()
  );
}

/* ---------- GAME LOOP ---------- */
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 600;

function update(time=0){
  const delta = time - lastTime;
  lastTime = time;

  dropCounter += delta;

  if(dropCounter > dropInterval){
    piece.y++;

    if(collide(piece)){
      piece.y--;
      merge();
      piece = createPiece();

      if(collide(piece)){
        resetGrid();
      }
    }

    dropCounter = 0;
  }
}

/* ---------- DRAW ---------- */
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
}

function loop(time){
  update(time);
  draw();
  requestAnimationFrame(loop);
}

/* ---------- CONTROLS ---------- */
function move(dx){
  piece.x += dx;
  if(collide(piece)) piece.x -= dx;
}

function drop(){
  piece.y++;
  if(collide(piece)) piece.y--;
}

function rotatePiece(){
  const rotated = rotate(piece.shape);
  const prev = piece.shape;
  piece.shape = rotated;

  if(collide(piece)){
    piece.shape = prev;
  }
}

document.getElementById("left").onclick = ()=>move(-1);
document.getElementById("right").onclick = ()=>move(1);
document.getElementById("down").onclick = drop;
document.getElementById("rotate").onclick = rotatePiece;

document.getElementById("restart").onclick = ()=>{
  resetGrid();
  piece = createPiece();
};

/* ---------- START ---------- */
resetGrid();
piece = createPiece();
loop();
