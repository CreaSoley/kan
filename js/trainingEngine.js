/* =========================================================
   TaïKan Training Engine PRO
   version pédagogique commentée
   compatible PWA TaïKan

   8 étapes :
   1 méditation
   2 échauffement
   3 flow
   4 kihon
   5 multi-directionnel
   6 kata
   7 étirements
   8 retour au calme
========================================================= */


/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let trainingRunning = false
let trainingPaused = false
let senseiMode = false

let progress = 0
let totalSteps = 0

/* données JSON */

let meditationData = []
let warmupData = []
let kihonData = []
let kataData = []

/* DOM */

let display
let badges


/* =========================================================
   INITIALISATION
========================================================= */

window.addEventListener("DOMContentLoaded", init)

async function init(){

display = document.getElementById("trainingDisplay")

/* badges de progression */

badges = [
document.getElementById("step1"),
document.getElementById("step2"),
document.getElementById("step3"),
document.getElementById("step4"),
document.getElementById("step5"),
document.getElementById("step6"),
document.getElementById("step7"),
document.getElementById("step8")
]

await loadData()

displayText("Prêt.")

}


/* =========================================================
   CHARGEMENT DES JSON
========================================================= */

async function loadData(){

meditationData = await loadJSON("../data/meditation.json")
warmupData = await loadJSON("../data/warmup.json")
kihonData = await loadJSON("../data/kihon.json")
kataData = await loadJSON("../data/kata.json")

}

async function loadJSON(path){

try{

const res = await fetch(path)

if(!res.ok) return []

return await res.json()

}
catch(e){

console.warn("Erreur chargement JSON:",path)

return []

}

}


/* =========================================================
   CONTROLE ENTRAINEMENT
========================================================= */

async function startTraining(){

if(trainingRunning) return

trainingRunning = true
trainingPaused = false

progress = 0
totalSteps = 0

displayText("Début de la séance")

await runStep(0, runMeditation)
await runStep(1, runWarmup)
await runStep(2, runFlow)
await runStep(3, runKihon)
await runStep(4, runMulti)
await runStep(5, runKata)
await runStep(6, runStretch)
await runStep(7, runCooldown)

await speak("Entraînement terminé")

displayText("Séance terminée")

trainingRunning = false

}


/* =========================================================
   GESTION DES ETAPES
========================================================= */

async function runStep(stepIndex, stepFunction){

highlightStep(stepIndex)

await stepFunction()

}


/* =========================================================
   BARRE PROGRESSION
========================================================= */

function highlightStep(index){

badges.forEach(b => b.classList.remove("active"))

if(badges[index])
badges[index].classList.add("active")

}


/* =========================================================
   AFFICHAGE TEXTE
========================================================= */

function displayText(text){

if(display)
display.innerText = text

}


/* =========================================================
   PAUSE
========================================================= */

function pauseTraining(){

trainingPaused = !trainingPaused

if(trainingPaused)
displayText("Pause")

}


/* =========================================================
   STOP
========================================================= */

function stopTraining(){

trainingRunning = false

speechSynthesis.cancel()

displayText("Arrêt")

}


/* =========================================================
   RESET
========================================================= */

function resetTraining(){

stopTraining()

progress = 0

badges.forEach(b => b.classList.remove("active"))

displayText("Prêt.")

}


/* =========================================================
   ATTENTE AVEC PAUSE
========================================================= */

function wait(ms){

return new Promise(resolve => {

let elapsed = 0

let interval = setInterval(()=>{

if(!trainingPaused){

elapsed += 100

}

if(elapsed >= ms){

clearInterval(interval)

resolve()

}

},100)

})

}


/* =========================================================
   SYNTHÈSE VOCALE
========================================================= */

function speak(text){

return new Promise(resolve=>{

if(!text){

resolve()
return

}

displayText(text)

const utter = new SpeechSynthesisUtterance(text)

utter.lang = "fr-FR"

/* mode sensei = plus lent */

utter.rate = senseiMode ? 0.85 : 1

utter.pitch = 1

utter.onend = resolve

speechSynthesis.speak(utter)

})

}


