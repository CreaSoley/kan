// =============================
// KIHON TRAINER
// =============================

let techniques = []
let current = null
let tempo = 1

const synth = window.speechSynthesis

const zones = {
none: "aucune",
mb: "bas du manche",
mm: "milieu du manche",
cro: "crosse",
pt: "pointe"
}

const countJP = [
"ichi","ni","san","shi","go",
"roku","shichi","hachi","kyu","ju"
]

const btn = document.getElementById("toggle-favori");
if (favoris.includes(tech.id)) {
    btn.textContent = "Retirer des favoris";
} else {
    btn.textContent = "Ajouter aux favoris";
}
// =============================
// LOAD JSON
// =============================

async function loadTechniques(){

try{

const res = await fetch("../data/kihon.json")

if(!res.ok)
throw new Error("kihon.json introuvable")

techniques = await res.json()

console.log("techniques chargées:",techniques.length)

buildMenu()

}
catch(err){

console.error("Erreur chargement JSON :",err)

}

}

// =============================
// MENU
// =============================

function buildMenu(){

const menu = document.getElementById("techniques-menu")

if(!menu) return

menu.innerHTML=""

techniques.forEach(t=>{

const li=document.createElement("li")

li.textContent=t.nom

li.onclick=()=>playTechnique(t)

menu.appendChild(li)

})

}

// =============================
// AFFICHAGE
// =============================

function updateDetails(t){

if(!t) return

document.getElementById("technique-name").textContent = t.nom

document.getElementById("technique-objectif").textContent =
"Objectif : "+t.objectif

document.getElementById("technique-zone").textContent =
"Zone : "+(zones[t.zone]||t.zone)

const ul=document.getElementById("technique-etapes")

ul.innerHTML=""

t.etapes.forEach(e=>{

const li=document.createElement("li")

li.textContent=e

ul.appendChild(li)

})

if(t.video)
document.getElementById("video-frame").src=t.video

}

// =============================
// VOIX
// =============================
function speak(text) {
    return new Promise(resolve => {
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "fr-FR";
        utter.rate = 1 * tempo;
        utter.onend = resolve;
        synth.speak(utter);
    });
}
// =============================
// COMPTE JAPONAIS
// =============================

async function count(n){

for(let i=0;i<n;i++){

await speak(countJP[i]||"")

await wait(500/tempo)

}

}

// =============================
// PLAY TECHNIQUE
// =============================

async function playTechnique(t){

if(!t) return

current=t

updateDetails(t)

await count(t.etapes.length)

for(let e of t.etapes){

await speak(e)

await wait(600/tempo)

}

}

// =============================
// COMBO
// =============================

async function playCombo(){

if(techniques.length===0) return

for(let i=0;i<3;i++){

const t=techniques[Math.floor(Math.random()*techniques.length)]

await playTechnique(t)

}

}

// =============================
// SPARRING
// =============================

async function sparring(){

if(techniques.length===0) return

for(let i=0;i<5;i++){

const t=techniques[Math.floor(Math.random()*techniques.length)]

await playTechnique(t)

}

}

// =============================
// TEMPO
// =============================

function setTempo(v){

tempo=parseFloat(v)

}

// =============================
// UTILS
// =============================

function wait(ms){

return new Promise(r=>setTimeout(r,ms))

}

// =============================
// INIT
// =============================

document.addEventListener("DOMContentLoaded",()=>{

loadTechniques()

const tempoSelect=document.getElementById("tempo-select")

if(tempoSelect){

tempoSelect.addEventListener("change",e=>{

setTempo(e.target.value)

})

}

})
