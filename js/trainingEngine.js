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
let kihon = []
let assaut = []

const compteJap = ["ichi","ni","san","shi","go"]

/* données JSON */

let meditationData = []
let warmupData = []
let kihonData = []
let kataData = []

/* DOM */

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
console.log("Training engine prêt")
/* =========================================================
   ALIMENTATION POPULATION KATA
========================================================= */
function populateKataSelect(){

const select = document.getElementById("kataSelect")

select.innerHTML=""

kataData.forEach((k,i)=>{

const opt = document.createElement("option")

opt.value = i

opt.textContent = k.nom

select.appendChild(opt)

})

}
/* =========================================================
   CHARGEMENT DES JSON
========================================================= */

async function loadData(){

meditationData = await loadJSON("../data/meditation.json")
warmupData = await loadJSON("../data/warmup.json")
kihonData = await loadJSON("../data/kihon.json")
kataData = await loadJSON("../data/kata.json")

populateKataSelect()

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
async function loadAllData(){

try{

const kihonRes = await fetch("../data/kihon.json")
kihon = await kihonRes.json()

const assautRes = await fetch("../data/assaut.json")
assaut = await assautRes.json()

}catch(e){
console.log("erreur chargement JSON",e)
}

}

/* =========================================================
   CONTROLE ENTRAINEMENT
========================================================= */

async function startTraining(){

if(trainingRunning) return

trainingRunning = true
trainingPaused = false
await loadAllData()
progress = 0
totalSteps = 0

displayText("Début de la séance")

await runStep(0, runMeditation)
await runStep(1, runWarmup)
await runStep(2, runFlow)
await runStep(3, runKihon)
await runStep(4, multiMode)
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

function display(text){

const zone = document.getElementById("trainingDisplay")

if(!zone) return

zone.innerText = text

}

function displayText(text){

display(text)

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

function speak(text,mode="normal"){

return new Promise(resolve=>{

let utter = new SpeechSynthesisUtterance(text)

utter.lang="fr-FR"

if(mode==="meditation"){

utter.rate = 0.8
utter.pitch = 0.9

}else{

utter.rate = 0.95
utter.pitch = 1

}

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

let index = document.getElementById("meditationSelect").value
let meditation = meditationData[index]
display(meditation.title)
await speak(meditation.title,"meditation")
for(const segment of meditation.segments){
display(segment.text)
await speak(segment.text,"meditation")
await wait(segment.pause_after)

}

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

const moves = [
"cercle extérieur",
"cercle intérieur",
"huit horizontal",
"huit vertical",
"rotation de poignet",
"cercle large"
]

const footwork = [
"pas à droite",
"pas à gauche",
"avance",
"recule",
"pivot"
]

const variations = [
"change de main",
"ralentis",
"accélère légèrement",
"mouvement plus large",
"mouvement plus court"
]

function random(arr){
return arr[Math.floor(Math.random()*arr.length)]
}

let totalTime = duration * 60000
let elapsed = 0

while(elapsed < totalTime){

let text

if(elapsed < totalTime * 0.3){

text = random(moves)

}
else if(elapsed < totalTime * 0.7){

text = random(moves) + " " + random(footwork)

}
else{

text = random(moves) + " " + random(variations)

}

await speak(text)

await wait(5000)

elapsed += 5000

}

await speak("ralentis progressivement")

await wait(6000)

await speak("stop")

}
/* =========================================================
   4 KIHON
========================================================= */

async function runKihon(){

display("Kihon")

await speak("Kihon")

/* 3 techniques */

for(let i=0;i<3;i++){

let t = kihon[Math.floor(Math.random()*kihon.length)]

display(t.nom)

await speak("Technique")

await wait(2000)

await speak(t.nom)

await wait(2000)

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

for(let c of compteJap){

await speak(c)

await wait(1500)

}

await speak("Mawate")

for(let c of compteJap){

await speak(c)

await wait(1500)

}

}

/* 3 combos */

for(let i=0;i<3;i++){

let a = kihon[Math.floor(Math.random()*kihon.length)]
let b = kihon[Math.floor(Math.random()*kihon.length)]

display(a.nom+" + "+b.nom)

await speak("Combo")

await wait(2000)

await speak(a.nom)

await wait(2000)

await speak(b.nom)

await speak("Hajime")

for(let c of compteJap){

await speak(c)

await wait(1500)

}

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* =========================================================
   5 MULTI DIRECTIONNEL
========================================================= */

async function multiMode(){

display("Multi directionnel")

await speak("Multi directionnel")

/* GARDE GAUCHE */

await speak("Garde gauche")

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

for(let i=0;i<5;i++){

let a = assaut[Math.floor(Math.random()*assaut.length)]

display(a.nom)

await speak(a.nom)

await wait(1500)

}

/* GARDE DROITE */

await speak("Garde droite")

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

for(let i=0;i<5;i++){

let a = assaut[Math.floor(Math.random()*assaut.length)]

display(a.nom)

await speak(a.nom)

await wait(1500)

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* =========================================================
   6 KATA
========================================================= */

async function runKata(){

if(kataData.length === 0) return

const kataIndex = document.getElementById("kataSelect").value

const repeat = parseInt(document.getElementById("kataRepeat").value)

const guidance = document.getElementById("kataGuidance").value

const kata = kataData[kataIndex]

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
