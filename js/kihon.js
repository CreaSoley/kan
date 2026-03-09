let techniques = [];
let tempo = 1;
let favoris = JSON.parse(localStorage.getItem("kihon_favoris")) || [];
let currentTech = null;

const synth = window.speechSynthesis;

const zones = {

none: "Aucune zone spécifique",
mb: "Membres inférieurs",
mm: "Membres supérieurs",
cro: "Crochet / avant-bras",
pt: "Plexus / torse"

};

const compteJap = [
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
];



/* ===========================
Chargement JSON
=========================== */

async function loadTechniques(){

try{

const res = await fetch("../data/kihon.json");

techniques = await res.json();

buildMenu();

updateFavoris();

}catch(err){

console.error("Erreur chargement JSON :",err);

}

}



/* ===========================
Menu techniques
=========================== */

function buildMenu(){

const menu = document.getElementById("techniques-menu");

menu.innerHTML="";

techniques.forEach(t=>{

const li=document.createElement("li");

li.textContent=t.nom;

li.onclick=()=>playTechnique(t);

menu.appendChild(li);

});

}



/* ===========================
Lecture technique
=========================== */

async function playTechnique(tech){

currentTech=tech;

updateDetails(tech);

await speakJapaneseCount(tech.etapes.length);

for(const etape of tech.etapes){

await speak(etape);

await wait(700/tempo);

}

if(tech.video){

document.getElementById("video-frame").src=youtubeEmbed(tech.video);

}

}



/* ===========================
Affichage détails
=========================== */

function updateDetails(tech){

document.getElementById("technique-name").textContent=tech.nom;

document.getElementById("technique-objectif").textContent="Objectif : "+tech.objectif;

document.getElementById("technique-zone").textContent="Zone : "+(zones[tech.zone]||tech.zone);

const ul=document.getElementById("technique-etapes");

ul.innerHTML="";

tech.etapes.forEach(e=>{

const li=document.createElement("li");

li.textContent=e;

ul.appendChild(li);

});

updateFavoriButton();

}



/* ===========================
Favoris
=========================== */

function toggleCurrentFavori(){

if(!currentTech) return;

toggleFavori(currentTech.id);

}

function toggleFavori(id){

const index=favoris.indexOf(id);

if(index>=0){

favoris.splice(index,1);

}else{

favoris.push(id);

}

localStorage.setItem("kihon_favoris",JSON.stringify(favoris));

updateFavoris();

updateFavoriButton();

}

function updateFavoriButton(){

const btn=document.getElementById("toggle-favori");

if(!currentTech) return;

if(favoris.includes(currentTech.id)){

btn.textContent="Retirer des favoris";

}else{

btn.textContent="Ajouter aux favoris";

}

}

function updateFavoris(){

const favDiv=document.getElementById("favoris");

favDiv.innerHTML="";

favoris.forEach(id=>{

const tech=techniques.find(t=>t.id===id);

if(!tech) return;

const div=document.createElement("div");

div.className="favori-item";

div.textContent=tech.nom;

div.onclick=()=>playTechnique(tech);

favDiv.appendChild(div);

});

}



/* ===========================
Synthèse vocale
=========================== */

function speak(text){

return new Promise(resolve=>{

synth.cancel();

const utter=new SpeechSynthesisUtterance(text);

utter.lang="fr-FR";

utter.rate=tempo;

utter.onend=resolve;

synth.speak(utter);

});

}



/* ===========================
Compte japonais
=========================== */

async function speakJapaneseCount(n){

for(let i=0;i<n && i<compteJap.length;i++){

await speak(compteJap[i]);

await wait(500/tempo);

}

}



/* ===========================
Combo aléatoire
=========================== */

function generateCombo(length=3){

const combo=[];

for(let i=0;i<length;i++){

const t=techniques[Math.floor(Math.random()*techniques.length)];

combo.push(t);

}

return combo;

}

async function playCombo(){

const combo=generateCombo(3);

for(const t of combo){

await playTechnique(t);

await wait(500/tempo);

}

}



/* ===========================
Sparring
=========================== */

async function sparring(){

for(let i=0;i<5;i++){

const t=techniques[Math.floor(Math.random()*techniques.length)];

await playTechnique(t);

await wait(500/tempo);

}

}



/* ===========================
Youtube embed
=========================== */

function youtubeEmbed(url){

if(!url) return "";

if(url.includes("watch?v=")){

const id=url.split("watch?v=")[1];

return "https://www.youtube.com/embed/"+id;

}

return url;

}



/* ===========================
Utils
=========================== */

function wait(ms){

return new Promise(resolve=>setTimeout(resolve,ms));

}



/* ===========================
Events
=========================== */

document.addEventListener("DOMContentLoaded",()=>{

loadTechniques();

document.getElementById("tempo-select").addEventListener("change",(e)=>{

tempo=parseFloat(e.target.value);

});

document.getElementById("combo-btn").addEventListener("click",playCombo);

document.getElementById("sparring-btn").addEventListener("click",sparring);

document.getElementById("toggle-favori").addEventListener("click",toggleCurrentFavori);

});
