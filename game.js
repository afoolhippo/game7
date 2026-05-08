const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const titleScreen = document.getElementById("titleScreen");
const resultScreen = document.getElementById("resultScreen");
const resultItems = document.getElementById("resultItems");

const titleImage = document.getElementById("titleImage");
const pressStart = document.getElementById("pressStart");

const fishButton = document.getElementById("fishButton");
const exitButton = document.getElementById("exitButton");

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

let timer = 20;

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

let fishShadowX = 0;
let fishShadowDir = 1;

let catches = [];
let currentCatch = null;

let eventTimers = [];
let resultVoiceTimer = null;

const junkPool = [
  { name:"空き缶", image:canImg },
  { name:"長靴", image:bootImg },
  { name:"木の枝", image:branchImg },
  { name:"ビニール袋", image:bagImg }
];

function vibrate(pattern){
  if(navigator.vibrate){
    navigator.vibrate(pattern);
  }
}

function clearEventTimers(){
  eventTimers.forEach(id=>clearTimeout(id));
  eventTimers = [];
}

function startGame(){

  gameStarted = true;
  gameEnded = false;

  timer = 20;

  catches = [];

  currentCatch = null;

  state = "waiting";

  clearEventTimers();

  if(resultVoiceTimer){
    clearTimeout(resultVoiceTimer);
    resultVoiceTimer = null;
  }

  resultVoice.pause();
  resultVoice.currentTime = 0;

  bgm.pause();
  bgm.currentTime = 0;
  bgm.volume = 0.5;
  bgm.play();

  titleScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  fishButton.classList.remove("hidden");
  exitButton.classList.remove("hidden");

  fishShadowX = width/2 - 120;
  fishShadowDir = 1;

  scheduleFixedEvents();
}

function endGame(){

  if(gameEnded) return;

  gameEnded = true;

  clearEventTimers();

  bgm.pause();

  fishButton.classList.add("hidden");
  exitButton.classList.add("hidden");

  resultScreen.classList.remove("hidden");

  resultItems.innerHTML = "";

  if(catches.length === 0){

    const div = document.createElement("div");
    div.textContent = "・釣果なし";
    resultItems.appendChild(div);

  }else{

    catches.forEach(item=>{

      const div = document.createElement("div");
      div.textContent = "・" + item;
      resultItems.appendChild(div);

    });
  }

  resultVoiceTimer = setTimeout(()=>{

    resultVoice.currentTime = 0;
    resultVoice.play();

  },2500);
}

function scheduleFixedEvents(){

  const fakeCount = Math.floor(Math.random() * 3);

  for(let i=0;i<fakeCount;i++){

    const fakeTime = Math.random() * 7000 + 3000;

    const id = setTimeout(()=>{

      if(!gameStarted || gameEnded || state !== "waiting") return;

      state = "fake";
      stateTimer = 40;

      vibrate(80);

    },fakeTime);

    eventTimers.push(id);
  }

  const realTime = Math.random() * 5000 + 10000;

  const realId = setTimeout(()=>{

    if(!gameStarted || gameEnded || state !== "waiting") return;

    state = "real";
    stateTimer = 80;

    vibrate([120,80,180]);

  },realTime);

  eventTimers.push(realId);
}

function update(){

  if(!gameStarted || gameEnded) return;

  timer -= 1/60;

  if(timer <= 0){
    endGame();
    return;
  }

  const leftLimit = width/2 - 190;
  const rightLimit = width/2 + 30;

  fishShadowX += fishShadowDir * 0.8;

  if(fishShadowX < leftLimit){
    fishShadowX = leftLimit;
    fishShadowDir = 1;
  }

  if(fishShadowX > rightLimit){
    fishShadowX = rightLimit;
    fishShadowDir = -1;
  }

  bobberY =
    height * 0.54 +
    Math.sin(Date.now() * 0.004) * 4;

  if(state === "fake"){

    bobberY += 12;

    stateTimer--;

    if(stateTimer <= 0){
      state = "waiting";
    }
  }

  if(state === "real"){

    bobberY += 32;

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
    }
  }

  if(state === "reveal"){

    stateTimer--;

    if(stateTimer <= 0){
      state = "waiting";
    }
  }
}

