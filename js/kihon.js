/* ============================
   VARIABLES
============================ */

let kihon=[]
let assauts=[]

const synth=window.speechSynthesis
const beep=new Audio("../sound/beep.mp3")

let running=false
let paused=false

const compteJap=[
"Ichi","Ni","San","Shi","Go",
"Roku","Shichi","Hachi","Ku","Ju"
]

const modeDescriptions={

solo:"Réalisation de techniques simples. Possibilité de choix dans le menu ou aléatoire.",

combo:"Réalisation de duo de techniques.",

sparring:"Répondre à l’assaut annoncé.",

sensei:"Réaliser les techniques annoncées.",

multi:"Réaliser l’exercice dans plusieurs directions."

}

/* ============================
   INIT
============================ */

document.addEventListener("DOMContentLoaded",init)

async function init(){

await loadData()

populateSelectors()

initUI()

showTechnique(0)

}

/* ============================
   LOAD JSON
============================ */

async function loadData(){

const res=await fetch("../data/kihon.json")
kihon=await res.json()

const res2=await fetch("../data/assauts.json")
assauts=await res2.json()

}

/* ============================
   UI
============================ */

function initUI(){

let mode=document.getElementById("modeSelect")

mode.addEventListener("change",()=>{

updateUI()
updateModeInfo()

})

document.getElementById("surpriseBtn").onclick=randomAction

document
.getElementById("techniqueSelect")
.addEventListener("change",e=>showTechnique(e.target.value))

}

/* ============================
   SELECTORS
============================ */

function populateSelectors(){

let s1=document.getElementById("techniqueSelect")
let s2=document.getElementById("techniqueSelect2")

kihon.forEach((t,i)=>{

let o=document.createElement("option")

o.value=i
o.textContent=t.nom

s1.appendChild(o)

s2.appendChild(o.cloneNode(true))

})

}

/* ============================
   CARD
============================ */

function showTechnique(i){

let t=kihon[i]

if(!t) return

let video=t.video
? `<iframe src="${t.video}"></iframe>`
: `<img src="../images/sansvideo.png" style="width:100%">`

document.getElementById("card").innerHTML=`

<h2>${t.nom}</h2>

<div class="badges">
<span class="badge">${t.categorie}</span>
<span class="badge">${t.zone}</span>
<span class="badge">${t.angle}</span>
</div>

${video}

<p><strong>Objectif :</strong> ${t.objectif}</p>

<details>
<summary>Description</summary>
<p>${t.description}</p>
</details>

`

}

/* ============================
   MODE UI
============================ */

function updateUI(){

let mode=document.getElementById("modeSelect").value

let multi=document.getElementById("multiType")

multi.classList.toggle("hidden",mode!=="multi")

}

/* ============================
   MODE INFO
============================ */

function updateModeInfo(){

let mode=document.getElementById("modeSelect").value

document.getElementById("modeInfo").innerText=
modeDescriptions[mode] || ""

}

/* ============================
   RANDOM
============================ */

function randomAction(){

let mode=document.getElementById("modeSelect").value

if(mode==="combo") randomCombo()
else randomTechnique()

}

function randomTechnique(){

let i=Math.floor(Math.random()*kihon.length)

document.getElementById("techniqueSelect").value=i

showTechnique(i)

}

function randomCombo(){

let a=Math.floor(Math.random()*kihon.length)
let b=Math.floor(Math.random()*kihon.length)

document.getElementById("techniqueSelect").value=a
document.getElementById("techniqueSelect2").value=b

showTechnique(a)

}

/* ============================
   CONTROLES
============================ */

function pauseTraining(){

paused=true
synth.pause()

}

function stopTraining(){

running=false
synth.cancel()

}

function resetTraining(){

stopTraining()

}

/* ============================
   START
============================ */

async function startTraining(){

let mode=document.getElementById("modeSelect").value

await speak("Mode "+mode)

running=true

if(mode==="solo") soloMode()
if(mode==="combo") comboMode()
if(mode==="sparring") sparringMode()
if(mode==="sensei") senseiMode()
if(mode==="multi") multiMode()

}

/* ============================
   SOLO
============================ */

async function soloMode(){

let i=document.getElementById("techniqueSelect").value

let t=kihon[i]

await speak(t.nom)

await speak("Yoi")
await speak("Hajime")

await dojoCount()

await speak("Mawate")

await dojoCount()

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* ============================
   COMBO
============================ */

async function comboMode(){

let a=kihon[document.getElementById("techniqueSelect").value]
let b=kihon[document.getElementById("techniqueSelect2").value]

await speak(a.nom)
await speak(b.nom)

await speak("Kamae")
await speak("Hajime")

await dojoCount()

await speak("Mawate")

await dojoCount()

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* ============================
   SPARRING
============================ */

function generateSmartSparring(n){

let result=[]
let lastCat=null

while(result.length<n){

let a=assauts[Math.floor(Math.random()*assauts.length)]

if(a.categorie===lastCat) continue

result.push(a)

lastCat=a.categorie

}

return result

}

async function sparringMode(){

let n=document.getElementById("sparringCount").value
let interval=document.getElementById("sparringInterval").value

await speak("Kamae")
await speak("Hajime")

let seq=generateSmartSparring(n)

for(let a of seq){

await speak(a.nom)

beep.currentTime=0
beep.play()

await wait(interval)

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* ============================
   SENSEI
============================ */

async function senseiMode(){

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

let n=document.getElementById("sparringCount").value

for(let i=0;i<n;i++){

let t=kihon[Math.floor(Math.random()*kihon.length)]

await speak(t.nom)

await wait(3000)

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* ============================
   MULTI
============================ */

async function multiMode(){

let type=document.getElementById("multiType").value
let speed=document.getElementById("speedSelect").value

await speak("Multi directionnel")

await speak(type)

await speak("Kamae")
await speak("Hajime")

await multiSequence(type,speed)

await speak("Yoi")

await speak("Kamae")
await speak("Hajime")

await multiSequence(type,speed)

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

async function multiSequence(type,speed){

if(type==="tech"){

let t=kihon[Math.floor(Math.random()*kihon.length)]

await speak(t.nom)

for(let i=0;i<5;i++){

await speak(compteJap[i])

await wait(speed)

}

}

if(type==="combo"){

let a=kihon[Math.floor(Math.random()*kihon.length)]
let b=kihon[Math.floor(Math.random()*kihon.length)]

await speak(a.nom)
await speak(b.nom)

for(let i=0;i<5;i++){

await speak(compteJap[i])

await wait(speed)

}

}

if(type==="sparring"){

let seq=generateSmartSparring(5)

for(let a of seq){

await speak(a.nom)

await wait(speed)

}

}

}

/* ============================
   COUNT
============================ */

async function dojoCount(){

let max=document.getElementById("countSelect").value
let speed=document.getElementById("speedSelect").value

for(let i=0;i<max;i++){

await speak(compteJap[i])

await wait(speed)

}

}

/* ============================
   VOICE
============================ */

function speak(text){

let display=document.getElementById("trainingDisplay")

if(display) display.innerText=text

return new Promise(resolve=>{

let u=new SpeechSynthesisUtterance(text)

u.lang="fr-FR"

u.onend=resolve

synth.speak(u)

})

}

function wait(ms){

return new Promise(r=>setTimeout(r,ms))

}
