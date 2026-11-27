// One continuous panoramic set: travel sideways first, then approach the hero.
// All actors use world coordinates; revealing the hero never spawns a new one.
const introPanorama=new Image();introPanorama.src='assets/intro/panorama-mar-de-lixo.png';
const introLandingDetail=new Image();introLandingDetail.src='assets/intro/terraco-aproximacao.png';
const introDebrisLayer=new Image();introDebrisLayer.src='assets/intro/lixo-flutuante-camadas.png';
const introSproutLayer=new Image();introSproutLayer.src='assets/intro/broto-camada.png';
const introColdPlates=new WeakMap();
const introDebrisCrops=[[60,241,444,235],[601,234,421,231],[1154,211,393,278],[1652,226,492,252]];
function introImageReady(image) {return image.complete&&image.naturalWidth>0;}
function introPanoramaReady() {
  return [introPanorama,introDebrisLayer,titleHeroLayer].every(introImageReady);
}
function introCamera(l,t) {
  const W=introPanorama.naturalWidth,H=introPanorama.naturalHeight;
  const hx=W*.82,hy=H*.657,heroH=H*.095;
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  // Initial framing always leaves the landing off-screen, including ultrawide.
  const base=Math.max(l.h/H*1.06,l.w/(W*.72));
  const final=Math.max(base,l.h*.29/heroH);
  const pan=introEase((t-2.4)/4.8),approach=introEase((t-7.2)/2.7);
  const z=titleReducedMotion.matches?1:approach;
  const scale=base*Math.pow(final/base,z),vw=l.w/scale,vh=l.h/scale;
  const startX=clamp(W*(l.portrait?.39:.015),0,W-l.w/base);
  const endX=clamp(hx-l.w*.7/base,0,W-l.w/base);
  const startY=clamp(H*.52-l.h/base*.5,0,H-l.h/base);
  const targetScreenX=l.portrait?.54:.62;
  const startScreenY=(hy-startY)*base/l.h;
  const cameraX=z>0?hx-l.w*(.7+(targetScreenX-.7)*z)/scale:startX+(endX-startX)*pan;
  const cameraY=z>0?hy-l.h*(startScreenY+(.76-startScreenY)*z)/scale:startY;
  return {W,H,hx,hy,heroH,sproutX:hx+H*(l.portrait?.027:.105),scale,vw,vh,x:clamp(cameraX,0,W-vw),y:clamp(cameraY,0,H-vh),pan,approach:z};
}
function introColdPlate(image) {
  if(!introColdPlates.has(image)) {
    const plate=document.createElement('canvas');plate.width=image.naturalWidth;plate.height=image.naturalHeight;
    const c=plate.getContext('2d');
    c.filter='saturate(0.24) brightness(0.55)';c.drawImage(image,0,0);c.filter='none';
    c.fillStyle='rgba(26,36,52,.18)';c.fillRect(0,0,plate.width,plate.height);
    introColdPlates.set(image,plate);
  }
  return introColdPlates.get(image);
}
function introPanoramaSprout(a,t) {
  const grow=introEase((t-9.8)/1.7),seed=introEase((t-9.3)/.5);
  if(!seed)return;
  const x=a.sproutX,y=a.hy;
  const size=a.H*.021,stem=size*grow;
  ctx.save();ctx.globalAlpha=seed;
  ctx.shadowColor=ITEM_GLOW.SEMENTE.color;ctx.shadowBlur=6;
  if(introImageReady(introSproutLayer)) {
    const height=size*(.12+.88*grow),width=size*876/958*(.4+.6*grow);
    ctx.drawImage(introSproutLayer,180,175,876,958,x-width*.41,y-height,width,height);
    ctx.restore();return;
  }
  artOval(x,y-3-(1-seed)*18,3.5,4.5,'#c5b57e');ctx.shadowBlur=0;
  artLine([[x,y-3],[x-2*grow,y-stem*.55],[x+2*grow,y-stem]],'#8baf6d',2.5);
  for(const side of [-1,1]) {
    const ly=y-stem*(side===-1?.62:.87),lx=x+side*size*.13*grow;
    titleLeaf(lx,ly,size*.23*grow,side===-1?'#9dbf70':'#bbd18a',side*.45);
    artLine([[x,ly+2],[lx+side*size*.13*grow,ly-2]],'#d5d9a0',.7);
  }
  ctx.restore();
}
function introFloatingDebris(a,t) {
  const moving=!titleReducedMotion.matches;
  // Seeded positions remain fixed in the world while each cutout bobs gently.
  // The camera, not a screen-space scroll, carries the foreground out of frame.
  for(let i=0;i<76;i++) {
    const depth=artNoise(i+240),x=a.W*(.015+artNoise(i+77)*.95);
    const waterTop=x>a.W*.69?.78:.70;
    const y=a.H*(waterTop+depth*(.985-waterTop));
    const wave=moving?Math.sin(t*1.1+i*1.7)*(1+depth*2):0;
    const dx=moving?Math.sin(t*.27+i)*3:0,type=i%4;
    const crop=introDebrisCrops[type],width=a.H*(.018+depth*.035),height=width*crop[3]/crop[2];
    if(x+width<a.x||x-width>a.x+a.vw||y+height<a.y||y-height>a.y+a.vh)continue;
    ctx.save();ctx.translate(x+dx,y+wave);
    // A faint water-contact ripple keeps objects seated in the painted sea.
    ctx.globalAlpha=.22;artOval(0,height*.3,width*.55,height*.13,'#a1b1a1');ctx.globalAlpha=1;
    ctx.rotate(moving?Math.sin(t*.65+i)*.055:0);
    ctx.shadowColor=(type===2?ITEM_GLOW.ELETRONICO:ITEM_GLOW.RECICLAVEL).color;
    ctx.shadowBlur=3+depth*3;
    ctx.drawImage(introDebrisLayer,...crop,-width/2,-height/2,width,height);
    ctx.restore();
  }
}
function introPanoramaMist(l,t,opacity) {
  for(let i=0;i<4;i++) {
    const drift=titleReducedMotion.matches?0:Math.sin(t*.13+i)*l.w*.04;
    const x=l.w*(i*.31)+drift,y=l.h*(.13+(i%2)*.2),r=l.w*.34;
    ctx.save();ctx.translate(x,y);ctx.scale(1,.28);
    const fog=ctx.createRadialGradient(0,0,0,0,0,r);
    fog.addColorStop(0,`rgba(29,38,52,${opacity*.25})`);fog.addColorStop(1,'#1d263400');
    ctx.fillStyle=fog;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
  }
}
function paintIntroPanorama(l,t,clock) {
  if(!introPanoramaReady())return false;
  const a=introCamera(l,t),renewal=introEase((t-9.7)/3.4);
  ctx.save();ctx.scale(a.scale,a.scale);ctx.translate(-a.x,-a.y);
  ctx.drawImage(introColdPlate(introPanorama),0,0,a.W,a.H);
  ctx.save();ctx.globalAlpha=renewal;ctx.drawImage(introPanorama,0,0,a.W,a.H);ctx.restore();
  // Higher-detail landing takes over only after the camera is inside its bounds.
  // This keeps the close shot crisp without a visible tile edge during travel.
  const detail=introEase((t-9.7)/.8);
  if(detail>0&&introImageReady(introLandingDetail)&&a.x>=a.W*.64&&a.y>=a.H*.2&&a.y+a.vh<=a.H*.85) {
    ctx.save();ctx.globalAlpha=detail;
    ctx.drawImage(introColdPlate(introLandingDetail),a.W*.64,a.H*.2,a.W*.36,a.H*.65);
    ctx.globalAlpha=detail*renewal;ctx.drawImage(introLandingDetail,a.W*.64,a.H*.2,a.W*.36,a.H*.65);ctx.restore();
  }
  introFloatingDebris(a,t);
  // The mascot is already on the distant landing from frame one. Its apparent
  // growth comes entirely from camera zoom; body shape and palette stay intact.
  ctx.save();ctx.filter=`saturate(${.7+renewal*.3}) brightness(${.78+renewal*.22})`;
  paintTitleMascot(a.hx,a.hy,a.heroH,clock);ctx.restore();
  introPanoramaSprout(a,t);
  ctx.restore();
  introPanoramaMist(l,t,1-renewal);
  const vignette=ctx.createRadialGradient(l.w*.55,l.h*.5,l.h*.3,l.w*.5,l.h*.5,Math.max(l.w,l.h)*.85);
  vignette.addColorStop(0,'#101c2900');vignette.addColorStop(1,'#101c2955');ctx.fillStyle=vignette;ctx.fillRect(0,0,l.w,l.h);
  artRect(0,0,l.w,l.h,`rgba(9,20,28,${1-introEase(t/.9)})`);
  for(const [start,end,text] of [[.9,3.4,'A cidade perdeu suas cores.'],[4,6.8,'O que descartamos não desaparece.'],[10,12.4,'Mas toda mudança começa com uma ação.']])
    introCaption(text,l,introEase((t-start)/.6)*(1-introEase((t-end)/.6)));
  return true;
}
