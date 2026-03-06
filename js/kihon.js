let DATA=[]
let index=0

async function loadData(){
 const res=await fetch("../data/kihon.json")
 DATA=await res.json()
 showTech()
}

function showTech(){

 const t=DATA[index]

 document.getElementById("techName").textContent=t.nom
 document.getElementById("techObjectif").textContent=t.objectif

 const steps=document.getElementById("steps")
 steps.innerHTML=t.etapes.map(e=>`<p>• ${e}</p>`).join("")

 const img=document.getElementById("impactImg")
 img.src="../images/impact/"+t.zone+".png"

 const video=document.getElementById("video")

 if(t.video){
 video.src=t.video
 video.classList.remove("hidden")
 }

}

function nextTech(){
 index++
 if(index>=DATA.length) index=0
 showTech()
}

function prevTech(){
 index--
 if(index<0) index=DATA.length-1
 showTech()
}

loadData()