function drawSky(){

  ctx.fillStyle = "#8fd8ff";
  ctx.fillRect(0,0,width,height);

  ctx.fillStyle = "#ffffff";

  ctx.beginPath();
  ctx.arc(width - 180,120,32,0,Math.PI*2);
  ctx.arc(width - 145,105,42,0,Math.PI*2);
  ctx.arc(width - 100,120,32,0,Math.PI*2);
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
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(width/2 + 50, boatY + 10);

  ctx.lineTo(width/2 + 80, bobberY);

  ctx.stroke();
}

function drawBobber(){

  const bobberX = width/2 + 80;

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(
    bobberX,
    bobberY,
    state === "real" ? 36 : 24,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    bobberX,
    bobberY,
    state === "real" ? 52 : 36,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.fillStyle =
    state === "real"
    ? "#fff000"
    : "#ff3b30";

  ctx.beginPath();
  ctx.arc(
    bobberX,
    bobberY,
    10,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawFishShadow(){

  ctx.globalAlpha = 0.38;

  ctx.save();

  if(fishShadowDir < 0){

    ctx.translate(
      fishShadowX + 220,
      height * 0.67
    );

    ctx.scale(-1,1);

    ctx.drawImage(
      fishShadowImg,
      0,
      0,
      220,
      90
    );

  }else{

    ctx.drawImage(
      fishShadowImg,
      fishShadowX,
      height * 0.67,
      220,
      90
    );
  }

  ctx.restore();

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

  if(state === "waiting"){

    ctx.font = "20px monospace";

    ctx.fillText(
      "ウキを見ろ",
      20,
      82
    );
  }

  if(state === "fake"){

    ctx.fillStyle = "#ffffff";

    ctx.font = "34px monospace";

    ctx.fillText(
      "ピク…",
      width/2 - 50,
      120
    );
  }

  if(state === "real"){

    ctx.fillStyle = "#fff000";

    ctx.font = "54px monospace";

    ctx.fillText(
      "HIT!!",
      width/2 - 85,
      110
    );

    ctx.fillStyle = "#102030";

    ctx.font = "38px monospace";

    ctx.fillText(
      "PUSH!",
      width/2 - 62,
      155
    );
  }

  if(state === "miss"){

    ctx.fillStyle = "#ffffff";

    ctx.font = "38px monospace";

    ctx.fillText(
      "逃げられた…",
      width/2 - 120,
      140
    );
  }
}

function drawReveal(){

  if(state !== "reveal") return;

  ctx.fillStyle = "#102030";

  ctx.font = "48px monospace";

  ctx.fillText(
    "！？",
    width/2 - 25,
    120
  );

  const itemY = height * 0.62;

  if(currentCatch.type === "fish"){

    ctx.drawImage(
      giantFishImg,
      width/2 - 180,
      itemY - 90,
      360,
      180
    );

  }else{

    ctx.drawImage(
      currentCatch.image,
      width/2 - 70,
      itemY - 70,
      140,
      140
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

titleImage.addEventListener("pointerdown", startGame);
pressStart.addEventListener("pointerdown", startGame);

resultScreen.addEventListener("pointerdown", ()=>{

  if(gameEnded){
    startGame();
  }
});

fishButton.addEventListener("pointerdown",(e)=>{

  e.stopPropagation();

  if(!gameStarted || gameEnded) return;

  if(state === "fake"){

    state = "miss";
    stateTimer = 60;

    catches.push("早すぎた…");

    vibrate(200);

    return;
  }

  if(state === "real"){

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

    vibrate([80,60,80]);
  }
});

exitButton.addEventListener("pointerdown",(e)=>{

  e.stopPropagation();

  clearEventTimers();

  if(resultVoiceTimer){
    clearTimeout(resultVoiceTimer);
    resultVoiceTimer = null;
  }

  bgm.pause();

  resultVoice.pause();
  resultVoice.currentTime = 0;

  gameStarted = false;
  gameEnded = false;

  state = "waiting";

  fishButton.classList.add("hidden");
  exitButton.classList.add("hidden");

  resultScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
});

function loop(){

  update();
  draw();

  requestAnimationFrame(loop);
}

loop();