/* =========================
   TAIKAN — KIHON ENGINE
   ========================= */

/* ===== DATA ===== */
let DATA = {};
let GAMMES = [];
let sequence = [];
let index = 0;
let timer = null;
let paused = false;
let stopped = false;
let examMode = false;
let workedSeconds = 0;
let examRecapData = [];
let trainingRecapData = [];

/* ===== ELEMENTS ===== */
const mode = document.getElementById("mode");
const categorie = document.getElementById("categorie");
const countInput = document.getElementById("count");
const intervalInput = document.getElementById("interval");
const intervalVal = document.getElementById("intervalVal");
const shortText = document.getElementById("shortText");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const presentationBtn = document.getElementById("presentationExam");
const startExamBtn = document.getElementById("startExam");

const visual = document.getElementById("visual");
const text = document.getElementById("text");
const countdown = document.getElementById("countdown");
const recap = document.getElementById("recap");

/* ===== MAPS ===== */
const CATEGORY_MAP = {
  "3pas": "Sur trois pas",
  "surplace": "Sur place",
  "multi": "Multidirectionnel",
  "cibles": "Cibles"
};

const BG_MAP = {
  "3pas":"bg-3pas",
  "surplace":"bg-surplace",
  "multi":"bg-multi",
  "cibles":"bg-cibles"
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
    katakana: g.jp_katakana,
    romaji: g.jp_romaji,
    fr: g.fr,
    level: g.level
  }));
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  await loadGammes();
  if (typeof loadCombinaisons === "function") {
    await loadCombinaisons();
  }
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

function speakJP(text, rate = 0.7){
  if(!text) return Promise.resolve();
  return speak(text.replace(/\s+/g,""), rate, "ja-JP");
}

function shuffleArray(array){
  for (let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

function startLocalCountdown(seconds){
  let remaining = seconds;
  countdown.textContent = fmt(remaining);

  const timerId = setInterval(() => {
    if (paused || stopped) return;
    remaining--;
    countdown.textContent = fmt(remaining);
    if (remaining <= 0) clearInterval(timerId);
  }, 1000);

  return timerId;
}

/* ===== PICK RANDOM ===== */
function pickRandom(cat, n = 1){
  const label = CATEGORY_MAP[cat];
  const list = DATA[label] || [];
  if(!list.length) return n===1?null:[];
  const shuffled=[...list].sort(()=>Math.random()-0.5);
  return n===1?shuffled[0]:shuffled.slice(0,n);
}

/* ===== RUN CORE ===== */
async function run(){

  if (!sequence.length || stopped) return;

  const ex = sequence[index];
  if (!ex) return;

  text.textContent = ex.display;
  const bg = BG_MAP[ex.cat];
  if (bg) visual.className = bg;

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

/* ===== START ===== */
startBtn.onclick = async () => {
  if (!DATA || Object.keys(DATA).length === 0){
    alert("Données non chargées");
    return;
  }

  stopped = false;
  paused = false;
  workedSeconds = 0;
  index = 0;
  sequence = [];

  const m = mode.value;
  const cat = categorie.value;
  const qty = +countInput.value;
  const t = +intervalInput.value;

  if (m === "1"){
    Object.entries(DATA).forEach(([key,list])=>{
      list.forEach(item=>{
        sequence.push({
          cat:key,
          display:item.display,
          spoken:item.spoken,
          time:t
        });
      });
    });

    sequence = shuffleArray(sequence).slice(0,qty);
  }

  if (m === "3"){
    const realCat = CATEGORY_MAP[cat];
    sequence = shuffleArray(DATA[realCat])
      .slice(0,qty)
      .map(item=>({
        cat:cat,
        display:item.display,
        spoken:item.spoken,
        time:t
      }));
  }

  await run();
};

/* ===== PAUSE ===== */
pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️ Reprendre" : "⏸ Pause";
};

/* ===== STOP ===== */
stopBtn.onclick = () => {
  stopped = true;
  paused = false;
  clearInterval(timer);
  speechSynthesis.cancel();
  text.textContent = "Séance arrêtée";
  countdown.textContent = "";
};

/* ===== RESET ===== */
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

/* ===== UI ===== */
intervalInput.oninput = () => {
  intervalVal.textContent = fmt(+intervalInput.value);
};

mode.onchange = () => {
  const exam = mode.value === "exam";
  startBtn.disabled = exam;
  categorie.disabled = exam;
  countInput.disabled = exam;
  intervalInput.disabled = exam;
};
