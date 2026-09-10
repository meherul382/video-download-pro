const preview = document.getElementById('preview');
const xRange = document.getElementById('xRange');
const yRange = document.getElementById('yRange');
let dragging = false;
let activePointer = null;

function getIcon(e){
  return e.target && e.target.closest ? e.target.closest('.overlay-icon') : null;
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
}

preview.addEventListener('pointerdown', e=>{
  const icon=getIcon(e);
  if(!icon) return;
  dragging=true;
  activePointer=e.pointerId;
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
  dragging=false;
  activePointer=null;
}
preview.addEventListener('pointerup',endDrag);
preview.addEventListener('pointercancel',endDrag);
preview.addEventListener('lostpointercapture',endDrag);
