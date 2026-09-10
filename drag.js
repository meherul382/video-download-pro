const preview=document.getElementById('preview');
const xRange=document.getElementById('xRange');
const yRange=document.getElementById('yRange');
const sizeRange=document.getElementById('sizeRange');
const iconCards=[...document.querySelectorAll('.icon-card')];
let dragging=false;
let activePointer=null;
let grabOffsetX=0;
let grabOffsetY=0;

function getIcon(target){return target&&target.closest?target.closest('.overlay-icon'):null}

function syncVisual(){
  const icon=preview.querySelector('.overlay-icon');
  if(!icon)return;
  const s=Number(sizeRange.value||140);
  icon.style.left=`${xRange.value}%`;
  icon.style.top=`${yRange.value}%`;
  icon.style.width=`${s}px`;
  icon.style.height=icon.classList.contains('pill')?`${Math.max(38,s*.55)}px`:`${s}px`;
  icon.style.fontSize=`${Math.max(18,s*.42)}px`;
  icon.style.transform=icon.classList.contains('diamond')?'translate(-50%,-50%) rotate(45deg)':'translate(-50%,-50%)';
}

function setPosition(clientX,clientY){
  const r=preview.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const x=Math.max(0,Math.min(100,((clientX-r.left)/r.width)*100-grabOffsetX));
  const y=Math.max(0,Math.min(100,((clientY-r.top)/r.height)*100-grabOffsetY));
  xRange.value=Math.round(x);
  yRange.value=Math.round(y);
  xRange.dispatchEvent(new Event('input',{bubbles:true}));
  yRange.dispatchEvent(new Event('input',{bubbles:true}));
}

function stopDrag(){
  if(!dragging)return;
  const icon=preview.querySelector('.overlay-icon');
  if(icon)icon.classList.remove('is-dragging');
  dragging=false;
  activePointer=null;
}

preview.addEventListener('pointerdown',e=>{
  const icon=getIcon(e.target);
  if(!icon)return;
  const r=preview.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const currentX=Number(xRange.value)/100*r.width;
  const currentY=Number(yRange.value)/100*r.height;
  grabOffsetX=((e.clientX-r.left)-currentX)/r.width*100;
  grabOffsetY=((e.clientY-r.top)-currentY)/r.height*100;
  dragging=true;
  activePointer=e.pointerId;
  icon.classList.add('is-dragging');
  e.preventDefault();
  setPosition(e.clientX,e.clientY);
});

document.addEventListener('pointermove',e=>{
  if(!dragging||e.pointerId!==activePointer)return;
  e.preventDefault();
  setPosition(e.clientX,e.clientY);
},{passive:false});

document.addEventListener('pointerup',e=>{
  if(activePointer===e.pointerId)stopDrag();
});
document.addEventListener('pointercancel',e=>{
  if(activePointer===e.pointerId)stopDrag();
});

[xRange,yRange,sizeRange].forEach(el=>el.addEventListener('input',syncVisual));
iconCards.forEach(card=>card.addEventListener('click',()=>setTimeout(syncVisual,0)));
setTimeout(syncVisual,100);