/* ================================
   VARIABLES
================================ */

let kihon=[]
let assauts=[]

let synth=window.speechSynthesis

let running=false
let paused=false

const beep=new Audio("../sound/beep.mp3")

const compteJap=[
"Ichi","Ni","San","Shi","Go",
"Roku","Shichi","Hachi","Ku","Ju"
]

const modeDescriptions={
solo:"Réalisation de techniques simples. Possibilité de choix dans le menu ou aléatoire. En mode aléatoire, choix du nombre de techniques.",
combo:"Réalisation de duo de techniques. Possibilité de choix dans le menu ou aléatoire. En mode aléatoire, choix du nombre de combo.",
sparring:"Répondre à l’assaut annoncé par une technique de défense à la canne.",
sensei:"Réaliser les techniques annoncées par le sensei.",
multi:"Choisir le paramétrage (technique, combo ou sparring), à chaque annonce réaliser l’exercice dans une direction différente."
}

/* ================================
   INIT
================================ */

async function init(){

const res=await fetch("../data/kihon.json")
kihon=await res.json()

const res2=await fetch("../data/assauts.json")
assauts=await res2.json()

populateSelectors()

showTechnique(0)

initUI()

}

document.addEventListener("DOMContentLoaded",init)

/* ================================
   UI INIT
================================ */

function initUI(){

let modeSelect=document.getElementById("modeSelect")

if(modeSelect){

modeSelect.addEventListener("change",()=>{

updateUI()
updateSelectors()
updateModeInfo()

})

}

let randomMode=document.getElementById("randomMode")

if(randomMode){
randomMode.addEventListener("change",updateSelectors)
}

}

/* ================================
   SELECTORS
================================ */

function populateSelectors(){

const s1=document.getElementById("techniqueSelect")
const s2=document.getElementById("techniqueSelect2")

if(!s1 || !s2) return

kihon.forEach((t,i)=>{

let opt=document.createElement("option")
opt.value=i
opt.textContent=t.nom

s1.appendChild(opt)
s2.appendChild(opt.cloneNode(true))

})

}

/* ================================
   CARD
================================ */

function showTechnique(i){

const t=kihon[i]

if(!t) return

let video=t.video
? `<iframe src="${t.video}"></iframe>`
: `<img src="../images/sansvideo.png" style="width:100%;border-radius:12px;">`

let card=document.getElementById("card")

if(!card) return

card.innerHTML=`

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

/* ================================
   UI LOGIC
================================ */

function updateSelectors(){

let mode=document.getElementById("modeSelect")?.value

let random=document.getElementById("randomMode")?.checked || false

let isMulti=mode==="multi"
let isSensei=mode==="sensei"

toggle("randomCount",!(random&&(mode==="solo"||mode==="combo")))
toggle("countSelect",isMulti||isSensei)
toggle("sparringCount",isMulti)

toggle("techniqueSelect",isMulti||isSensei)
toggle("techniqueSelect2",isMulti||isSensei)

toggle("surpriseBtn",isMulti)

}

function toggle(id,hide){

let el=document.getElementById(id)

if(el) el.classList.toggle("hidden",hide)

}

function updateUI(){

let mode=document.getElementById("modeSelect")?.value

let multi=document.getElementById("multiType")

if(multi) multi.classList.toggle("hidden",mode!=="multi")

}

function updateModeInfo(){

let mode=document.getElementById("modeSelect")?.value
let box=document.getElementById("modeInfo")

if(box){
box.innerText=modeDescriptions[mode]||""
}

}

/* ================================
   RANDOM
================================ */

function randomTechnique(){

let i=Math.floor(Math.random()*kihon.length)

let select=document.getElementById("techniqueSelect")

if(select) select.value=i

showTechnique(i)

}

function randomCombo(){

let a=Math.floor(Math.random()*kihon.length)
let b=Math.floor(Math.random()*kihon.length)

let s1=document.getElementById("techniqueSelect")
let s2=document.getElementById("techniqueSelect2")

if(s1) s1.value=a
if(s2) s2.value=b

showTechnique(a)

}

/* ================================
   CONTROLS
================================ */

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

/* ================================
   START
================================ */

async function startTraining(){

let mode=document.getElementById("modeSelect")?.value

await speak("Mode "+mode)

running=true
paused=false

if(mode==="solo") soloMode()
if(mode==="combo") comboMode()
if(mode==="sparring") sparringMode()
if(mode==="sensei") senseiMode()
if(mode==="multi") multiMode()

}

/* ================================
   SOLO
================================ */

async function soloMode(){

let count=parseInt(document.getElementById("randomCount")?.value||1)

let list=[]

for(let i=0;i<count;i++){

let r=Math.floor(Math.random()*kihon.length)
list.push(kihon[r])

}

for(let t of list){

await speak(t.nom)

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

/* ================================
   COMBO
================================ */

async function comboMode(){

let i=document.getElementById("techniqueSelect")?.value
let j=document.getElementById("techniqueSelect2")?.value

if(!kihon[i]||!kihon[j]) return

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

/* ================================
   SPARRING INTELLIGENT
================================ */

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

async function sparringMode(){

let n=parseInt(document.getElementById("sparringCount")?.value||5)
let interval=parseInt(document.getElementById("sparringInterval")?.value||4000)

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

/* ================================
   SENSEI
================================ */

async function senseiMode(){

await speak("Yoi")
await speak("Kamae")
await speak("Hajime")

let n=parseInt(document.getElementById("sparringCount")?.value||5)

for(let i=0;i<n;i++){

let t=kihon[Math.floor(Math.random()*kihon.length)]

await speak(t.nom)

await wait(3000)

}

await speak("Yame")

await wait(2000)

await speak("Yassme")

}

/* ================================
   MULTI
================================ */

async function multiMode(){

let type=document.getElementById("multiType")?.value
let speed=parseInt(document.getElementById("speedSelect")?.value||800)

await speak("Multi directionnel")

if(type==="tech") await speak("Technique")
if(type==="combo") await speak("Combo")
if(type==="sparring") await speak("Sparring")

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

/* ================================
   COUNT
================================ */

async function dojoCount(){

let max=parseInt(document.getElementById("countSelect")?.value||5)
let speed=parseInt(document.getElementById("speedSelect")?.value||800)

for(let i=0;i<max;i++){

await speak(compteJap[i])

await wait(speed)

}

}

/* ================================
   VOICE
================================ */

function speak(text){

let display=document.getElementById("trainingDisplay")

if(display){
display.innerText=text
}

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
