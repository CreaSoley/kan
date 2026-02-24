const data = [
 { nom:"Kata 1", video:"../video/kata1.mp4", pdf:"../video/kata1.pdf" },
 { nom:"Kata 2", video:"../video/kata2.mp4", pdf:"../video/kata2.pdf" },
 { nom:"Kata 3", video:"../video/kata3.mp4", pdf:"../video/kata3.pdf" },
 { nom:"Kata 4", video:"../video/kata4.mp4", pdf:"../video/kata4.pdf" }
];

let index = 0;

const select = document.getElementById("kataSelect");

function initSelect(){
 select.innerHTML = data
   .map((k,i)=>`<option value="${i}">${k.nom}</option>`)
   .join("");

 select.onchange = () => {
   index = parseInt(select.value);
   afficher();
 };
}

function afficher(){
 const k = data[index];

 select.value = index;

 card.innerHTML = `
   <h2>${k.nom}</h2>

   <video controls playsinline preload="metadata" class="kata-video">
     <source src="${k.video}" type="video/mp4">
   </video>

   <a href="${k.pdf}" target="_blank" class="kawaii-btn">
     📄 Étapes du kata
   </a>
 `;
}

function nextKata(){
 index = (index + 1) % data.length;
 afficher();
}

function prevKata(){
 index = (index - 1 + data.length) % data.length;
 afficher();
}

function randomKata(){
 index = Math.floor(Math.random()*data.length);
 afficher();
}

initSelect();
afficher();