/* =========================================================
   EXECUTION SEGMENTS
========================================================= */

async function runSegments(segments){

for(const seg of segments){

if(!trainingRunning) return

await speak(seg.text)

await wait(seg.pause_after || 1000)

}

}


/* =========================================================
   1 MEDITATION
========================================================= */

async function runMeditation(){

if(meditationData.length === 0) return

const index = document.getElementById("meditationSelect").value

const meditation = meditationData[index]

if(!meditation) return

await speak("Méditation")

await runSegments(meditation.segments)

}


/* =========================================================
   2 ECHAUFFEMENT
========================================================= */

async function runWarmup(){

if(warmupData.length === 0) return

const index = document.getElementById("warmupSelect").value

const warmup = warmupData[index]

await speak("Échauffement")

await runSegments(warmup.segments)

}


/* =========================================================
   3 FLOW
========================================================= */

async function runFlow(){

const duration = parseInt(document.getElementById("flowDuration").value)

await speak("Flow manipulation de canne")

for(let i = duration; i > 0; i--){

await speak(i + " minute")

await wait(60000)

}

}


/* =========================================================
   4 KIHON
========================================================= */

async function runKihon(){

if(kihonData.length === 0) return

await speak("Kihon")

const kihon = randomItem(kihonData)

await runSegments(kihon.segments)

}


/* =========================================================
   5 MULTI DIRECTIONNEL
========================================================= */

async function runMulti(){

const type = document.getElementById("multiType").value

await speak("Multi directionnel")

await speak("Yoi")

await wait(1000)

await speak("Hajime")

for(let i=0;i<5;i++){

await speak(randomTechnique(type))

await wait(2000)

}

await speak("Changement de garde")

await wait(2000)

for(let i=0;i<5;i++){

await speak(randomTechnique(type))

await wait(2000)

}

}


/* =========================================================
   TECHNIQUES ALEATOIRES
========================================================= */

function randomTechnique(type){

const tech = [
"frappe jodan",
"frappe chudan",
"frappe gedan",
"crochetage",
"blocage circulaire"
]

const combo = [
"blocage puis frappe",
"frappe puis balayage",
"crochetage puis projection"
]

const spar = [
"attaque libre",
"contre attaque",
"esquive et frappe"
]

if(type === "tech")
return randomItem(tech)

if(type === "combo")
return randomItem(combo)

return randomItem(spar)

}


/* =========================================================
   6 KATA
========================================================= */

async function runKata(){

if(kataData.length === 0) return

const kataIndex = document.getElementById("kataSelect").value

const repeat = parseInt(document.getElementById("kataRepeat").value)

const guidance = document.getElementById("kataGuidance").value

const kata = kataData[kataIndex-1]

if(!kata) return

await speak(kata.name)

for(let r=0;r<repeat;r++){

for(const part of kata.parts){

await speak(part.name)

if(guidance === "none"){

await wait(4000)

}else{

await runSegments(part.segments)

}

}

}

}


/* =========================================================
   7 ETIREMENTS
========================================================= */

async function runStretch(){

await speak("Étirements")

const stretches = [

"étirement bras droit",
"étirement bras gauche",
"étirement épaules",
"étirement jambes",
"étirement dos"

]

for(const s of stretches){

await speak(s)

await wait(4000)

}

}


/* =========================================================
   8 RETOUR AU CALME
========================================================= */

async function runCooldown(){

await speak("Retour au calme")

await speak("respiration lente")

await wait(5000)

await speak("inspire")

await wait(4000)

await speak("expire")

await wait(4000)

await speak("fin de la séance")

}


/* =========================================================
   UTILITAIRES
========================================================= */

function randomItem(list){

return list[Math.floor(Math.random()*list.length)]

}


/* =========================================================
   MODE SENSEI
========================================================= */

function toggleSensei(){

senseiMode = !senseiMode

if(senseiMode){

speak("Mode Sensei activé")

}else{

speak("Mode Sensei désactivé")

}

}
