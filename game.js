const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const titleScreen = document.getElementById("titleScreen");
const resultScreen = document.getElementById("resultScreen");
const resultItems = document.getElementById("resultItems");

const bgm = document.getElementById("bgm");
const resultVoice = document.getElementById("resultVoice");

const boatImg = new Image();
boatImg.src = "boat.png";

const fishShadowImg = new Image();
fishShadowImg.src = "fish_shadow.png";

const giantFishImg = new Image();
giantFishImg.src = "giantfish.png";

const bootImg = new Image();
bootImg.src = "boot.png";

const branchImg = new Image();
branchImg.src = "branch.png";

const bagImg = new Image();
bagImg.src = "bag.png";

const canImg = new Image();
canImg.src = "can.png";

let width;
let height;

function resize(){
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);

let gameStarted = false;
let gameEnded = false;

let timer = 30;

let state = "waiting";
/*
waiting
fake
real
reveal
miss
*/

let stateTimer = 0;

let bobberY = 0;
let fishShadowX = -300;

let catches = [];

let currentCatch = null;

const junkPool = [
  {
    name:"空き缶",
    image:canImg
  },
  {
    name:"長靴",
    image:bootImg
  },
  {
    name:"木の枝",
    image:branchImg
  },
  {
    name:"ビニール袋",
    image:bagImg
  }
];

function startGame(){

  gameStarted = true;
  gameEnded = false;

  timer = 30;

  catches = [];

  currentCatch = null;

  state = "waiting";

  titleScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  resultVoice.pause();
  resultVoice.currentTime = 0;

  bgm.play();

  scheduleEvent();
}

function endGame(){

  gameEnded = true;

  resultScreen.classList.remove("hidden");

  resultItems.innerHTML = "";

  catches.forEach(item=>{

    const div = document.createElement("div");

    div.textContent = "・" + item;

    resultItems.appendChild(div);

  });

  setTimeout(()=>{

    resultVoice.play();

  },3000);
}

function scheduleEvent(){

  const delay = Math.random() * 5000 + 3000;

  setTimeout(()=>{

    if(gameEnded || !gameStarted) return;

    const fakeChance = Math.random() < 0.5;

    if(fakeChance){

      state = "fake";
      stateTimer = 40;

    }else{

      state = "real";
      stateTimer = 45;

    }

  },delay);
}

function update(){

  if(!gameStarted || gameEnded) return;

  timer -= 1/60;

  if(timer <= 0){

    endGame();

  }

  fishShadowX += 1;

  if(fishShadowX > width + 300){

    fishShadowX = -400;

  }

  bobberY = height * 0.49 +
    Math.sin(Date.now() * 0.004) * 4;

  if(state === "fake"){

    bobberY += 12;

    stateTimer--;

    if(stateTimer <= 0){

      state = "waiting";

      scheduleEvent();

    }
  }

  if(state === "real"){

    bobberY += 28;

    stateTimer--;

    if(stateTimer <= 0){

      state = "miss";

      stateTimer = 60;

      catches.push("逃げられた…");

    }
  }

  if(state === "miss"){

    stateTimer--;

    if(stateTimer <= 0){

      state = "waiting";

      scheduleEvent();

    }
  }

  if(state === "reveal"){

    stateTimer--;

    if(stateTimer <= 0){

      state = "waiting";

      scheduleEvent();

    }
  }
}

function drawSky(){

  ctx.fillStyle = "#8fd8ff";
  ctx.fillRect(0,0,width,height);

  ctx.fillStyle = "#ffffff";

  ctx.beginPath();
  ctx.arc(120,120,35,0,Math.PI*2);
  ctx.arc(150,110,45,0,Math.PI*2);
  ctx.arc(190,120,35,0,Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width-220,180,35,0,Math.PI*2);
  ctx.arc(width-180,160,50,0,Math.PI*2);
  ctx.arc(width-130,180,35,0,Math.PI*2);
  ctx.fill();
}

function drawSea(){

  ctx.fillStyle = "#39a7d8";

  ctx.fillRect(
    0,
    height * 0.45,
    width,
    height
  );

  ctx.strokeStyle = "#d8f6ff";
  ctx.lineWidth = 3;

  for(let i=0;i<width;i+=40){

    ctx.beginPath();

    ctx.moveTo(i,height*0.45);
    ctx.lineTo(i+20,height*0.45);

    ctx.stroke();
  }
}

function drawBoat(){

  const boatY =
    height * 0.43 +
    Math.sin(Date.now() * 0.002) * 3;

  ctx.drawImage(
    boatImg,
    width/2 - 80,
    boatY - 30,
    160,
    80
  );

  ctx.strokeStyle = "#ffffff";

  ctx.beginPath();

  ctx.moveTo(width/2 + 50, boatY + 10);

  ctx.lineTo(
    width/2 + 80,
    bobberY
  );

  ctx.stroke();
}

function drawBobber(){

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    width/2 + 80,
    bobberY,
    24,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.fillStyle = "#ff3b30";

  ctx.beginPath();

  ctx.arc(
    width/2 + 80,
    bobberY,
    10,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

function drawFishShadow(){

  ctx.globalAlpha = 0.4;

  ctx.drawImage(
    fishShadowImg,
    fishShadowX,
    height * 0.67,
    220,
    90
  );

  ctx.globalAlpha = 1;
}

function drawUI(){

  ctx.fillStyle = "#ffffff";

  ctx.font = "30px monospace";

  ctx.fillText(
    "TIME " + Math.ceil(timer),
    20,
    50
  );

  if(state === "real"){

    ctx.fillStyle = "#fff000";

    ctx.font = "58px monospace";

    ctx.fillText(
      "HIT!!",
      width/2 - 90,
      120
    );
  }

  if(state === "miss"){

    ctx.fillStyle = "#ffffff";

    ctx.font = "40px monospace";

    ctx.fillText(
      "逃げられた…",
      width/2 - 120,
      140
    );
  }
}

function drawReveal(){

  if(state !== "reveal") return;

  ctx.fillStyle = "#ffffff";

  ctx.font = "48px monospace";

  ctx.fillText(
    "！？",
    width/2 - 25,
    130
  );

  if(currentCatch.type === "fish"){

    ctx.drawImage(
      giantFishImg,
      width/2 - 180,
      height/2 - 120,
      360,
      180
    );

  }else{

    ctx.drawImage(
      currentCatch.image,
      width/2 - 90,
      height/2 - 90,
      180,
      180
    );
  }
}

function draw(){

  drawSky();

  drawSea();

  drawFishShadow();

  drawBoat();

  drawBobber();

  drawUI();

  drawReveal();
}

window.addEventListener("pointerdown",()=>{

  if(!gameStarted){

    startGame();

    return;
  }

  if(gameEnded){

    startGame();

    return;
  }

  if(state === "fake"){

    state = "miss";

    stateTimer = 60;

    catches.push("早すぎた…");

  }

  else if(state === "real"){

    const rare = Math.random() < 0.05;

    if(rare){

      currentCatch = {
        type:"fish"
      };

      catches.push("巨大魚");

    }else{

      currentCatch =
        junkPool[
          Math.floor(
            Math.random() * junkPool.length
          )
        ];

      catches.push(currentCatch.name);
    }

    state = "reveal";

    stateTimer = 90;
  }
});

function loop(){

  update();

  draw();

  requestAnimationFrame(loop);
}

loop();