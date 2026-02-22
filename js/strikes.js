let strikes = [];
let currentIndex = 0;

async function loadStrikes() {
  const res = await fetch("../data/strikes.json");
  strikes = await res.json();
  initObjectifs();
  showStrike(0);
}

function initObjectifs() {
  const objectifs = [...new Set(strikes.map(s => s.objectif))];
  const select = document.getElementById("objectifSelect");

  select.innerHTML = `<option value="">Objectif</option>`;
  objectifs.forEach(obj => {
    select.innerHTML += `<option value="${obj}">${obj}</option>`;
  });

  select.onchange = updateTechniques;
}

function updateTechniques() {
  const obj = document.getElementById("objectifSelect").value;
  const select = document.getElementById("techniqueSelect");

  const list = obj
    ? strikes.filter(s => s.objectif === obj)
    : strikes;

  select.innerHTML = "";
  list.forEach((s, i) => {
    select.innerHTML += `<option value="${i}">${s.nom}</option>`;
  });

  select.onchange = () => {
    currentIndex = strikes.indexOf(list[select.value]);
    showStrike(currentIndex);
  };

  showStrike(strikes.indexOf(list[0]));
}

function showStrike(index) {
  currentIndex = index;
  const s = strikes[index];
  const card = document.getElementById("card");

  const zoneIcon = s.zone_impact === "non concerné"
    ? ""
    : `<img src="../${s.zone_impact}" style="width:60px;margin:auto;">`;

  card.innerHTML = `
    <h2>${s.nom}</h2>

    <details>
      <summary>Voir description</summary>
      <p>${s.description.replace(/\n/g,"<br>")}</p>
    </details>

    ${zoneIcon}

    <iframe src="${s.yt}" allowfullscreen></iframe>
  `;
}

function prevStrike() {
  currentIndex = (currentIndex - 1 + strikes.length) % strikes.length;
  showStrike(currentIndex);
}

function nextStrike() {
  currentIndex = (currentIndex + 1) % strikes.length;
  showStrike(currentIndex);
}

function randomStrike() {
  const r = Math.floor(Math.random() * strikes.length);
  showStrike(r);
}

loadStrikes();
