// Illustrated title presentation. Local artwork plus lightweight Canvas layers.
// Input handling and game state remain in title.js; no external assets at runtime.
const titlePainting=new Image();
titlePainting.src='assets/title/cidade-ilustrada.png';
const titleCleanPlate=new Image();titleCleanPlate.src='assets/title/cidade-ceu-limpo.png';
const titleCloudLayer=new Image();titleCloudLayer.src='assets/title/nuvens-camada.png';
const titleHeroLayer=new Image();titleHeroLayer.src='assets/title/monstrinho-camada.png';
const titleTreeLayer=new Image();titleTreeLayer.src='assets/title/arvore-camada.png';
const titleReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let titleCloudSprite=null;
function titleLayersReady() {
  return [titleCleanPlate,titleCloudLayer,titleHeroLayer,titleTreeLayer].every(image=>image.complete&&image.naturalWidth>0);
}
function paintTitleClouds(x,y,iw,ih,time) {
  if(!titleCloudSprite) {
    if(!titleCloudLayer.complete||!titleCloudLayer.naturalWidth)return;
    // Cache a feathered horizon once; no cloud pigment can cover the rooftops.
    titleCloudSprite=document.createElement('canvas');
    titleCloudSprite.width=titleCloudLayer.naturalWidth;
    titleCloudSprite.height=titleCloudLayer.naturalHeight;
    const cloudCtx=titleCloudSprite.getContext('2d'),ch=titleCloudSprite.height;
    cloudCtx.drawImage(titleCloudLayer,0,0);
    cloudCtx.globalCompositeOperation='destination-in';
    const horizon=cloudCtx.createLinearGradient(0,ch*.34,0,ch*.42);
    horizon.addColorStop(0,'#fff');horizon.addColorStop(1,'#ffffff00');
    cloudCtx.fillStyle=horizon;cloudCtx.fillRect(0,0,titleCloudSprite.width,ch);
  }
  const t=titleReducedMotion.matches?0:time;
  // Transparent cloud pigment moves independently of the sky, sun and city.
  // Overscan covers the image edges throughout the drift, without wrap seams.
  const drift=Math.sin(t*.06)*iw*.04;
  ctx.drawImage(titleCloudSprite,x-iw*.07+drift,y-ih*.018,iw*1.14,ih*.86);
}
function paintTitleActors(x,y,iw,ih,t) {
  paintTitleTree(x,y,iw,ih,t);
  paintTitleMascot(x+iw*.673,y+ih*.793,ih*.262,t);
}
function paintTitleTree(x,y,iw,ih,t) {
  const moving=!titleReducedMotion.matches;
  // Real alpha cutouts: transforms affect only the tree or mascot, never scenery.
  const treeH=ih*.365,treeW=treeH*1271/1174;
  ctx.save();ctx.translate(x+iw*.947,y+ih*.793);
  ctx.rotate(moving?Math.sin(t*.95)*.009+Math.sin(t*1.7)*.002:0);
  ctx.scale(moving?1+Math.sin(t*1.25)*.004:1,1);
  ctx.drawImage(titleTreeLayer,22,12,1271,1174,-treeW*.52,-treeH,treeW,treeH);
  ctx.restore();
}
function paintTitleMascot(cx,baseY,heroH,t) {
  const moving=!titleReducedMotion.matches,heroW=heroH*754/1197;
  const breath=moving?Math.sin(t*1.8):0;
  ctx.save();ctx.translate(cx,baseY);
  artOval(0,0,heroW*.42,heroH*.022,'#263a2d55');
  ctx.rotate(moving?Math.sin(t*.75)*.003:0);
  ctx.scale(1+breath*.006,1-breath*.012);
  ctx.drawImage(titleHeroLayer,149,94,754,1197,-heroW/2,-heroH,heroW,heroH);
  ctx.restore();
}
function titleVine(x,y,length,color,t=0) {
  const sway=Math.sin(t)*2;
  artLine([[x,y],[x+6+sway,y-length*.45],[x+23+sway,y-length]],color,2);
  for(let i=0;i<4;i++) {
    const side=i%2?-1:1,ly=y-12-i*length/5,lx=x+3+i*4+sway;
    titleLeaf(lx+side*6,ly,8-i*.7,color,side*.8-.3);
    artLine([[lx,ly+5],[lx+side*8,ly-1]],'#dfdca566',.8);
  }
}
function titleArtworkLayout(l) {
  const {w,h}=l;
  const regionY=l.portrait?h*.3:0,regionH=h-regionY;
  const scale=Math.max(w/titlePainting.naturalWidth,regionH/titlePainting.naturalHeight)*1.025;
  const iw=titlePainting.naturalWidth*scale,ih=titlePainting.naturalHeight*scale;
  const x=l.portrait?w*.68-iw*.68:(w-iw)/2;
  const y=regionY+(regionH-ih)/2;
  return {x,y,iw,ih,regionY,regionH};
}
function paintIllustratedTitle(l,time,options={}) {
  if(!titlePainting.complete||!titlePainting.naturalWidth)return false;
  const t=titleReducedMotion.matches?0:time,{w,h}=l;
  artRect(0,0,w,h,'#292b3b');
  const {x,y,iw,ih,regionY,regionH}=titleArtworkLayout(l);
  // Load the layers atomically; use the original still if any asset fails.
  if(titleLayersReady()) {
    ctx.drawImage(titleCleanPlate,x,y,iw,ih);
    paintTitleClouds(x,y,iw,ih,t);
    if(options.actors!==false)paintTitleActors(x,y,iw,ih,t);
  } else ctx.drawImage(titlePainting,x,y,iw,ih);

  if(l.portrait) {
    const blend=ctx.createLinearGradient(0,h*.24,0,h*.61);
    blend.addColorStop(0,'#292b3b');blend.addColorStop(.35,'#292b3b');blend.addColorStop(1,'rgba(41,43,59,0)');
    ctx.fillStyle=blend;ctx.fillRect(0,0,w,h*.61);
  }
  const shade=ctx.createLinearGradient(0,0,w,0);
  shade.addColorStop(0,'rgba(17,27,34,.38)');shade.addColorStop(.38,'rgba(20,28,37,.15)');shade.addColorStop(.62,'rgba(20,28,37,0)');
  ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  // Animated mist uses soft gradients instead of opaque geometric cloud shapes.
  for(let i=0;i<4;i++) {
    const cx=((i*w*.4+t*(3+i))%(w+400))-200,cy=regionY+regionH*(.14+i*.07);
    const mist=ctx.createRadialGradient(cx,cy,0,cx,cy,210);
    mist.addColorStop(0,i%2?'rgba(245,206,161,.055)':'rgba(49,47,65,.08)');mist.addColorStop(1,'rgba(110,100,115,0)');
    ctx.save();ctx.translate(0,cy);ctx.scale(1,.3);ctx.translate(0,-cy);
    ctx.fillStyle=mist;ctx.fillRect(cx-210,cy-210,420,420);ctx.restore();
  }
  // A warm, slow bloom over the painted sunset; no flashing.
  const sunX=x+iw*.81,sunY=y+ih*.24;
  const light=ctx.createRadialGradient(sunX,sunY,10,sunX,sunY,180);
  light.addColorStop(0,`rgba(255,214,153,${.035+Math.sin(t*.4)*.015})`);light.addColorStop(1,'rgba(255,214,153,0)');
  ctx.fillStyle=light;ctx.fillRect(sunX-180,sunY-180,360,360);
  for(let i=0;i<22;i++) {
    const px=((artNoise(i+62)*w+t*(3+i%3))%(w+20))-10;
    const py=regionY+artNoise(i+40)*regionH+Math.sin(t*.5+i)*9;
    ctx.save();ctx.globalAlpha=.12+Math.sin(t*.7+i)**2*.22;
    artOval(px,py,.7+artNoise(i),.7+artNoise(i),'#ffe0a2');ctx.restore();
  }
  for(let i=0;i<7;i++) {
    const px=((i*w/7+t*(10+i))%(w+80))-40,py=regionY+regionH*(.15+artNoise(i+90)*.7)+Math.sin(t*.6+i)*19;
    ctx.save();ctx.globalAlpha=.55;
    titleLeaf(px,py,4+artNoise(i+9)*4,'#c2c87c',Math.sin(t*.65+i)*.6+i);ctx.restore();
  }
  const bottom=ctx.createLinearGradient(0,h-95,0,h);
  bottom.addColorStop(0,'rgba(14,26,32,0)');bottom.addColorStop(1,'rgba(14,26,32,.62)');ctx.fillStyle=bottom;ctx.fillRect(0,h-95,w,95);
  return true;
}
function paintedTitleLogo(l) {
  const x=l.portrait?42:84,y=112,maxWidth=l.portrait?l.w-84:410;
  typeText('UMA CIDADE. UMA NOVA CHANCE.',x,y-60,{role:'label',size:14,color:'#dedcbb',maxWidth});
  ctx.save();ctx.translate(x,y);ctx.rotate(-.035);
  ctx.lineJoin='round';ctx.strokeStyle='#263039';ctx.lineWidth=5;
  ctx.shadowColor='#14262a99';ctx.shadowBlur=8;ctx.shadowOffsetY=5;
  typeText('TECHNO',0,0,{role:'display',size:67,italic:true,color:'#f6e5b9',maxWidth,outline:true,minSize:48});
  const green=ctx.createLinearGradient(0,18,0,75);green.addColorStop(0,'#e0e9a9');green.addColorStop(1,'#9fca7d');
  typeText('MONSTER',-4,69,{role:'display',size:70,italic:true,color:green,maxWidth,outline:true,minSize:48});ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  artLine([[5,88],[maxWidth*.4,86],[maxWidth*.75,90],[maxWidth-12,80]],'#c4cf91',2);
  titleVine(maxWidth+8,84,54,'#c7db97',titleReducedMotion.matches?0:performance.now()/2000);ctx.restore();
  typeParagraph('Pequeno monstro. Grande transformação.',x,y+120,maxWidth,{size:18,color:'#eee1c3',lineHeight:25});
}
function paintedButtonPath(b,inset=0) {
  const x=b.x+inset,y=b.y+inset,w=b.w-inset*2,h=b.h-inset*2;
  ctx.beginPath();ctx.moveTo(x+8,y);ctx.lineTo(x+w-18,y+1);ctx.lineTo(x+w,y+h/2);
  ctx.lineTo(x+w-18,y+h-1);ctx.lineTo(x+5,y+h);ctx.quadraticCurveTo(x-2,y+h/2,x+8,y);ctx.closePath();
}
function paintedTitleButton(b,label,selected,amount,index) {
  const pressed=titleUI.pending!==null&&(gameState!=='MENU'||index===menuOption);
  const shift=pressed?2:amount*5,t=titleReducedMotion.matches?0:performance.now()/1000;
  ctx.save();ctx.translate(shift,pressed?2:0);
  ctx.shadowColor='#101c29aa';ctx.shadowBlur=selected?14:6;ctx.shadowOffsetY=4;
  const fill=ctx.createLinearGradient(0,b.y,0,b.y+b.h);
  fill.addColorStop(0,selected?'#d5e5a0':'#354d50');fill.addColorStop(1,selected?'#a6c980':'#243c43');
  ctx.fillStyle=fill;paintedButtonPath(b);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.strokeStyle=selected?'#e2e6ae':'#8b987777';ctx.lineWidth=selected?1.8:1;ctx.stroke();
  paintedButtonPath(b,4);ctx.strokeStyle=selected?'#6f925866':'#c4c6a12b';ctx.lineWidth=.8;ctx.stroke();
  ctx.save();paintedButtonPath(b,3);ctx.clip();
  // Fixed brush-grain marks, stable across frames rather than flickering noise.
  for(let i=0;i<85;i++) {
    const px=b.x+artNoise(i+index*27)*b.w,py=b.y+artNoise(i+81)*b.h;
    artLine([[px,py],[px+3+artNoise(i+7)*10,py-1]],selected?'#f0f1bf19':'#c4ceb00c',.8);
  }
  if(selected){const gx=b.x+((t*35)%(b.w+100))-50,g=ctx.createLinearGradient(gx-30,0,gx+30,0);g.addColorStop(0,'#ffffff00');g.addColorStop(.5,'#ffffde12');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(b.x,b.y,b.w,b.h);}
  ctx.restore();
  titleVine(b.x-9,b.y+b.h-1,selected?53:39,selected?'#c4df8d':'#91ac79',t*.8+index);
  typeText(label,b.x+34,b.y+b.h/2+8,{role:'button',size:22,color:selected?'#243e38':'#eee2c5',maxWidth:b.w-80});
  if(selected){const ax=b.x+b.w-32;ctx.fillStyle='#31564a';ctx.beginPath();ctx.moveTo(ax,b.y+17);ctx.lineTo(ax+9,b.y+b.h/2);ctx.lineTo(ax,b.y+b.h-17);ctx.fill();}
  if(pressed){ctx.save();ctx.globalAlpha=.18;paintedButtonPath(b);ctx.fillStyle='#fffbd7';ctx.fill();ctx.restore();}
  ctx.restore();
}
