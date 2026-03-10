let kihon=[]
let assauts=[]

let synth=window.speechSynthesis

let running=false
let paused=false

const compteJap=[
"Ichi","Ni","San","Shi","Go",
"Roku","Shichi","Hachi","Ku","Ju"
]
const beep = new Audio("../sound/beep.mp3")

const modeDescriptions={

solo:"Réalisation de techniques simples. Possibilité de choix dans le menu ou aléatoire. En mode aléatoire, choix du nombre de techniques.",

combo:"Réalisation de duo de techniques. Possibilité de choix dans le menu ou aléatoire. En mode aléatoire, choix du nombre de combo.",

sparring:"Répondre à l’assaut annoncé par une technique de défense à la canne.",

sensei:"Réaliser les techniques annoncées par le sensei.",

multi:"Choisir le paramétrage (technique, combo ou sparring), à chaque annonce, réaliser l’exercice dans une direction différente."

}
/* LOAD JSON */

async function init(){

const res=await fetch("../data/kihon.json")
kihon=await res.json()

const res2=await fetch("../data/assauts.json")
assauts=await res2.json()

populateSelectors()

showTechnique(0)

}

document.addEventListener("DOMContentLoaded",init)
document
.getElementById("modeSelect")
.addEventListener("change",updateUI)

/* SELECTEURS */

function populateSelectors(){

const s1=document.getElementById("techniqueSelect")
const s2=document.getElementById("techniqueSelect2")

kihon.forEach((t,i)=>{

let opt=document.createElement("option")
opt.value=i
opt.textContent=t.nom

s1.appendChild(opt)
s2.appendChild(opt.cloneNode(true))

})

}


/* CARD */

