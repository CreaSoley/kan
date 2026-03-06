/* ================================
KIHON TRAINER - CANNE DE MARCHE
================================ */

let techniques = [];
let running = false;
let timer = null;
let tempo = 3000;

let selectedTechniques = [];
let favs = JSON.parse(localStorage.getItem("kihonFavs") || "[]");

/* ================================
ZONES D'IMPACT
================================ */

const zones = {
mh:"haut du manche",
mm:"milieu du manche",
mb:"bas du manche",
cro:"crosse",
pt:"pointe",
ptcro:"extrémité de la crosse",
none:"non concerné"
};

/* ================================
COMPTAGE DOJO
================================ */

const countJP = [
"ichi","ni","san","shi","go",
"roku","shichi","hachi","kyu","ju"
];

/* ================================
VOIX
================================ */

function speak(text){

if(!window.speechSynthesis) return;

let utter = new SpeechSynthesisUtterance(text);

utter.lang="fr-FR";
utter.rate=0.9;
utter.pitch=1;

speechSynthesis.speak(utter);

}

/* ================================
CHARGEMENT JSON
================================ */

async function loadTechniques(){

let res = await fetch("data/kihon.json");
techniques = await res.json();

populateMenu();

}

/* ================================
MENU TECHNIQUES
================================ */

function populateMenu(){

let menu = document.getElementById("techSelect");

techniques.forEach(t=>{

let opt = document.createElement("option");

opt.value=t.id;
opt.textContent=t.nom;

menu.appendChild(opt);

});

}

/* ================================
AFFICHAGE TECHNIQUE
================================ */

function displayTechnique(t){

let name = document.getElementById("techName");
let steps = document.getElementById("techSteps");
let video = document.getElementById("techVideo");
let zone = document.getElementById("impactZone");

name.textContent = t.nom;

steps.innerHTML="";

t.etapes.forEach(e=>{

let li=document.createElement("li");
li.textContent=e;
steps.appendChild(li);

});

video.src = t.video;

zone.textContent = zones[t.zone];

}

/* ================================
RITUEL DEBUT
================================ */

function dojoStart(){

speak("préparez vous");

setTimeout(()=>{

speak("hajime");

},1000);

}

/* ================================
RITUEL FIN
================================ */

function dojoStop(){

speak("yame");

}

/* ================================
MODE GAMME
================================ */

function nextTechnique(){

let list = selectedTechniques.length
? selectedTechniques
: techniques;

let t = list[Math.floor(Math.random()*list.length)];

displayTechnique(t);

let phrase =
t.nom + ". objectif " +
t.objectif + ". zone " +
zones[t.zone];

speak(phrase);

}

/* ================================
MODE COMBO
================================ */

function combo(){

let t1 = techniques[Math.floor(Math.random()*techniques.length)];
let t2 = techniques[Math.floor(Math.random()*techniques.length)];

displayTechnique(t1);

let phrase =
t1.nom +
" suivi de " +
t2.nom;

speak(phrase);

}

/* ================================
MODE SPARRING
================================ */

const attacks = [
"attaque tête",
"attaque jambe",
"attaque latérale",
"attaque directe",
"attaque plexus"
];

function sparring(){

let atk = attacks[Math.floor(Math.random()*attacks.length)];

speak(atk);

}

/* ================================
BOUCLE TEMPO
================================ */

function startLoop(mode){

dojoStart();

running=true;

timer=setInterval(()=>{

if(!running) return;

let count = countJP[Math.floor(Math.random()*countJP.length)];

speak(count);

setTimeout(()=>{

if(mode==="kihon") nextTechnique();
if(mode==="combo") combo();
if(mode==="sparring") sparring();

},800);

},tempo);

}

/* ================================
CONTROLES
================================ */

function start(mode){

if(running) return;

startLoop(mode);

}

function pause(){

running=false;
clearInterval(timer);

speak("pause");

}

function stop(){

running=false;

clearInterval(timer);

dojoStop();

}

function reset(){

stop();

document.getElementById("techName").textContent="";
document.getElementById("techSteps").innerHTML="";
document.getElementById("techVideo").src="";

}

/* ================================
FAVORIS
================================ */

function saveFavorite(){

let t1=document.getElementById("tech1").value;
let t2=document.getElementById("tech2").value;
let type=document.getElementById("comboType").value;

let fav={
t1,t2,type
};

favs.push(fav);

localStorage.setItem("kihonFavs",JSON.stringify(favs));

renderFavs();

}

function renderFavs(){

let list=document.getElementById("favList");

list.innerHTML="";

favs.forEach((f,i)=>{

let li=document.createElement("li");

li.textContent=
f.t1+" → "+f.t2+" ("+f.type+")";

li.onclick=()=>playFav(f);

list.appendChild(li);

});

}

function playFav(f){

let t1=techniques.find(t=>t.id==f.t1);
let t2=techniques.find(t=>t.id==f.t2);

let phrase=
t1.nom+" suivi de "+t2.nom;

speak(phrase);

displayTechnique(t1);

}

/* ================================
SELECTION TECHNIQUES
================================ */

function updateSelection(){

let menu=document.getElementById("techSelect");

selectedTechniques =
[...menu.selectedOptions].map(o=>

techniques.find(t=>t.id==o.value)

);

}

/* ================================
INIT
================================ */

window.addEventListener("DOMContentLoaded",()=>{

loadTechniques();

renderFavs();

});
