const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

let piece = { x: 4, y: 0, shape: [[1,1],[1,1]] };

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

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const size = canvas.width / COLS;

  // grid
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      if(grid[y][x]){
        ctx.fillStyle = "#888";
        ctx.fillRect(x*size,y*size,size,size);
      }
    }
  }

  // piece
  ctx.fillStyle = "#ff4081";
  piece.shape.forEach((row,dy)=>{
    row.forEach((v,dx)=>{
      if(v){
        ctx.fillRect((piece.x+dx)*size,(piece.y+dy)*size,size,size);
      }
    });
  });
}

function update() {
  piece.y++;
  if(piece.y > ROWS-2){
    piece.y = 0;
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

/* controls */
document.getElementById("left").onclick = ()=>piece.x--;
document.getElementById("right").onclick = ()=>piece.x++;
document.getElementById("down").onclick = ()=>piece.y++;
document.getElementById("rotate").onclick = ()=>{};
document.getElementById("restart").onclick = ()=>{
  piece.y = 0;
};