function showTechnique(i){

const t=kihon[i]

let video=t.video
? `<iframe src="${t.video}"></iframe>`
: `<img src="../images/sansvideo.png" style="width:100%;border-radius:12px;">`

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
/* CHOIX NOMBRE TECHNIQUES */
function updateSelectors(){

let mode=document.getElementById("modeSelect").value
let random=document.getElementById("randomMode").checked

// nombre de techniques / combos
document.getElementById("randomCount").classList.toggle(
"hidden",
!(random && (mode==="solo" || mode==="combo"))
)
let isMulti = mode==="multi"

document.getElementById("countSelect").classList.toggle("hidden",isMulti)
document.getElementById("sparringCount").classList.toggle("hidden",isMulti)

document.getElementById("techniqueSelect").classList.toggle("hidden",isMulti)
document.getElementById("techniqueSelect2").classList.toggle("hidden",isMulti)

document.getElementById("surpriseBtn").classList.toggle("hidden",isMulti)

let isSensei = mode==="sensei"

document.getElementById("countSelect").classList.toggle("hidden",isSensei)
document.getElementById("techniqueSelect").classList.toggle("hidden",isSensei)
document.getElementById("techniqueSelect2").classList.toggle("hidden",isSensei)
}
/* SURPRISE */

function randomTechnique(){

let i=Math.floor(Math.random()*kihon.length)

function randomCombo(){

let a=Math.floor(Math.random()*kihon.length)
let b=Math.floor(Math.random()*kihon.length)

document.getElementById("techniqueSelect").value=a
document.getElementById("techniqueSelect2").value=b

showTechnique(a)

}

}


/* CONTROLES */

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


/* TRAINING */

async function startTraining(){

let mode=document.getElementById("modeSelect").value

await speak("Mode " + mode)

running=true
paused=false

if(mode==="solo") soloMode()
if(mode==="combo") comboMode()
if(mode==="sparring") sparringMode()
if(mode==="sensei") senseiMode()
if(mode==="multi") multiMode()

}


/* SOLO */

async function soloMode(){

let randomCount=parseInt(document.getElementById("randomCount").value)

let list=[]

for(let i=0;i<randomCount;i++){

let r=Math.floor(Math.random()*kihon.length)
list.push(kihon[r])

}

for(let t of list){

await speak(t.nom)
await speak(t.objectif)
await speak(t.description)

await speak("Yoi")
await speak("Hajime")

await dojoCount()

await speak("Mawate")

await dojoCount()

}

await speak("Yame")
await wait(2000)
await speak("Yassme")

}


/* COMBO */

async function comboMode(){

const i=document.getElementById("techniqueSelect").value
const j=document.getElementById("techniqueSelect2").value

await speak(kihon[i].nom)
await speak(kihon[j].nom)

await speak("Kamaé")
await speak("Hajimé")

await dojoCount()

await speak("Mawaté")

await dojoCount()

await speak("Yamé")

await wait(2000)

await speak("Yassmé")

}
function randomAssaut(){

return assauts[Math.floor(Math.random()*assauts.length)]

}
function generateSmartSparring(n){

let result=[]
let lastCat=null
let lastId=null

while(result.length<n){

let a=assauts[Math.floor(Math.random()*assauts.length)]

if(a.id===lastId) continue
if(a.categorie===lastCat) continue

result.push(a)

lastCat=a.categorie
lastId=a.id

}

return result

}
/* SPARRING */

async function sparringMode(){

let n=document.getElementById("sparringCount").value
let interval=parseInt(document.getElementById("sparringInterval").value)


await speak("Kamae")
await speak("Hajime")

let sequence=generateSmartSparring(n)

for(let a of sequence){

await speak(a.nom)

beep.play()

await wait(interval)

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}


/* SENSEI */

async function senseiMode(){

await speak("Yoi")
await speak("Kamaé")
await speak("Hajimé")

let n=document.getElementById("sparringCount").value

for(let i=0;i<n;i++){

let t=kihon[Math.floor(Math.random()*kihon.length)]

await speak(t.nom)

await wait(4000)

}

await speak("Yamé")

await wait(2000)

await speak("Yassmé")

}
async function multiSequence(type,speed){

if(type==="tech"){

let i=document.getElementById("techniqueSelect").value
let t=kihon[i]

await speak(t.nom)

for(let k=0;k<5;k++){

await speak(compteJap[k])

let speed=parseInt(document.getElementById("speedSelect").value)
await wait(speed)

}

}

if(type==="combo"){

let i=document.getElementById("techniqueSelect").value
let j=document.getElementById("techniqueSelect2").value

await speak(kihon[i].nom)
await speak(kihon[j].nom)

for(let k=0;k<5;k++){

await speak(compteJap[k])

let speed=parseInt(document.getElementById("speedSelect").value)
await wait(speed)

}

}

if(type==="sparring"){

let sequence=generateSmartSparring(5)

for(let a of sequence){

await speak(a.nom)

let speed=parseInt(document.getElementById("speedSelect").value)
await wait(speed)

}

}

}

/* MULTI */

async function multiMode(){

let type=document.getElementById("multiType").value
let speed=parseInt(document.getElementById("speedSelect").value)
let type=document.getElementById("multiType").value

await speak("Multi directionnel")

if(type==="tech") await speak("Technique")
if(type==="combo") await speak("Combo")
if(type==="sparring") await speak("Sparring")
await speak("Kamaé")
await speak("Hajimé")

await multiSequence(type,speed)

await speak("Yoi")

await speak("Kamaé")
await speak("Hajimé")

await multiSequence(type,speed)

await speak("Yamé")

await wait(2000)

await speak("Yassmé")

}


/* COMPTE */

async function dojoCount(){

let max=document.getElementById("countSelect").value
let speed=parseInt(document.getElementById("speedSelect").value)

for(let i=0;i<max;i++){

await speak(compteJap[i])

await wait(speed)

}

}

function updateUI(){

let mode=document.getElementById("modeSelect").value

document.getElementById("multiType").classList.toggle(
"hidden",
mode!=="multi"
)

}
function updateModeInfo(){

let mode=document.getElementById("modeSelect").value

document.getElementById("modeInfo").innerText=
modeDescriptions[mode] || ""

}
document
.getElementById("modeSelect")
.addEventListener("change",()=>{

updateSelectors()
updateModeInfo()

})
/* VOICE */

function speak(text){

document.getElementById("trainingDisplay").innerText=text

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
document.getElementById("modeSelect").addEventListener("change",updateSelectors)
document.getElementById("randomMode").addEventListener("change",updateSelectors)
