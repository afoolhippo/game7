const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const titleScreen = document.getElementById("titleScreen");
const resultScreen = document.getElementById("resultScreen");
const resultItems = document.getElementById("resultItems");

const titleImage = document.getElementById("titleImage");
const pressStart = document.getElementById("pressStart");

const shareButton = document.getElementById("shareButton");
const retryButton = document.getElementById("retryButton");
const homeButton = document.getElementById("homeButton");

const fishButton = document.getElementById("fishButton");
const exitButton = document.getElementById("exitButton");

const bgm = document.getElementById("bgm");
const resultVoice = document.getElementById("resultVoice");
const hitSe = document.getElementById("hitSe");
const catchSe = document.getElementById("catchSe");
const bigCatchSe = document.getElementById("bigCatchSe");

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
let stateTimer = 0;
let bobberY = 0;

let fishShadowX = 0;
let fishShadowDir = 1;

let catches = [];
let currentCatch = null;

let eventTimers = [];
let resultVoiceTimer = null;

let resultTitleText = "";
let resultCommentText = "";

const junkPool = [
  { name:"空き缶", image:canImg, src:"can.png" },
  { name:"長靴", image:bootImg, src:"boot.png" },
  { name:"木の枝", image:branchImg, src:"branch.png" },
  { name:"ビニール袋", image:bagImg, src:"bag.png" }
];

const normalComments = [
  "海は広かった。",
  "魚の気配はあった。",
  "静かな30秒だった。",
  "また来よう。"
];

const rareComments = [
  "あれは本当に魚だったのか。",
  "誰も信じてくれない。",
  "海の底で何かが動いていた。"
];

function vibrate(pattern){
  if(navigator.vibrate){
    navigator.vibrate(pattern);
  }
}

function clearEventTimers(){
  eventTimers.forEach(id => clearTimeout(id));
  eventTimers = [];
}

function startGame(){
  gameStarted = true;
  gameEnded = false;

  timer = 30;
  catches = [];
  currentCatch = null;
  state = "waiting";
  resultTitleText = "";
  resultCommentText = "";

  clearEventTimers();

  if(resultVoiceTimer){
    clearTimeout(resultVoiceTimer);
    resultVoiceTimer = null;
  }

  resultVoice.pause();
  resultVoice.currentTime = 0;

  hitSe.pause();
  hitSe.currentTime = 0;

  catchSe.pause();
  catchSe.currentTime = 0;

  bigCatchSe.pause();
  bigCatchSe.currentTime = 0;

  bgm.pause();
  bgm.currentTime = 0;
  bgm.volume = 0.5;
  bgm.play().catch(()=>{});

  titleScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  fishButton.classList.remove("hidden");
  exitButton.classList.remove("hidden");

  fishShadowX = width / 2 - 120;
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

  const hasLegendFish =
    catches.some(item => item.type === "fish");

  if(hasLegendFish){
    resultTitleText = "釣れたッ！？";
    resultCommentText =
      rareComments[Math.floor(Math.random() * rareComments.length)];
  }else{
    resultTitleText = "今日も釣れませんでした";
    resultCommentText =
      normalComments[Math.floor(Math.random() * normalComments.length)];
  }

  const heading = document.createElement("div");
  heading.className = "resultHeading";
  heading.textContent = resultTitleText;
  resultItems.appendChild(heading);

  const comment = document.createElement("div");
  comment.className = "resultComment";
  comment.textContent = resultCommentText;
  resultItems.appendChild(comment);

  if(catches.length === 0){
    const emptyRow = document.createElement("div");
    emptyRow.className = "resultRow";
    emptyRow.innerHTML = `<div>釣果なし</div>`;
    resultItems.appendChild(emptyRow);
  }else{
    catches.forEach(item=>{
      const row = document.createElement("div");
      row.className = "resultRow";

      row.innerHTML = `
        <img class="resultIcon" src="${item.src}" alt="">
        <div>${item.name}</div>
      `;

      resultItems.appendChild(row);
    });
  }

  resultVoiceTimer = setTimeout(()=>{
    resultVoice.currentTime = 0;
    resultVoice.play().catch(()=>{});
  }, 600);
}

function scheduleFixedEvents(){
  const events = [
    { time: Math.random() * 2000 + 3500, type: "real" },
    { time: Math.random() * 2000 + 7500, type: "fake" },
    { time: Math.random() * 2000 + 11500, type: "real" },
    { time: Math.random() * 2000 + 16500, type: "real" },
    { time: Math.random() * 2000 + 21500, type: "fake" },
    { time: Math.random() * 2000 + 26000, type: "real" }
  ];

  events.forEach(event=>{
    const id = setTimeout(()=>{
      if(!gameStarted || gameEnded || state !== "waiting") return;

      if(event.type === "fake"){
        state = "fake";
        stateTimer = 18;
        vibrate(50);
      }else{
        state = "real";
        stateTimer = Math.random() < 0.35 ? 105 : 58;

        hitSe.currentTime = 0;
        hitSe.play().catch(()=>{});

        vibrate([120,80,180]);
      }
    }, event.time);

    eventTimers.push(id);
  });
}

function update(){
  if(!gameStarted || gameEnded) return;

  timer -= 1 / 60;

  if(timer <= 0){
    endGame();
    return;
  }

  const leftLimit = width / 2 - 190;
  const rightLimit = width / 2 + 30;

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
      stateTimer = 45;
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
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(width - 180, 120, 32, 0, Math.PI * 2);
  ctx.arc(width - 145, 105, 42, 0, Math.PI * 2);
  ctx.arc(width - 100, 120, 32, 0, Math.PI * 2);
  ctx.fill();
}

