const dragPreview=document.getElementById('preview');
const dragX=document.getElementById('xRange');
const dragY=document.getElementById('yRange');
let draggingIcon=false;
function dragIconStart(e){
  const icon=e.target.closest('.overlay-icon');
  if(!icon)return;
  draggingIcon=true;icon.setPointerCapture?.(e.pointerId);e.preventDefault();
}
function dragIconMove(e){
  if(!draggingIcon)return;
  const r=dragPreview.getBoundingClientRect();
  const x=Math.min(100,Math.max(0,((e.clientX-r.left)/r.width)*100));
  const y=Math.min(100,Math.max(0,((e.clientY-r.top)/r.height)*100));
  dragX.value=Math.round(x);dragY.value=Math.round(y);
  dragX.dispatchEvent(new Event('input',{bubbles:true}));
  dragY.dispatchEvent(new Event('input',{bubbles:true}));
}
function dragIconEnd(){draggingIcon=false}
dragPreview.addEventListener('pointerdown',dragIconStart);
dragPreview.addEventListener('pointermove',dragIconMove);
dragPreview.addEventListener('pointerup',dragIconEnd);
dragPreview.addEventListener('pointercancel',dragIconEnd);
