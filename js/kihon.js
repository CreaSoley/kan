let techniques=[]
let combos=[]

let currentIndex=0
let tempo=1

const synth=window.speechSynthesis

const compteJap=[
"Ichi",
"Ni",
"San",
"Shi",
"Go",
"Roku",
"Shichi",
"Hachi",
"Ku",
"Ju"
]

/* =======================
LOAD JSON
======================= */

async function loadTechniques(){

const res=await fetch("../data/kihon.json")
techniques=await res.json()

populateSelectors()

showTechnique(0)

}

/* =======================
SELECTORS
======================= */

function populateSelectors(){

const techSelect=document.getElementById("techniqueSelect")

techniques.forEach((t,i)=>{

const opt=document.createElement("option")
opt.value=i
opt.textContent=t.nom

techSelect.appendChild(opt)

})

techSelect.addEventListener("change",e=>{

showTechnique(parseInt(e.target.value))

})

}

/* =======================
DISPLAY CARD
======================= */

function showTechnique(i){

currentIndex=i

const t=techniques[i]

const card=document.getElementById("card")

card.innerHTML=`

<h2>${t.nom}</h2>

<p><strong>Objectif :</strong> ${t.objectif || ""}</p>

<p>${t.description || ""}</p>

${t.video ? `<iframe src="${youtubeEmbed(t.video)}"></iframe>` : ""}

<div class="button-row">

<button class="btn-kawaii start" onclick="playTechnique(${i})">
▶ Entraîner
</button>

</div>

`

}

/* =======================
NAVIGATION
======================= */

function prevTechnique(){

currentIndex--

if(currentIndex<0) currentIndex=techniques.length-1

showTechnique(currentIndex)

}

function nextTechnique(){

currentIndex++

if(currentIndex>=techniques.length) currentIndex=0

showTechnique(currentIndex)

}

/* =======================
RANDOM
======================= */

function randomTechnique(){

const i=Math.floor(Math.random()*techniques.length)

showTechnique(i)

}

function randomCombo(){

const a=randomIndex()
const b=randomIndex()
const c=randomIndex()

playCombo([a,b,c])

}

function randomIndex(){

return Math.floor(Math.random()*techniques.length)

}

/* =======================
PLAY TECHNIQUE
======================= */

async function playTechnique(i){

const t=techniques[i]

await speak(t.nom)

await dojoCount()

}

/* =======================
PLAY COMBO
======================= */

async function playCombo(list){

for(const i of list){

await speak(techniques[i].nom)

await dojoCount()

}

}

/* =======================
DOJO COUNT
======================= */

async function dojoCount(){

for(let i=0;i<10;i++){

await speak(compteJap[i])

await wait(700/tempo)

}

await speak("Mawate")

for(let i=0;i<10;i++){

await speak(compteJap[i])

await wait(700/tempo)

}

}

/* =======================
SENSEI MODE
======================= */

let senseiRunning=false

async function startSensei(){

senseiRunning=!senseiRunning

if(!senseiRunning) return

while(senseiRunning){

const i=randomIndex()

await speak(techniques[i].nom)

await wait(2000)

}

}

/* =======================
VOICE
======================= */

function speak(text){

return new Promise(resolve=>{

synth.cancel()

const utter=new SpeechSynthesisUtterance(text)

utter.lang="fr-FR"

utter.rate=1

utter.onend=resolve

synth.speak(utter)

})

}

/* =======================
UTILS
======================= */

function wait(ms){

return new Promise(r=>setTimeout(r,ms))

}

function youtubeEmbed(url){

if(url.includes("watch?v=")){

const id=url.split("watch?v=")[1]

return "https://www.youtube.com/embed/"+id

}

return url

}

/* =======================
START
======================= */

document.addEventListener("DOMContentLoaded",loadTechniques)
