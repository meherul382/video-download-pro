(() => {
  const preview = document.getElementById('preview');
  const downloadBtn = document.getElementById('downloadBtn');
  const fileInput = document.getElementById('fileInput');
  if (!preview || !downloadBtn) return;

  let blurPx = 0;

  const box = document.createElement('div');
  box.className = 'control-box full-blur-box';
  box.innerHTML = `
    <h3>FULL IMAGE BLUR</h3>
    <div class="blur-toggle-row">
      <span>Blur the entire image</span>
      <label class="switch"><input id="fullBlurToggle" type="checkbox"><span></span></label>
    </div>
    <div class="control-row full-blur-range">
      <label>Strength</label>
      <input id="fullBlurRange" type="range" min="0" max="40" value="0" step="1">
      <span class="value-pill" id="fullBlurValue">0px</span>
    </div>
    <div class="blur-help">Works on the whole image before you download it.</div>`;

  const controls = document.querySelector('.editor-controls');
  if (controls) controls.appendChild(box);

  const toggle = document.getElementById('fullBlurToggle');
  const range = document.getElementById('fullBlurRange');
  const value = document.getElementById('fullBlurValue');

  const style = document.createElement('style');
  style.textContent = `
    .full-blur-box{border:1px solid rgba(255,255,255,.1)}
    .blur-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;font-size:13px}
    .full-blur-range{margin-top:4px}
    .blur-help{font-size:11px;line-height:1.5;color:#8b98a8;margin-top:10px}
    .media-element.full-blurred{filter:blur(var(--full-blur,0px));transform:scale(1.03)}
    body.light .full-blur-box{border-color:rgba(15,23,42,.12)}
  `;
  document.head.appendChild(style);

  function applyPreviewBlur() {
    const media = preview.querySelector('.media-element');
    const enabled = !!toggle?.checked && blurPx > 0;
    if (media) {
      media.classList.toggle('full-blurred', enabled);
      media.style.setProperty('--full-blur', `${blurPx}px`);
    }
  }

  function setBlur() {
    blurPx = Number(range?.value || 0);
    if (value) value.textContent = `${blurPx}px`;
    applyPreviewBlur();
  }

  toggle?.addEventListener('change', () => {
    if (!toggle.checked) {
      blurPx = 0;
      if (range) range.value = 0;
    }
    setBlur();
  });
  range?.addEventListener('input', () => {
    if (toggle && range.value > 0) toggle.checked = true;
    setBlur();
  });
  fileInput?.addEventListener('change', () => setTimeout(applyPreviewBlur, 0));

  function drawBlurredImage(ctx, media, w, h, radius) {
    if (!radius) {
      ctx.drawImage(media, 0, 0, w, h);
      return;
    }
    const pad = Math.ceil(radius * 3);
    const off = document.createElement('canvas');
    off.width = w + pad * 2;
    off.height = h + pad * 2;
    const oc = off.getContext('2d');
    oc.filter = `blur(${radius}px)`;
    oc.drawImage(media, pad, pad, w, h);
    ctx.drawImage(off, pad, pad, w, h, 0, 0, w, h);
  }

  function saveBlurred() {
    const media = preview.querySelector('.media-element');
    if (!media || !fileInput?.files?.[0]) return;
    const w = media.videoWidth || media.naturalWidth;
    const h = media.videoHeight || media.naturalHeight;
    if (!w || !h) return;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    drawBlurredImage(ctx, media, w, h, blurPx);

    // Keep the existing editor overlays by redrawing them after the blurred base image.
    const sizeRange = document.getElementById('sizeRange');
    const xRange = document.getElementById('xRange');
    const yRange = document.getElementById('yRange');
    const timeBarToggle = document.getElementById('timeBarToggle');
    const miniPlayToggle = document.getElementById('miniPlayToggle');
    const currentTimeInput = document.getElementById('currentTimeInput');
    const durationInput = document.getElementById('durationInput');
    const color = getComputedStyle(preview.querySelector('.overlay-icon') || document.body).color;

    // Play button: use the selected preview style as a clean, high-contrast overlay.
    const icon = preview.querySelector('.overlay-icon');
    const size = Math.min(Number(sizeRange?.value || 140), Math.min(w, h) * .5);
    const cx = w * Number(xRange?.value || 50) / 100;
    const cy = h * Number(yRange?.value || 50) / 100;
    const selected = icon?.className?.split(' ').find(c => c && c !== 'overlay-icon') || 'classic';
    const selectedColor = icon?.style?.borderColor || '#ffffff';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = selectedColor;
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = Math.max(3, size * .055);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = size * .18;
    ctx.shadowOffsetY = size * .08;
    if (selected === 'outline' || selected === 'glass' || selected === 'double' || selected === 'neon') {
      ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.stroke();
      if (selected === 'double') { ctx.globalAlpha=.35; ctx.beginPath(); ctx.arc(0,0,size*.64,0,Math.PI*2); ctx.stroke(); }
      if (selected === 'glass') { ctx.globalAlpha=.18; ctx.fill(); }
    } else if (selected === 'pill') {
      ctx.beginPath(); ctx.roundRect(-size*.75,-size*.36,size*1.5,size*.72,size*.36); ctx.fill();
    } else if (selected === 'diamond') {
      ctx.rotate(Math.PI/4); ctx.beginPath(); ctx.roundRect(-size*.38,-size*.38,size*.76,size*.76,size*.12); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1; ctx.shadowColor='transparent';
    ctx.fillStyle = color || '#111827';
    ctx.font=`800 ${Math.max(12,Math.round(size*.42))}px Arial`;
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('▶',0,1);
    ctx.restore();

    if (timeBarToggle?.checked) {
      const bh=Math.max(55,Math.round(h*.09)), y=h-bh, pad=Math.max(14,w*.018), font=Math.max(12,w*.012);
      const g=ctx.createLinearGradient(0,y,0,h); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.35,'rgba(0,0,0,.55)'); g.addColorStop(1,'rgba(0,0,0,.94)');
      ctx.fillStyle=g; ctx.fillRect(0,y,w,bh);
      let x=pad,ty=y+bh*.62; ctx.fillStyle='#fff'; ctx.textBaseline='middle';
      if(miniPlayToggle?.checked){ctx.font=`800 ${font*1.35}px Arial`;ctx.fillText('▶',x,ty);x+=font*1.9}
      const left=currentTimeInput?.value||'0:00', right=durationInput?.value||'0:00'; ctx.font=`600 ${font}px Arial`;ctx.fillText(left,x,ty);x+=ctx.measureText(left).width+font;
      const rw=ctx.measureText(right).width,end=w-pad-rw-font*8,tw=Math.max(50,end-x),dur=String(right).split(':').reduce((a,n)=>a*60+Number(n||0),0),cur=String(left).split(':').reduce((a,n)=>a*60+Number(n||0),0),pct=dur?Math.min(1,Math.max(0,cur/dur)):0;
      ctx.lineCap='round';ctx.lineWidth=Math.max(3,bh*.065);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(x,ty);ctx.lineTo(x+tw,ty);ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(x,ty);ctx.lineTo(x+tw*pct,ty);ctx.stroke();ctx.beginPath();ctx.arc(x+tw*pct,ty,Math.max(5,bh*.12),0,Math.PI*2);ctx.fill();ctx.fillText(right,x+tw+font,ty);ctx.font=`${font*1.35}px Arial`;ctx.fillText('🔊',x+tw+font*3,ty);ctx.fillText('⛶',x+tw+font*5.5,ty);ctx.fillText('⋮',x+tw+font*7.5,ty);
    }

    const a=document.createElement('a');
    a.download=`blurred-video-thumbnail-${Date.now()}.png`;
    a.href=canvas.toDataURL('image/png');
    a.click();
  }

  // Capture before the original downloader so the exported file uses the full-image blur.
  downloadBtn.addEventListener('click', e => {
    if (!(toggle?.checked && blurPx > 0)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    saveBlurred();
  }, true);
})();
