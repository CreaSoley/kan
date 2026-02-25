/* =========================
   TAIKAN — KIHON ENGINE FINAL
   ========================= */

/* ===== DATA ===== */
let DATA = {};
let GAMMES = [];
let COMBINAISONS = [];

let sequence = [];
let index = 0;
let timer = null;
let paused = false;
let stopped = false;
let workedSeconds = 0;

/* ===== ELEMENTS ===== */
const mode = document.getElementById("mode");
const categorie = document.getElementById("categorie");
const countInput = document.getElementById("count");
const intervalInput = document.getElementById("interval");
const intervalVal = document.getElementById("intervalVal");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");

const text = document.getElementById("text");
const countdown = document.getElementById("countdown");
const visual = document.getElementById("visual");

const gammeLevels = document.getElementById("gammeLevels");

/* ===== MAPS ===== */
const CATEGORY_MAP = {
  "3pas": "Sur trois pas",
  "surplace": "Sur place",
  "multi": "Multidirectionnel",
  "cibles": "Cibles"
};

/* ===== LOADERS ===== */
async function loadData(){
  const res = await fetch("../data/enchainements.json");
  DATA = await res.json();
}

async function loadGammes(){
  const res = await fetch("../data/gammes2.json");
  const data = await res.json();

  GAMMES = data.map(g => ({
    display: g.fr,
    spoken: g.jp_romaji,
    level: g.level
  }));
}

async function loadCombinaisons(){
  const res = await fetch("../data/combinaisons.json");
  COMBINAISONS = await res.json();
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  await loadGammes();
  await loadCombinaisons();
  updateModeUI();
});

/* ===== UTILS ===== */
const wait = ms => new Promise(res => setTimeout(res, ms));
const fmt = s => `${Math.floor(s/60)}m ${String(s%60).padStart(2,"0")}s`;

function speak(text, rate = 1, lang = "fr-FR") {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.onend = res;
    speechSynthesis.speak(u);
  });
}

function shuffle(array){
  return [...array].sort(()=>Math.random()-0.5);
}

/* ===== UI MODE ===== */
mode.addEventListener("change", updateModeUI);

function updateModeUI(){
  const m = mode.value;

  gammeLevels.classList.toggle("hidden", m !== "6");

  const showCategorie = m === "2" || m === "3";
  categorie.parentElement.classList.toggle("hidden", !showCategorie);
}

/* ===== RANDOM PICK ===== */
function pickRandom(cat){
  const label = CATEGORY_MAP[cat];
  const list = DATA[label] || [];
  if (!list.length) return null;
  return list[Math.floor(Math.random()*list.length)];
}

/* ===== SEQUENCE BUILD ===== */
function buildSequence(){

  const m = mode.value;
  const cat = categorie.value;
  const qty = +countInput.value;
  const t = +intervalInput.value;

  let seq = [];

  /* === 1 ALEATOIRE GLOBAL === */
  if (m === "1"){
    Object.entries(DATA).forEach(([key,list])=>{
      list.forEach(item=>{
        seq.push({
          display:item.display,
          spoken:item.spoken,
          time:t
        });
      });
    });
    return shuffle(seq).slice(0,qty);
  }

  /* === 2 PAR CATEGORIE === */
  if (m === "2"){
    const label = CATEGORY_MAP[cat];
    return shuffle(DATA[label]).slice(0,qty).map(x=>({
      display:x.display,
      spoken:x.spoken,
      time:t
    }));
  }

  /* === 3 CATEGORIE CHOISIE === */
  if (m === "3"){
    const label = CATEGORY_MAP[cat];
    return shuffle(DATA[label]).slice(0,qty).map(x=>({
      display:x.display,
      spoken:x.spoken,
      time:t
    }));
  }

  /* === 4 GAMMES === */
  if (m === "4"){
    return shuffle(GAMMES).slice(0,qty).map(g=>({
      display:g.display,
      spoken:g.spoken,
      time:t
    }));
  }

  /* === 5 HARA LIGNE === */
  if (m === "5"){
    const label = CATEGORY_MAP[cat];
    return shuffle(DATA[label]).slice(0,qty).map(x=>({
      display:`Hara — ${x.display}`,
      spoken:x.spoken,
      time:t
    }));
  }

  /* === 6 COMBINAISONS === */
  if (m === "6"){
    const levelBtn = document.querySelector(".level-btn.active");
    const level = levelBtn ? levelBtn.dataset.level : "1";

    return shuffle(COMBINAISONS.filter(c=>c.level==level))
      .slice(0,qty)
      .map(x=>({
        display:x.display,
        spoken:x.spoken,
        time:t
      }));
  }

  /* === EXAM === */
  if (m === "exam"){
    const cats = Object.keys(CATEGORY_MAP);
    cats.forEach(c=>{
      const ex = pickRandom(c);
      if(ex){
        seq.push({
          display:ex.display,
          spoken:ex.spoken,
          time:t
        });
      }
    });
    return seq;
  }

  return [];
}

/* ===== RUN ===== */
async function run(){

  if (!sequence.length || stopped) return;

  const ex = sequence[index];
  if (!ex) return;

  text.textContent = ex.display;

  await speak(ex.spoken || ex.display, 0.7);
  await speak("Hajimé", 1);

  let t = ex.time;
  countdown.textContent = fmt(t);

  clearInterval(timer);

  timer = setInterval(() => {
    if (paused || stopped) return;

    t--;
    workedSeconds++;
    countdown.textContent = fmt(t);

    if (t <= 0){
      clearInterval(timer);
      index++;
      run();
    }
  },1000);
}

/* ===== COMMANDS ===== */
startBtn.onclick = async () => {
  stopped = false;
  paused = false;
  index = 0;
  workedSeconds = 0;

  sequence = buildSequence();

  if (!sequence.length){
    alert("Aucune donnée pour ce mode");
    return;
  }

  run();
};

pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️ Reprendre" : "⏸ Pause";
};

stopBtn.onclick = () => {
  stopped = true;
  paused = false;
  clearInterval(timer);
  speechSynthesis.cancel();
  text.textContent = "Séance arrêtée";
  countdown.textContent = "";
};

resetBtn.onclick = () => {
  stopped = true;
  paused = false;
  clearInterval(timer);
  speechSynthesis.cancel();
  index = 0;
  sequence = [];
  text.textContent = "Prêt 🌸";
  countdown.textContent = "";
};

/* ===== INTERVAL UI ===== */
intervalInput.oninput = () => {
  intervalVal.textContent = fmt(+intervalInput.value);
};

/* ===== LEVEL BUTTONS ===== */
document.querySelectorAll(".level-btn").forEach(btn=>{
  btn.onclick = () => {
    document.querySelectorAll(".level-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  };
});
