let data = [];
let current = null;

fetch("../data/dext.json")
.then(r=>r.json())
.then(d=>{
 data = d;
 initFilters();
 afficher(d[0]);
});

function initFilters(){
 const niveaux=[...new Set(data.map(x=>x.niveau))];
 const materiels=[...new Set(data.flatMap(x=>x.materiel))];
 const modalites=[...new Set(data.flatMap(x=>x.modalite))];

 fillSelect("niveau",niveaux);
 fillSelect("materiel",materiels);
 fillSelect("modalite",modalites);

 document.querySelectorAll("#niveau,#materiel,#modalite")
   .forEach(s=>s.onchange=applyFilters);

 techniqueSelect.onchange = () => {
  const t = data.find(x=>x.nom===techniqueSelect.value);
  if(t) afficher(t);
 };

 applyFilters();
}

function fillSelect(id,values){
 const s=document.getElementById(id);
 s.innerHTML="<option value=''>Tous</option>";
 values.forEach(v=>s.innerHTML+=`<option>${v}</option>`);
}

function applyFilters(){
 const n=niveau.value;
 const m=materiel.value;
 const mo=modalite.value;

 const filtered=data.filter(t=>
  (!n||t.niveau===n) &&
  (!m||t.materiel.includes(m)) &&
  (!mo||t.modalite.includes(mo))
 );

 remplirTechniques(filtered);
}

function remplirTechniques(list){
 if(!list.length){
  techniqueSelect.innerHTML="<option>Aucune technique</option>";
  card.innerHTML="";
  return;
 }

 techniqueSelect.innerHTML=list.map(t=>`<option>${t.nom}</option>`).join("");
 afficher(list[0]);
}

function afficher(t){
 current=t;

 const badgesMateriel = t.materiel.map(x=>`<span class="badge">🦯</span>`).join("");
 const badgesPosture = t.modalite.map(x=>`<span class="badge">${x==="debout"?"🧍":"🪑"}</span>`).join("");

 const explication = (t.explication || "")
   .replace(/\/n/g,"<br>");

 card.innerHTML=`
   <div class="title-row">
     <h2>${t.nom}</h2>
   </div>

   <div class="badges">${badgesMateriel} ${badgesPosture}</div>

   <p class="desc">${t.description}</p>

   <button class="accordion-btn" onclick="toggleAccordion()">
     Explications
   </button>

   <div id="accordion-content" class="accordion-content">
     ${explication}
   </div>

   <iframe src="${t.video}" allowfullscreen></iframe>
 `;
}

function toggleAccordion(){
 const el=document.getElementById("accordion-content");
 el.classList.toggle("open");
}

function techniqueRandom(){
 afficher(data[Math.floor(Math.random()*data.length)]);
}
