let running=false
let paused=false
let stopRequested=false

let display=document.getElementById("trainingDisplay")

const compteJap=[
"ichi",
"ni",
"san",
"shi",
"go"
]

function updateDisplay(text){
display.innerText=text
}

function setStep(n){

document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"))

let step=document.getElementById("step"+n)

if(step) step.classList.add("active")

}

function wait(ms){
return new Promise(r=>setTimeout(r,ms))
}

async function speak(text){

updateDisplay(text)

return new Promise(resolve=>{

if(stopRequested) resolve()

const u=new SpeechSynthesisUtterance(text)

u.lang="fr-FR"
u.rate=0.9
u.pitch=1

u.onend=resolve

speechSynthesis.speak(u)

})

}

async function speakPause(text,delay){

await speak(text)

await wait(delay)

}

function pauseTraining(){

speechSynthesis.pause()

paused=true

}

function stopTraining(){

stopRequested=true

speechSynthesis.cancel()

running=false

}

function resetTraining(){

stopTraining()

updateDisplay("Prêt.")

document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"))

}
function senseiMode(){

document.getElementById("flowDuration").value=[3,5,10][Math.floor(Math.random()*3)]

let multi=["tech","combo","sparring"]

document.getElementById("multiType").value=random(multi)

let repeat=[1,2,3]

document.getElementById("kataRepeat").value=random(repeat)

startTraining()

}
function setStep(n){

document.querySelectorAll("#progressBar .badge")
.forEach(b=>b.style.opacity="0.4")

let step=document.getElementById("step"+n)

if(step) step.style.opacity="1"

}
async function startTraining(){

if(running) return

running=true
stopRequested=false

toggleAccordion()

await runMeditation()

await runWarmup()

await runFlow()

await runKihon()

await runMulti()

await runKata()

await runStretch()

await runCooldown()

updateDisplay("Entraînement terminé")

running=false

}

async function loadJSON(path){

let r=await fetch(path)

return await r.json()

}

async function runMeditation(){

const res = await fetch("../data/warmup.json");
const data = await res.json();

/* on prend le premier exercice */
const meditation = data[0];

if(!meditation){
console.error("Aucune méditation trouvée");
return;
}

for(const seg of meditation.segments){

await speak(seg.text);
await wait(seg.pause_after);

}

}

async function runWarmup(){

setStep(2)

let data=await loadJSON("../data/warmup.json")

let select=document.getElementById("warmupSelect")

let session=data[0]

if(select && data.length){
session=data[select.selectedIndex]
}

for(let s of session.segments){

if(stopRequested) return

await speakPause(s.text,s.pause_after)

}

}

function random(arr){
return arr[Math.floor(Math.random()*arr.length)]
}

async function runFlow(){

setStep(3)

let duration=parseInt(document.getElementById("flowDuration").value)

let data=await import("./caneFlowData.js")

let moves=data.caneFlow.moves
let foot=data.caneFlow.footwork
let varr=data.caneFlow.variations

let end=Date.now()+duration*60000

while(Date.now()<end){

await speak(random(moves))
await wait(4000)

await speak(random(foot))
await wait(4000)

await speak(random(varr))
await wait(4000)

}

await speak("ralentis progressivement")

await wait(5000)

}

async function runKihon(){

setStep(4)

let kihon=await loadJSON("../data/kihon.json")

for(let i=0;i<3;i++){

let t=random(kihon)

await speak("Technique "+(i+1))

await speak(t.nom)

await speak("Yoi")

await speak("Kamae")

await speak("Hajime")

for(let c of compteJap){

await speak(c)

await wait(800)

}

await speak("Mawate")

for(let c of compteJap){

await speak(c)

await wait(800)

}

}

}

async function runMulti(){

setStep(5)

let type=document.getElementById("multiType").value

let kihon=await loadJSON("../data/kihon.json")

await speak("Multi directionnel")

await speak(type)

await speak("Kamae")

await speak("Hajime")

for(let i=0;i<5;i++){

if(type==="tech"){

let t=random(kihon)

await speak(t.nom)

}

if(type==="combo"){

let a=random(kihon)

let b=random(kihon)

await speak(a.nom)

await speak(b.nom)

}

if(type==="sparring"){

let t=random(kihon)

await speak(t.nom)

}

await wait(1200)

}

await speak("Yame")

await speak("Yassme")

}

async function runKata(){

setStep(6)

let repeat=parseInt(document.getElementById("kataRepeat").value)

let mode=document.getElementById("kataGuidance").value

let kataSelect=document.getElementById("kataSelect")

if(!kataSelect) return

let kataName=kataSelect.value

for(let i=0;i<repeat;i++){

await speak("Kata "+kataName)

await speak("Hajime")

if(mode==="tts"){

await speak("Exécute le kata")

}

await wait(20000)

await speak("Yame")

}

}

async function runStretch(){

setStep(7)

let data=await loadJSON("../data/etirement.json")

for(let s of data.segments){

if(stopRequested) return

await speakPause(s.text,s.pause_after)

}

}

async function runCooldown(){

setStep(8)

let data=await loadJSON("../data/calme.json")

for(let s of data.segments){

if(stopRequested) return

await speakPause(s.text,s.pause_after)

}

}
