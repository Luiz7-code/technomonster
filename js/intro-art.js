// One continuous panoramic set: travel sideways first, then approach the hero.
// All actors use world coordinates; revealing the hero never spawns a new one.
const introPanorama=new Image();introPanorama.src='assets/intro/panorama-mar-de-lixo.png';
const introLandingDetail=new Image();introLandingDetail.src='assets/intro/terraco-aproximacao.png';
const introDebrisLayer=new Image();introDebrisLayer.src='assets/intro/lixo-flutuante-camadas.png';
const introSproutLayer=new Image();introSproutLayer.src='assets/intro/broto-camada.png';
let introSproutParts=null;
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
  const targetScreenX=l.portrait?(l.w/l.h<.4?.5:.54):.62;
  const startScreenY=(hy-startY)*base/l.h;
  const cameraX=z>0?hx-l.w*(.7+(targetScreenX-.7)*z)/scale:startX+(endX-startX)*pan;
  const cameraY=z>0?hy-l.h*(startScreenY+(.76-startScreenY)*z)/scale:startY;
  return {W,H,hx,hy,heroH,sproutX:hx+H*(l.portrait?.042:.105),scale,vw,vh,x:clamp(cameraX,0,W-vw),y:clamp(cameraY,0,H-vh),pan,approach:z};
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
function introSproutPose(t,reduced=titleReducedMotion.matches) {
  const seed=introEase((t-9.95)/.35);
  if(reduced)return {seed,split:1,stem:1,left:1,right:1,sway:0};
  return {seed,split:introEase((t-10.25)/.45),stem:introEase((t-10.4)/1.15),
    left:introEase((t-11.05)/1.15),right:introEase((t-11.22)/1.15),
    sway:Math.sin(Math.max(0,t-12.37)*1.4)*.025*introEase((t-12.37)/.5)};
}
function prepareIntroSproutParts() {
  if(introSproutParts)return introSproutParts;
  if(!introImageReady(introSproutLayer))return null;
  // Runtime sprite masks keep the original painted leaves and seed. Only their
  // transparent cutouts move; the ground and surrounding artwork are untouched.
  const cut=(box,polygon,pivot)=>{
    const [x,y,w,h]=box,c=document.createElement('canvas');c.width=w;c.height=h;
    const p=c.getContext('2d');p.beginPath();
    polygon.forEach(([px,py],i)=>i?p.lineTo(px-x,py-y):p.moveTo(px-x,py-y));
    p.closePath();p.clip();p.drawImage(introSproutLayer,-x,-y);
    return {image:c,x:x-pivot[0],y:y-pivot[1],w,h};
  };
  introSproutParts={
    left:cut([174,378,470,240],[[174,378],[540,378],[644,552],[621,590],[540,618],[174,618]],[621,566]),
    right:cut([636,170,430,432],[[636,170],[1066,170],[1066,560],[703,560],[656,602],[636,560]],[658,572]),
    seedLeft:cut([407,943,162,194],[[407,943],[552,943],[569,996],[535,1071],[518,1137],[407,1137]],[535,1132]),
    seedRight:cut([518,1008,135,129],[[550,1008],[653,1008],[653,1137],[518,1137],[535,1071]],[535,1132])
  };
  return introSproutParts;
}
function introPanoramaSprout(a,t) {
  const pose=introSproutPose(t);if(!pose.seed)return;
  const size=a.H*.024,k=size/958,parts=prepareIntroSproutParts();
  ctx.save();ctx.translate(a.sproutX,a.hy);ctx.globalAlpha=pose.seed;
  // The seed's contact point stays fixed throughout growth and wind motion.
  artOval(0,.1,size*.14,size*.035,'#28322888');
  ctx.shadowColor=ITEM_GLOW.SEMENTE.color;ctx.shadowBlur=5;
  const tip={x:size*(.12*pose.stem+pose.sway),y:-size*(.09+.5*pose.stem)};
  if(pose.stem>0) {
    const stemPath=()=>{ctx.beginPath();ctx.moveTo(0,-size*.055);
      ctx.bezierCurveTo(size*.18*pose.stem,-size*.23*pose.stem,tip.x-size*.07,tip.y+size*.14*pose.stem,tip.x,tip.y);};
    ctx.save();ctx.globalAlpha*=introEase(pose.stem*4);ctx.lineCap='round';
    const ink=ctx.createLinearGradient(-size*.06,0,size*.16,0);
    ink.addColorStop(0,'#697c39');ink.addColorStop(.55,'#98a751');ink.addColorStop(1,'#d4c878');
    stemPath();ctx.strokeStyle=ink;ctx.lineWidth=size*.047;ctx.stroke();
    ctx.shadowBlur=0;stemPath();ctx.strokeStyle='#d6ce8a88';ctx.lineWidth=size*.012;ctx.stroke();ctx.restore();
    const leaf=(side,open)=>{
      // Folded leaves remain attached to the growing tip, opening at staggered
      // times. Their hinge rotates independently instead of stretching the plant.
      const visible=introEase(pose.stem*3),length=.16+.84*open;
      ctx.save();ctx.translate(tip.x,tip.y);ctx.rotate(side<0?(1-open)*1.05:-(1-open)*.55);
      ctx.globalAlpha*=visible;ctx.scale(length*(.38+.62*open),length);
      if(parts){const p=side<0?parts.left:parts.right;ctx.drawImage(p.image,p.x*k,p.y*k,p.w*k,p.h*k);}
      else {titleLeaf(side*size*.19,-size*.07,size*.22,side<0?'#a4b763':'#bdc878',side*.35);}
      ctx.restore();
    };
    leaf(-1,pose.left);leaf(1,pose.right);
  }
  // Two seed shells open slightly in place, in front of the emerging stem.
  for(const side of [-1,1]) {
    ctx.save();ctx.translate(side*size*.018*pose.split,0);ctx.rotate(side*pose.split*.1);
    if(parts){const p=side<0?parts.seedLeft:parts.seedRight;ctx.drawImage(p.image,p.x*k,p.y*k,p.w*k,p.h*k);}
    else artOval(side*size*.036,-size*.05,size*.065,size*.09,side<0?'#aa8051':'#cfab69');
    ctx.restore();
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
