const fileInput=document.getElementById('fileInput');
const chooseBtn=document.getElementById('chooseBtn');
const dropZone=document.getElementById('dropZone');
const preview=document.getElementById('preview');
const fileName=document.getElementById('fileName');
const mediaType=document.getElementById('mediaType');
const downloadBtn=document.getElementById('downloadBtn');
const resetBtn=document.getElementById('resetBtn');
const themeBtn=document.getElementById('themeBtn');
const iconCards=[...document.querySelectorAll('.icon-card')];
let selectedFile=null;
let selectedStyle='classic';
let mediaUrl=null;

function renderPreview(){
  if(!selectedFile){
    preview.innerHTML='<div class="empty-preview"><div>◉</div><span>Your media preview appears here</span></div>';
    mediaType.textContent='Waiting for media';
    downloadBtn.disabled=true;
    return;
  }
  if(mediaUrl) URL.revokeObjectURL(mediaUrl);
  mediaUrl=URL.createObjectURL(selectedFile);
  const isVideo=selectedFile.type.startsWith('video/');
  preview.innerHTML='';
  const media=document.createElement(isVideo?'video':'img');
  media.className='media-element';
  media.src=mediaUrl;
  if(isVideo){media.controls=true;media.playsInline=true;media.preload='metadata'}
  preview.appendChild(media);
  const icon=document.createElement('div');
  icon.className=`overlay-icon ${selectedStyle}`;
  icon.textContent='▶';
  preview.appendChild(icon);
  mediaType.textContent=isVideo?'Video preview':'Image preview';
  downloadBtn.disabled=false;
}

function setFile(file){
  if(!file) return;
  const valid=file.type.startsWith('image/')||file.type.startsWith('video/');
  if(!valid){fileName.textContent='Please choose an image or video file';return}
  selectedFile=file;
  fileName.textContent=file.name;
  renderPreview();
}

chooseBtn.addEventListener('click',()=>fileInput.click());
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.style.borderColor='#8db5ff'});
dropZone.addEventListener('dragleave',()=>{dropZone.style.borderColor='#33445f'});
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.style.borderColor='#33445f';setFile(e.dataTransfer.files[0])});
fileInput.addEventListener('change',()=>setFile(fileInput.files[0]));

iconCards.forEach(card=>card.addEventListener('click',()=>{
  iconCards.forEach(c=>c.classList.remove('active'));
  card.classList.add('active');
  selectedStyle=card.dataset.style;
  const icon=preview.querySelector('.overlay-icon');
  if(icon) icon.className=`overlay-icon ${selectedStyle}`;
}));

resetBtn.addEventListener('click',()=>{
  if(mediaUrl) URL.revokeObjectURL(mediaUrl);
  mediaUrl=null;
  selectedFile=null;
  fileInput.value='';
  fileName.textContent='No file selected';
  selectedStyle='classic';
  iconCards.forEach(c=>c.classList.toggle('active',c.dataset.style==='classic'));
  renderPreview();
});

downloadBtn.addEventListener('click',async()=>{
  if(!selectedFile) return;
  const isVideo=selectedFile.type.startsWith('video/');
  if(isVideo){
    const a=document.createElement('a');
    a.href=mediaUrl;
    a.download=selectedFile.name;
    document.body.appendChild(a);a.click();a.remove();
    return;
  }
  const img=preview.querySelector('img');
  if(!img) return;
  if(!img.complete) await new Promise(resolve=>{img.onload=resolve;img.onerror=resolve});
  const canvas=document.createElement('canvas');
  canvas.width=img.naturalWidth||img.width;
  canvas.height=img.naturalHeight||img.height;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const size=Math.max(64,Math.round(Math.min(canvas.width,canvas.height)*0.18));
  const x=canvas.width/2,y=canvas.height/2;
  ctx.save();
  ctx.translate(x,y);
  const darkStyles=['classic','square','soft','diamond','badge','floating','pill'];
  const needsCircle=!['pill','square','badge','diamond','minimal'].includes(selectedStyle);
  if(selectedStyle==='diamond') ctx.rotate(Math.PI/4);
  ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=size*.22;ctx.shadowOffsetY=size*.1;
  ctx.fillStyle='#fff';
  if(selectedStyle==='pill') ctx.roundRect(-size*.75,-size*.38,size*1.5,size*.76,size*.38);
  else if(selectedStyle==='square'||selectedStyle==='badge') ctx.roundRect(-size/2,-size/2,size,size,size*.2);
  else if(selectedStyle==='diamond') ctx.roundRect(-size*.38,-size*.38,size*.76,size*.76,size*.12);
  else if(selectedStyle!=='minimal' && needsCircle){ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2)}
  if(selectedStyle!=='minimal' && (darkStyles.includes(selectedStyle)||needsCircle)) ctx.fill();
  ctx.shadowColor='transparent';
  ctx.fillStyle=darkStyles.includes(selectedStyle)?'#101827':'#fff';
  ctx.font=`800 ${Math.round(size*.42)}px Arial`;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('▶',0,1);
  if(selectedStyle==='outline'||selectedStyle==='double'||selectedStyle==='neon'){
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,size*.07);ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);ctx.stroke();
    if(selectedStyle==='double'){ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(0,0,size*.65,0,Math.PI*2);ctx.stroke()}
  }
  ctx.restore();
  const link=document.createElement('a');
  link.download=`media-icon-${Date.now()}.png`;
  link.href=canvas.toDataURL('image/png');
  document.body.appendChild(link);link.click();link.remove();
});

themeBtn.addEventListener('click',()=>{
  document.body.classList.toggle('light');
  themeBtn.textContent=document.body.classList.contains('light')?'☾':'☼';
});
