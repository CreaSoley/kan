let COMBINAISONS = [];

async function loadCombinaisons() {
  const res = await fetch("../data/combinaisons.json");
  COMBINAISONS = await res.json();
}