function drawSea(){
  ctx.fillStyle = "#39a7d8";
  ctx.fillRect(0, height * 0.45, width, height);
}

function drawBoat(){
  const boatY =
    height * 0.43 +
    Math.sin(Date.now() * 0.002) * 3;

  ctx.drawImage(
    boatImg,
    width / 2 - 80,
    boatY - 30,
    160,
    80
  );

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(width / 2 + 62, boatY + 10);
  ctx.lineTo(width / 2 + 92, bobberY);
  ctx.stroke();
}

function drawBobber(){
  const bobberX = width / 2 + 92;

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

  ctx.fillStyle = state === "real" ? "#fff000" : "#ff3b30";

  ctx.beginPath();
  ctx.arc(bobberX, bobberY, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawFishShadow(){
  const pulse =
    0.18 +
    Math.sin(Date.now() * 0.002) * 0.14;

  ctx.globalAlpha =
    state === "real"
    ? 0.5
    : Math.max(0.05, pulse);

  ctx.save();

  if(fishShadowDir < 0){
    ctx.translate(fishShadowX + 220, height * 0.67);
    ctx.scale(-1, 1);
    ctx.drawImage(fishShadowImg, 0, 0, 220, 90);
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
  ctx.font = '30px "DotGothic16", monospace';

  ctx.fillText("TIME " + Math.ceil(timer), 20, 50);

  if(state === "waiting"){
    ctx.font = '20px "DotGothic16", monospace';
    ctx.fillText("ウキを見ろ！", 20, 82);
  }

  if(state === "fake"){
    ctx.fillStyle = "#102030";
    ctx.font = '34px "DotGothic16", monospace';
    ctx.fillText("ピク…", width / 2 + 45, bobberY - 40);
  }

  if(state === "real"){
    const textX = width / 2 + 32;
    const textY = bobberY - 70;

    ctx.fillStyle = "#e01b1b";
    ctx.font = '42px "DotGothic16", monospace';
    ctx.fillText("HIT!!", textX, textY);

    ctx.font = '34px "DotGothic16", monospace';
    ctx.fillText("PUSH!", textX, textY + 42);
  }

  if(state === "miss"){
    ctx.fillStyle = "#102030";
    ctx.font = '36px "DotGothic16", monospace';
    ctx.fillText("逃げられた…", width / 2 - 118, 140);
  }
}

function drawReveal(){
  if(state !== "reveal") return;

  ctx.fillStyle = "#102030";
  ctx.font = '54px "DotGothic16", monospace';
  ctx.fillText("！？", width / 2 - 30, 112);

  const itemY = 185;

  if(currentCatch.type === "fish"){
    ctx.drawImage(
      giantFishImg,
      width / 2 - 220,
      itemY - 55,
      440,
      220
    );
  }else{
    ctx.drawImage(
      currentCatch.image,
      width / 2 - 115,
      itemY - 40,
      230,
      230
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

function pullFish(){
  if(!gameStarted || gameEnded) return;

  if(state === "fake"){
    state = "miss";
    stateTimer = 45;
    vibrate(200);
    return;
  }

  if(state === "real"){
    const rare = Math.random() < 0.05;

    if(rare){
      currentCatch = {
        type:"fish",
        name:"巨大魚",
        image:giantFishImg,
        src:"giantfish.png"
      };

      catches.push(currentCatch);

      bigCatchSe.currentTime = 0;
      bigCatchSe.play().catch(()=>{});
    }else{
      currentCatch =
        junkPool[
          Math.floor(Math.random() * junkPool.length)
        ];

      catches.push(currentCatch);

      catchSe.currentTime = 0;
      catchSe.play().catch(()=>{});
    }

    state = "reveal";
    stateTimer = 85;

    vibrate([80,60,80]);
  }
}

function buildShareText(){
  const catchNames =
    catches.length === 0
    ? "釣果なし"
    : catches.map(c => c.name).join("、");

  if(resultTitleText === "釣れたッ！？"){
    return `巨大魚、釣れたかもしれない🎣🐟

本日の釣果：
${catchNames}

無料ブラウザゲーム
「FISHING BOY」
https://afoolhippo.github.io/game7/

#FISHINGBOY
#カバゲーセン`;
  }

  return `結局一匹も釣れませんでしたー🎣🌊

本日の釣果：
${catchNames}

無料ブラウザゲーム
「FISHING BOY」
https://afoolhippo.github.io/game7/

#FISHINGBOY
#カバゲーセン`;
}

titleImage.addEventListener("pointerdown", startGame);
pressStart.addEventListener("pointerdown", startGame);

shareButton.addEventListener("pointerdown", (e)=>{
  e.stopPropagation();

  const url =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(buildShareText());

  window.open(url, "_blank");
});

retryButton.addEventListener("pointerdown", (e)=>{
  e.stopPropagation();

  if(gameEnded){
    startGame();
  }
});

homeButton.addEventListener("pointerdown", (e)=>{
  e.stopPropagation();

  window.location.href =
    "https://afoolhippo.github.io/home/?skipTitle=1";
});

fishButton.addEventListener("pointerdown", (e)=>{
  e.stopPropagation();
  pullFish();
});

exitButton.addEventListener("pointerdown", (e)=>{
  e.stopPropagation();

  clearEventTimers();

  if(resultVoiceTimer){
    clearTimeout(resultVoiceTimer);
    resultVoiceTimer = null;
  }

  bgm.pause();

  resultVoice.pause();
  resultVoice.currentTime = 0;

  hitSe.pause();
  hitSe.currentTime = 0;

  catchSe.pause();
  catchSe.currentTime = 0;

  bigCatchSe.pause();
  bigCatchSe.currentTime = 0;

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