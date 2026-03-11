/* =========================================================
TaïKan Training Engine PRO
version stable PWA
========================================================= */

/* =========================================================
GLOBAL STATE
========================================================= */

let trainingRunning=false
let trainingPaused=false
let senseiMode=false

let displayZone

let meditationData=[]
let warmupData=[]
let kihonData=[]
let kataData=[]
let assautData=[]

let badges=[]

const compteJap=["ichi","ni","san","shi","go"]

/* =========================================================
INIT
========================================================= */

window.addEventListener("DOMContentLoaded",init)

async function init(){

displayZone=document.getElementById("trainingDisplay")

badges=[
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

populateKataSelect()

displayText("Prêt.")

console.log("Training engine prêt")

}

/* =========================================================
DISPLAY
========================================================= */

function displayText(text){

if(!displayZone) return

displayZone.innerText=text

}

/* =========================================================
JSON LOADING
========================================================= */

async function loadJSON(path){

try{

const res=await fetch(path)

if(!res.ok){
console.warn("JSON introuvable:",path)
return []
}

return await res.json()

}catch(e){

console.warn("Erreur JSON:",path)
return []

}

}

async function loadData(){

meditationData=await loadJSON("../data/meditation.json")
warmupData=await loadJSON("../data/warmup.json")
kihonData=await loadJSON("../data/kihon.json")
kataData=await loadJSON("../data/kata.json")
assautData=await loadJSON("../data/assaut.json")

}

/* =========================================================
POPULATE KATA SELECT
========================================================= */

function populateKataSelect(){

const select=document.getElementById("kataSelect")

if(!select) return

select.innerHTML=""

kataData.forEach((k,i)=>{

const opt=document.createElement("option")

opt.value=i
opt.textContent=k.nom || k.name || ("Kata "+(i+1))

select.appendChild(opt)

})

}

/* =========================================================
VOICE ENGINE
========================================================= */

function speak(text,mode="normal"){

return new Promise(resolve=>{

if(!text){resolve();return}

displayText(text)

const utter=new SpeechSynthesisUtterance(text)

utter.lang="fr-FR"

if(mode==="meditation"){

utter.rate=0.8
utter.pitch=0.9

}else{

utter.rate=senseiMode?0.85:1
utter.pitch=1

}

utter.onend=resolve

speechSynthesis.speak(utter)

})

}

/* =========================================================
WAIT ENGINE
========================================================= */

function wait(ms){

return new Promise(resolve=>{

let elapsed=0

let interval=setInterval(()=>{

if(!trainingPaused){
elapsed+=100
}

if(elapsed>=ms){

clearInterval(interval)
resolve()

}

},100)

})

}

/* =========================================================
SEGMENT EXECUTION
========================================================= */

async function runSegments(segments){

for(const seg of segments){

if(!trainingRunning) return

await speak(seg.text)

await wait(seg.pause_after || 1500)

}

}

/* =========================================================
PROGRESS BAR
========================================================= */

function highlightStep(i){

badges.forEach(b=>b.classList.remove("active"))

if(badges[i])
badges[i].classList.add("active")

}

/* =========================================================
CONTROL
========================================================= */

async function startTraining(){

if(trainingRunning) return

trainingRunning=true
trainingPaused=false

displayText("Début de la séance")

await runStep(0,runMeditation)
await runStep(1,runWarmup)
await runStep(2,runFlow)
await runStep(3,runKihon)
await runStep(4,runMulti)
await runStep(5,runKata)
await runStep(6,runStretch)
await runStep(7,runCooldown)

await speak("Entraînement terminé")

displayText("Séance terminée")

trainingRunning=false

}

async function runStep(index,fn){

highlightStep(index)

await fn()

}

function pauseTraining(){

trainingPaused=!trainingPaused

displayText(trainingPaused?"Pause":"Reprise")

}

function stopTraining(){

trainingRunning=false

speechSynthesis.cancel()

displayText("Arrêt")

}

function resetTraining(){

stopTraining()

badges.forEach(b=>b.classList.remove("active"))

displayText("Prêt.")

}

/* =========================================================
MEDITATION
========================================================= */

async function runMeditation(){

if(meditationData.length===0) return

let index=document.getElementById("meditationSelect").value

let meditation=meditationData[index]

await speak(meditation.title,"meditation")

for(const segment of meditation.segments){

await speak(segment.text,"meditation")

await wait(segment.pause_after)

}

}

/* =========================================================
WARMUP
========================================================= */

async function runWarmup(){

if(warmupData.length===0) return

const index=document.getElementById("warmupSelect").value

const warmup=warmupData[index]

await speak("Échauffement")

await runSegments(warmup.segments)

}

/* =========================================================
FLOW INFINI
========================================================= */

async function runFlow(){

let duration=parseInt(document.getElementById("flowDuration").value)

await speak("Flow manipulation de canne")

const moves=[
"cercle extérieur",
"cercle intérieur",
"huit horizontal",
"huit vertical",
"rotation de poignet",
"cercle large"
]

const footwork=[
"pas à droite",
"pas à gauche",
"avance",
"recule",
"pivot"
]

const variations=[
"change de main",
"ralentis",
"accélère légèrement",
"mouvement plus large",
"mouvement plus court"
]

function rand(a){return a[Math.floor(Math.random()*a.length)]}

let total=duration*60000
let elapsed=0

while(elapsed<total){

let text

if(elapsed<total*0.3)
text=rand(moves)

else if(elapsed<total*0.7)
text=rand(moves)+" "+rand(footwork)

else
text=rand(moves)+" "+rand(variations)

await speak(text)

await wait(5000)

elapsed+=5000

}

await speak("ralentis progressivement")

await wait(5000)

await speak("stop")

}

/* =========================================================
KIHON
========================================================= */

async function runKihon(){

await speak("Kihon")

for(let i=0;i<3;i++){

let t=randomItem(kihonData)

await speak("Technique")

await speak(t.nom)

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

for(const c of compteJap){

await speak(c)

await wait(1500)

}

await speak("Mawate")

for(const c of compteJap){

await speak(c)

await wait(1500)

}

}

/* combos */

for(let i=0;i<3;i++){

let a=randomItem(kihonData)
let b=randomItem(kihonData)

await speak("Combo")

await speak(a.nom)

await speak(b.nom)

await speak("Hajime")

for(const c of compteJap){

await speak(c)

await wait(1500)

}

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* =========================================================
MULTI SPARRING
========================================================= */

async function runMulti(){

await speak("Multi directionnel")

await speak("Garde gauche")

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

for(let i=0;i<5;i++){

let a=randomItem(assautData)

await speak(a.nom)

await wait(1500)

}

await speak("Garde droite")

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

for(let i=0;i<5;i++){

let a=randomItem(assautData)

await speak(a.nom)

await wait(1500)

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* =========================================================
KATA
========================================================= */

async function runKata(){

if(kataData.length===0) return

const index=document.getElementById("kataSelect").value

const repeat=parseInt(document.getElementById("kataRepeat").value)

const guidance=document.getElementById("kataGuidance").value

const kata=kataData[index]

await speak(kata.nom || kata.name)

for(let r=0;r<repeat;r++){

for(const part of kata.parts){

await speak(part.name)

if(guidance==="none"){

await wait(4000)

}else{

await runSegments(part.segments)

}

}

}

}

/* =========================================================
STRETCH
========================================================= */

async function runStretch(){

await speak("Étirements")

const stretches=[
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
COOLDOWN
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
UTILS
========================================================= */

function randomItem(list){

return list[Math.floor(Math.random()*list.length)]

}

/* =========================================================
SENSEI MODE
========================================================= */

function toggleSensei(){

senseiMode=!senseiMode

speak(senseiMode?"Mode Sensei activé":"Mode Sensei désactivé")

}
