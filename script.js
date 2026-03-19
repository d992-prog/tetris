const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const colors = ["#ff1744","#00e676","#2979ff","#ffd600","#d500f9"];

function randomPiece() {
  return {
    x: 4,
    y: 0,
    shape: [
      [1,1],
      [1,1]
    ],
    color: colors[Math.floor(Math.random()*colors.length)]
  };
}

let piece = randomPiece();

/* ---------- RESIZE ---------- */
function resizeCanvas() {
  const wrapper = document.querySelector(".game-wrapper");

  const h = wrapper.clientHeight;
  const w = wrapper.clientWidth;

  const block = Math.floor(Math.min(h / ROWS, w / COLS));

  canvas.width = block * COLS;
  canvas.height = block * ROWS;

  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", () => setTimeout(resizeCanvas, 50));

/* ---------- COLLISION ---------- */
function collide(p) {
  return p.shape.some((row, dy) =>
    row.some((v, dx) => {
      if (!v) return false;
      let x = p.x + dx;
      let y = p.y + dy;
      return (
        x < 0 ||
        x >= COLS ||
        y >= ROWS ||
        grid[y]?.[x]
      );
    })
  );
}

/* ---------- MERGE ---------- */
function merge() {
  piece.shape.forEach((row, dy) => {
    row.forEach((v, dx) => {
      if (v) {
        grid[piece.y + dy][piece.x + dx] = piece.color;
      }
    });
  });
}

/* ---------- NEW PIECE ---------- */
function spawn() {
  piece = randomPiece();
}

/* ---------- UPDATE (TIME BASED) ---------- */
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 500; // ms

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  dropCounter += delta;

  if (dropCounter > dropInterval) {
    piece.y++;
    if (collide(piece)) {
      piece.y--;
      merge();
      spawn();
    }
    dropCounter = 0;
  }
}

/* ---------- DRAW ---------- */
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const size = canvas.width / COLS;

  // grid
  grid.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        ctx.fillStyle = v;
        ctx.fillRect(x*size,y*size,size,size);
      }
    });
  });

  // piece
  ctx.fillStyle = piece.color;
  piece.shape.forEach((row,dy)=>{
    row.forEach((v,dx)=>{
      if(v){
        ctx.fillRect((piece.x+dx)*size,(piece.y+dy)*size,size,size);
      }
    });
  });
}

/* ---------- LOOP ---------- */
function loop(time){
  update(time);
  draw();
  requestAnimationFrame(loop);
}

loop();

/* ---------- CONTROLS ---------- */
document.getElementById("left").onclick = () => {
  piece.x--;
  if (collide(piece)) piece.x++;
};

document.getElementById("right").onclick = () => {
  piece.x++;
  if (collide(piece)) piece.x--;
};

document.getElementById("down").onclick = () => {
  piece.y++;
  if (collide(piece)) piece.y--;
};

document.getElementById("rotate").onclick = () => {
  piece.shape = piece.shape[0].map((_,i)=>
    piece.shape.map(row=>row[i]).reverse()
  );
  if (collide(piece)) {
    piece.shape = piece.shape[0].map((_,i)=>
      piece.shape.map(row=>row[i]).reverse()
    ); // revert
  }
};

document.getElementById("restart").onclick = () => {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  spawn();
};
