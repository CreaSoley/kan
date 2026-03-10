/* ================================
   TaïKan Training Engine
   stable version
================================ */

let trainingRunning = false
let trainingPaused = false
let senseiMode = false

let progress = 0
let totalSteps = 0

let warmupData = []
let meditationData = []
let kataData = []
let kihonData = []

let progressBar

/* ================================
   INIT
================================ */

window.addEventListener("DOMContentLoaded", init)

async function init(){

progressBar = document.getElementById("progressBar")

await loadData()

}

/* ================================
   DATA LOADING
================================ */

async function loadData(){

warmupData = await loadJSON("../data/warmup.json")
meditationData = await loadJSON("../data/meditation.json")
kataData = await loadJSON("../data/kata.json")
kihonData = await loadJSON("../data/kihon.json")

}

async function loadJSON(path){

try{

const res = await fetch(path)

if(!res.ok) return []

return await res.json()

}
catch(e){

console.warn("JSON non chargé:",path)
return []

}

}

/* ================================
   START TRAINING
================================ */

async function startTraining(){

if(trainingRunning) return

trainingRunning = true
trainingPaused = false
progress = 0

updateProgress()

await runMeditation()
await runWarmup()
await runKata()
await runKihon()

speak("Entraînement terminé")

trainingRunning = false

}

/* ================================
   PAUSE
================================ */

function pauseTraining(){

trainingPaused = !trainingPaused

}

/* ================================
   WAIT
================================ */

function wait(ms){

return new Promise(resolve=>{

let interval = setInterval(()=>{

if(!trainingPaused){

clearInterval(interval)
setTimeout(resolve,ms)

}

},100)

})

}

/* ================================
   SPEECH
================================ */

function speak(text){

return new Promise(resolve=>{

if(!text){

resolve()
return

}

const utter = new SpeechSynthesisUtterance(text)

utter.lang = "fr-FR"
utter.rate = senseiMode ? 0.9 : 1
utter.pitch = 1

utter.onend = resolve

speechSynthesis.speak(utter)

})

}

/* ================================
   PROGRESS
================================ */

function updateProgress(){

if(!progressBar) return

const percent = Math.floor((progress/totalSteps)*100)

progressBar.style.width = percent+"%"

}

/* ================================
   SEGMENT RUNNER
================================ */

async function runSegments(segments){

if(!segments) return

for(const seg of segments){

if(!trainingRunning) return

await speak(seg.text)

await wait(seg.pause_after || 1000)

progress++

updateProgress()

}

}

/* ================================
   MEDITATION
================================ */

async function runMeditation(){

if(meditationData.length === 0) return

const meditation = meditationData[0]

if(!meditation || !meditation.segments) return

totalSteps += meditation.segments.length

await runSegments(meditation.segments)

}

/* ================================
   WARMUP
================================ */

async function runWarmup(){

if(warmupData.length === 0) return

const warmup = warmupData[0]

if(!warmup || !warmup.segments) return

totalSteps += warmup.segments.length

await runSegments(warmup.segments)

}

/* ================================
   KATA
================================ */

async function runKata(){

if(kataData.length === 0) return

const kata = kataData[0]

if(!kata || !kata.segments) return

await speak(kata.name)

totalSteps += kata.segments.length

await runSegments(kata.segments)

}

/* ================================
   KIHON
================================ */

async function runKihon(){

if(kihonData.length === 0) return

const kihon = kihonData[0]

if(!kihon || !kihon.segments) return

await speak("Kihon")

totalSteps += kihon.segments.length

await runSegments(kihon.segments)

}

/* ================================
   MODE SENSEI
================================ */

function toggleSensei(){

senseiMode = !senseiMode

if(senseiMode){

speak("Mode Sensei activé")

}else{

speak("Mode Sensei désactivé")

}

}

/* ================================
   STOP
================================ */

function stopTraining(){

trainingRunning = false
speechSynthesis.cancel()

progress = 0
updateProgress()

}

/* ================================
   RANDOM TECHNIQUE
================================ */

function randomTechnique(list){

if(!list || list.length === 0) return null

const index = Math.floor(Math.random()*list.length)

return list[index]

}
