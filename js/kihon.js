let kihon=[]
let assauts=[]

let synth=window.speechSynthesis

let running=false
let paused=false

const compteJap=[
"Ichi","Ni","San","Shi","Go",
"Roku","Shichi","Hachi","Ku","Ju"
]

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

running=true
paused=false

const mode=document.getElementById("modeSelect").value

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

await speak("Kamae")
await speak("Hajime")

await dojoCount()

await speak("Mawate")

await dojoCount()

await speak("Yame")

await wait(2000)

await speak("Yassme")

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

await speak("Kamae")
await speak("Hajime")

let sequence=generateSmartSparring(n)

for(let a of sequence){

await speak(a.categorie + " : " + a.nom)

await wait(3000)

}

await speak("Yame")

}


/* SENSEI */

async function senseiMode(){

let n=document.getElementById("sparringCount").value

for(let i=0;i<n;i++){

let t=kihon[Math.floor(Math.random()*kihon.length)]

await speak(t.nom)

await wait(2000)

}

}
async function multiSequence(type,speed){

if(type==="tech"){

let i=document.getElementById("techniqueSelect").value
let t=kihon[i]

await speak(t.nom)

for(let k=0;k<5;k++){

await speak(compteJap[k])

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

await wait(speed)

}

}

if(type==="sparring"){

let sequence=generateSmartSparring(5)

for(let a of sequence){

await speak(a.categorie + " : " + a.nom)

await wait(speed)

}

}

}

/* MULTI */

async function multiMode(){

let type=document.getElementById("multiType").value
let speed=parseInt(document.getElementById("speedSelect").value)

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


/* COMPTE */

async function dojoCount(){

let max=document.getElementById("countSelect").value
let speed=parseInt(document.getElementById("speedSelect").value)

for(let i=0;i<max;i++){

await speak(compteJap[i])

await wait(speed)

}

}


/* VOICE */

function speak(text){

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
