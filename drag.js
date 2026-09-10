const preview = document.getElementById('preview');
const xRange = document.getElementById('xRange');
const yRange = document.getElementById('yRange');
const sizeRange = document.getElementById('sizeRange');
const iconCards = [...document.querySelectorAll('.icon-card')];
let dragging = false;
let activePointer = null;

function getIcon(e){
  return e.target && e.target.closest ? e.target.closest('.overlay-icon') : null;
}

function syncVisual(){
  const icon = preview.querySelector('.overlay-icon');
  if(!icon) return;
  const s = Number(sizeRange.value || 140);
  icon.style.setProperty('left', `${xRange.value}%`, 'important');
  icon.style.setProperty('top', `${yRange.value}%`, 'important');
  icon.style.setProperty('width', `${s}px`, 'important');
  icon.style.setProperty('height', icon.classList.contains('pill') ? `${Math.max(38,s*.55)}px` : `${s}px`, 'important');
  icon.style.setProperty('font-size', `${Math.max(18, s*.42)}px`, 'important');
  icon.style.setProperty('transform', icon.classList.contains('diamond') ? 'translate(-50%,-50%) rotate(45deg)' : 'translate(-50%,-50%)', 'important');
}

function setPosition(clientX, clientY){
  const icon = preview.querySelector('.overlay-icon');
  if(!icon) return;
  const r = preview.getBoundingClientRect();
  if(!r.width || !r.height) return;
  const x = Math.max(0, Math.min(100, ((clientX-r.left)/r.width)*100));
  const y = Math.max(0, Math.min(100, ((clientY-r.top)/r.height)*100));
  xRange.value = Math.round(x);
  yRange.value = Math.round(y);
  xRange.dispatchEvent(new Event('input',{bubbles:true}));
  yRange.dispatchEvent(new Event('input',{bubbles:true}));
  syncVisual();
}

preview.addEventListener('pointerdown', e=>{
  const icon=getIcon(e);
  if(!icon) return;
  dragging=true;
  activePointer=e.pointerId;
  icon.classList.add('is-dragging');
  try{icon.setPointerCapture(e.pointerId)}catch(_){ }
  e.preventDefault();
  setPosition(e.clientX,e.clientY);
});

preview.addEventListener('pointermove', e=>{
  if(!dragging || e.pointerId!==activePointer) return;
  e.preventDefault();
  setPosition(e.clientX,e.clientY);
});

function endDrag(e){
  if(!dragging) return;
  if(e && activePointer!==null && e.pointerId!==activePointer) return;
  const icon=preview.querySelector('.overlay-icon');
  if(icon) icon.classList.remove('is-dragging');
  dragging=false;
  activePointer=null;
  syncVisual();
}

preview.addEventListener('pointerup',endDrag);
preview.addEventListener('pointercancel',endDrag);
preview.addEventListener('lostpointercapture',endDrag);

[xRange,yRange,sizeRange].forEach(el=>el.addEventListener('input',syncVisual));
iconCards.forEach(card=>card.addEventListener('click',()=>setTimeout(syncVisual,0)));
setTimeout(syncVisual,50);
