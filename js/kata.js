/* =========================================================
Kata Data (affichage)
========================================================= */
const data = [
 { id: "taikan_shodan", nom:"Kata 4", video:"../video/kata4.mp4", pdf:"../video/kata4.pdf" },
 { id: "taikan_nidan", nom:"Kata 6", video:"../video/kata6.mp4", pdf:"../video/kata6.pdf" },
 { id: "kata3", nom:"Kata 3", video:"../video/kata3.mp4", pdf:"../video/kata3.pdf" },
 { id: "taikan_ryutai", nom:"Kata 1", video:"../video/kata1.mp4", pdf:"../video/kata1.pdf" },
 { id: "kata1", nom:"Kata 2", video:"../video/kata2.mp4", pdf:"../video/kata2.pdf" },
 { id: "kata5", nom:"Kata 5", video:"../video/kata5.mp4", pdf:"../video/kata5.pdf" }
];

let index = 0;
const select = document.getElementById("kataSelect");
const card = document.getElementById("card");

/* =========================================================
Affichage des katas
========================================================= */
function initSelect(){
 select.innerHTML = data
   .map((k,i)=>`<option value="${i}">${k.nom}</option>`)
   .join("");
 select.onchange = () => { index = parseInt(select.value); afficher(); populatePartSelect(); };
}

function afficher(){
 const k = data[index];
 select.value = index;
 card.innerHTML = `
   <h2>${k.nom}</h2>
   <video controls playsinline preload="metadata" class="kata-video">
     <source src="${k.video}" type="video/mp4">
   </video>
   <a href="${k.pdf}" target="_blank" class="kawaii-btn">
     📄 Étapes du kata
   </a>
 `;
}

function nextKata(){ index = (index + 1) % data.length; afficher(); populatePartSelect(); }
function prevKata(){ index = (index - 1 + data.length) % data.length; afficher(); populatePartSelect(); }
function randomKata(){ index = Math.floor(Math.random()*data.length); afficher(); populatePartSelect(); }

initSelect();
afficher();

/* =========================================================
Chargement automatique de kata.json
========================================================= */
let kataData = [];
fetch('../data/kata.json')  // chemin à adapter si nécessaire
  .then(r => r.json())
  .then(d => {
    kataData = d;
    populatePartSelect();
  })
  .catch(err => console.error("Impossible de charger kata.json", err));

/* =========================================================
Populate Part Select
========================================================= */
function populatePartSelect(){
 const partSelect = document.getElementById("partSelect");
 if(!partSelect || kataData.length === 0) return;
 const kata = kataData.find(k => k.id === data[index].id);
 if(!kata) { partSelect.innerHTML=""; return; }
 partSelect.innerHTML = "";
 kata.parts.forEach((p,i)=>{
   const opt = document.createElement("option");
   opt.value = i;
   opt.textContent = p.name;
   partSelect.appendChild(opt);
 });
}

/* =========================================================
VOICE ENGINE
========================================================= */
let isPaused = false;
let isStopped = false;

async function speak(text){
 if(!text) return;
 displayText(text);
 return new Promise(resolve=>{
   const utter = new SpeechSynthesisUtterance(text);
   utter.lang = "fr-FR";
   utter.rate = 1;
   utter.pitch = 1;
   utter.onend = resolve;
   speechSynthesis.speak(utter);
 });
}

function displayText(text){
 const displayZone = document.getElementById("resultDisplay");
 if(displayZone) displayZone.textContent = text;
}

/* =========================================================
Guidage vocal principal
========================================================= */
async function startVoiceGuide(){
 const kata = kataData.find(k => k.id === data[index].id);
 if(!kata) return;

 const partSelect = document.getElementById("partSelect");
 const repeatCount = parseInt(document.getElementById("repeatCount").value) || 1;

 // Parties sélectionnées
 const selectedParts = Array.from(partSelect.selectedOptions).map(o=>parseInt(o.value));
 const partsToRead = selectedParts.length>0 ? selectedParts.map(i=>kata.parts[i]) : kata.parts;

 isPaused = false;
 isStopped = false;

 for(let r=0; r<repeatCount; r++){
   for(const part of partsToRead){
     if(isStopped) return;
     await speak(part.name);
     for(const seg of part.segments){
       if(isStopped) return;
       while(isPaused) await new Promise(res=>setTimeout(res,500));
       await speak(seg.text);
       await new Promise(res=>setTimeout(res, seg.pause_after));
     }
   }
 }
}

function pauseVoiceGuide(){ isPaused = true; }
function stopVoiceGuide(){ isStopped = true; speechSynthesis.cancel(); }

/* =========================================================
Event listeners boutons
========================================================= */
document.getElementById("startVoiceBtn").addEventListener("click", startVoiceGuide);
document.getElementById("pauseVoiceBtn").addEventListener("click", pauseVoiceGuide);
document.getElementById("stopVoiceBtn").addEventListener("click", stopVoiceGuide);
