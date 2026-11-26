// TESTE ESTILO 1 — cidade ilustrada ao entardecer.
// Alternative to art.js: load only one style file in index.html.
// Warm plaster, ceramic roofs, violet atmospheric layers and botanical details.
// Rendering only: world coordinates and collision boxes belong to the simulation.
const ART = { ink: '#38374e', paper: '#fff0d5', mint: '#a8df9b', teal: '#638f8e', copper: '#dc936e' };
// Accessibility requirement: blue = eat, red = damage, orange = collect,
// green = seeds and planting beds. Preserve these semantic cues in future art edits.
// These cues must remain visible regardless of proximity or environmental palette.
const ITEM_GLOW = {
  RECICLAVEL: { color: '#38bdf8', blur: 12 },
  ELETRONICO: { color: '#f97316', blur: 14 },
  SEMENTE: { color: '#22c55e', blur: 12 },
  CANTEIRO: { color: '#22c55e', blur: 12 }
};
const DAMAGE_GLOW = { color: '#ef4444', blur: 14 };
let visualClean = 0;
let artClock = 0;
function artRect(x,y,w,h,color,r=0) {
  ctx.fillStyle=color; ctx.beginPath();
  if(r && ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h);
  ctx.fill();
}
function artLine(points,color,width=2) {
  ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p)); ctx.stroke();
}
function artOval(x,y,rx,ry,color) {
  ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
}
function artText(text,x,y,size=12,color=ART.paper,align='left') {
  ctx.fillStyle=color; ctx.font=`600 ${size}px "Trebuchet MS", sans-serif`; ctx.textAlign=align; ctx.fillText(text,x,y); ctx.textAlign='left';
}
function artNoise(n) { return ((Math.sin(n*127.1+311.7)*43758.5453)%1+1)%1; }
function paintCity() {
  if(gameState==='PLAYING') { artClock++; visualClean+=(Math.min(1,totalCleanActions/120)-visualClean)*0.012; }
  const c=visualClean, t=artClock, horizon=GROUND_Y;
  const sky=ctx.createLinearGradient(0,0,0,horizon);
  sky.addColorStop(0,interpolateColor('#101b28','#78b9c3',c));
  sky.addColorStop(.65,interpolateColor('#303e49','#b8d8c0',c));
  sky.addColorStop(1,interpolateColor('#67685b','#ffe6b0',c));
  ctx.fillStyle=sky; ctx.fillRect(0,0,canvas.width,canvas.height);
  const sunX=canvas.width*.76, sunY=Math.max(115,horizon*.28);
  const glow=ctx.createRadialGradient(sunX,sunY,40,sunX,sunY,160);
  glow.addColorStop(0,'rgba(244,213,162,.22)'); glow.addColorStop(1,'rgba(244,213,162,0)');
  ctx.save();ctx.globalAlpha=.12+c*.88;
  ctx.fillStyle=glow; ctx.fillRect(sunX-160,sunY-160,320,320);
  artOval(sunX,sunY,47,47,'#ffe4b5');
  ctx.restore();
  // Long painted cloud banks, with a slow drift independent of world generation.
  for(let i=0;i<7;i++) {
    const x=((i*337-t*.09)%(canvas.width+400)+canvas.width+400)%(canvas.width+400)-200;
    const y=75+artNoise(i)*Math.max(80,horizon*.32);
    ctx.save(); ctx.globalAlpha=.38;
    ctx.fillStyle=interpolateColor('#59615d','#f8dac6',c); ctx.beginPath();
    ctx.moveTo(x-110,y+12); ctx.bezierCurveTo(x-120,y-4,x-77,y-17,x-51,y-10);
    ctx.bezierCurveTo(x-36,y-48,x+12,y-44,x+33,y-16);
    ctx.bezierCurveTo(x+75,y-25,x+100,y-9,x+115,y+12);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // Broad smog banks disperse as the existing cleanup score increases.
  ctx.save();ctx.globalAlpha=(1-c)*.65;
  for(let i=0;i<10;i++) {
    const span=canvas.width+600,x=((i*span/10+t*.12)%span)-300;
    const y=55+artNoise(i+45)*Math.max(100,horizon*.48);
    artOval(x,y,180+artNoise(i)*100,25+artNoise(i+9)*22,'#27343c');
    artOval(x+70,y-15,100,30,'#2d3940');
  }
  ctx.restore();
  // Continuous deterministic architecture avoids seams when parallax wraps.
  for(let layer=0;layer<3;layer++) {
    const step=[170,195,230][layer], offset=distance*[.32,.85,1.65][layer];
    const start=Math.floor(offset/step)-1;
    for(let i=start;i<(offset+canvas.width)/step+1;i++) {
      const x=i*step-offset, n=artNoise(i+layer*90), w=step-14;
      const h=[170,155,160][layer]+n*[140,150,125][layer];
      const y=horizon-h;
      const facade=['#b88586','#d3a285','#8baca1','#c8b39a'][Math.floor(n*4)];
      const shade=[interpolateColor('#35444d','#9bc3bc',c),interpolateColor('#344349','#8db4a9',c),interpolateColor('#46504c',facade,c)][layer];
      artRect(x,y,w,h,shade,5);
      // Terracotta pitched roofs and plaster cornices, no background signage.
      ctx.fillStyle=layer===2?interpolateColor('#26373e','#865f70',c):shade; ctx.beginPath();
      ctx.moveTo(x-6,y);ctx.lineTo(x+w*.35,y-25-n*18);ctx.lineTo(x+w+6,y);ctx.closePath();ctx.fill();
      artRect(x-4,y,w+8,6,layer===2?interpolateColor('#788071','#f0c9ab',c):shade,2);
      if(layer===0) { artRect(x+w*.5,y-32,3,24,shade); continue; }
      artRect(x+w-22,y+6,20,h-6,'rgba(9,32,42,.18)');
      artRect(x+12,y+12,w-42,4,'rgba(239,222,184,.15)');
      for(let row=0;row<Math.floor((h-40)/39);row++) {
        for(let col=0;col<Math.floor((w-32)/28);col++) {
          const wx=x+16+col*28, wy=y+30+row*39;
          const lit=artNoise(i*31+row*7+col)>.52;
          artRect(wx-3,wy-3,18,27,layer===2?interpolateColor('#7a8270','#ecd1b4',c):shade,7);
          artRect(wx,wy,12,21,lit?interpolateColor('#b6ad76','#f3d4a2',c):interpolateColor('#25373e','#59657a',c),6);
          artRect(wx,wy+17,15,3,'rgba(9,28,35,.28)');
          if(lit) artRect(wx+2,wy+2,3,15,interpolateColor('#cfbf8a','#fff1cf',c));
        }
      }
      if(layer===2) {
        if(n>.78) {
          // A sawtooth workshop roof breaks the apartment-block silhouette.
          artRect(x+w-62,y-50,28,43,interpolateColor('#515852','#b7908d',c),3);
          artRect(x+w-66,y-52,36,7,interpolateColor('#7b8071','#eed1b5',c),2);
          // Emissions are visual only: fixed count, no random gameplay calls.
          for(let puff=0;puff<6;puff++) {
            const age=(t*.0018+puff/6+n)%1;
            ctx.save();ctx.globalAlpha=(1-c)*Math.sin(age*Math.PI)*.3;
            artOval(x+w-48+age*75,y-58-age*135,9+age*39,7+age*22,'#25343b');ctx.restore();
          }
        }
        // Water tanks, ventilation stacks, exterior plumbing and shop awnings.
        artLine([[x+w-12,y+10],[x+w-12,horizon-12]],'#bda18f',3);
        artRect(x+17,horizon-54,65,54,'#596674',22);
        artRect(x+12,horizon-60,80,10,'#7d9b91',2);
        for(let a=0;a<5;a++) artRect(x+13+a*16,horizon-60,8,10,'#f7d9b3');
        // Small facade planters make the neighborhood feel inhabited.
        for(let pot=0;pot<3;pot++) {
          const px=x+110+pot*22;
          artRect(px,horizon-28,15,16,'#a66f66',3);
          artOval(px+7,horizon-32,10,7,interpolateColor('#5a6045','#648d7a',c));
          artOval(px+4,horizon-37,6,6,interpolateColor('#72704f','#91ac83',c));
        }
        if(n<.4) {
          for(let floor=1;floor<4;floor++) {
            const by=horizon-floor*65;
            // Entire railing must fit below this building's cornice.
            if(by-15<y+12) continue;
            artRect(x+100,by,70,4,'#153640');
            artLine([[x+103,by],[x+103,by-15],[x+166,by-15],[x+166,by]],'#87a399',1);
            for(let k=114;k<166;k+=12) artLine([[x+k,by],[x+k,by-15]],'#87a399',1);
          }
        }
        // Facades regain color with revitalization, without dirt overlays.
        if(c>.05) {
          ctx.save(); ctx.globalAlpha=c;
          for(let leaf=0;leaf<10;leaf++) {const ly=y+10+leaf*9;artLine([[x+8,ly],[x+8,ly+9]],'#689c73',2);artOval(x+8+(leaf%2?4:-4),ly,5,3,'#95bb80');}
          ctx.restore();
        }
      }
    }
  }
  // Distant birds are atmospheric silhouettes, never obstacles.
  for(let i=0;i<4;i++) {
    const bx=((canvas.width*.3+i*38+t*.13)%(canvas.width+80))-40,by=130+i%2*17;
    const wing=Math.sin(t*.045+i)*3;
    artLine([[bx-5,by+wing],[bx,by+2],[bx+5,by+wing]],'#355665',1);
  }
  // Quayside lamps and cable silhouettes add a human scale to the city.
  const off=distance*2.7;
  for(let i=Math.floor(off/440)-1;i<(off+canvas.width)/440+1;i++) {
    const x=i*440-off;
    artLine([[x,horizon],[x,horizon-170],[x+28,horizon-184],[x+54,horizon-184]],'#575266',4);
    artRect(x+42,horizon-183,24,28,'#575266',7);
    artRect(x+46,horizon-179,16,19,'#ffe7b8',5);
    artOval(x+54,horizon-179,9,3,ART.paper);
    ctx.save(); ctx.globalAlpha=.045; ctx.fillStyle=ART.paper; ctx.beginPath(); ctx.moveTo(x+48,horizon-177); ctx.lineTo(x-12,horizon); ctx.lineTo(x+120,horizon); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  let sea=null;
  for(const seg of groundSegments) {
    if(seg.x>canvas.width || seg.x+seg.width<0) continue;
    const x=seg.x,w=seg.width;
    if(seg.type==='ASPHALT') {
      artRect(x,horizon,w,canvas.height-horizon,interpolateColor('#212e32','#655e72',c));
      artRect(x,horizon,w,10,interpolateColor('#8b927b','#e3ccb0',c)); artRect(x,horizon+10,w,7,interpolateColor('#515c53','#ae978e',c));
      ctx.save();ctx.beginPath();ctx.rect(x,horizon,w,canvas.height-horizon);ctx.clip();
      for(let row=0;row<4;row++) for(let k=-40;k<w;k+=64) {
        artRect(x+k+(row%2)*32,horizon+22+row*22,59,17,interpolateColor(row%2?'#37423f':'#3e4843',row%2?'#766b7b':'#7f7180',c),5);
      }
      ctx.globalAlpha=(1-c)*.8;
      // Segment-relative stains travel with the street, not the camera.
      for(let k=16;k<w;k+=83) {
        const seed=k+seg.width,dy=horizon+18+artNoise(seed)*70;
        artOval(x+k,dy,18+artNoise(seed+1)*24,4+artNoise(seed+2)*8,'#172c2b');
        artOval(x+k+12,dy+2,11,3,'#4b5039');
        artLine([[x+k-8,dy-1],[x+k+4,dy-2]],'#646d53',1);
        artRect(x+k+33,dy+9,5,2,'#9a9478',1);
      }
      ctx.restore();
    } else {
      sea=seg.seaType;
      const water=ctx.createLinearGradient(0,horizon,0,canvas.height);
      water.addColorStop(0,sea==='MEGA'?'#438e9c':'#5d9a80'); water.addColorStop(1,'#123d4b');
      ctx.fillStyle=water; ctx.fillRect(x,horizon,w,canvas.height-horizon);
      ctx.save(); ctx.beginPath(); ctx.rect(x,horizon-5,w,canvas.height-horizon+5); ctx.clip();
      for(let row=0;row<5;row++) for(let k=Math.floor(x/65)*65;k<x+w;k+=65) {
        const yy=horizon+row*19+Math.sin(t*.025+k*.025+row)*3;
        artLine([[k+Math.sin(t*.01+row)*9,yy],[k+31,yy]],row===0?'#b1d6b0':'#58968e',row===0?3:1);
      }
      ctx.restore();
    }
  }
  // Small windborne flecks, no random spawning and no gameplay state changes.
  for(let i=0;i<16;i++) {
    const x=((artNoise(i+200)*canvas.width-t*(.15+artNoise(i)))%canvas.width+canvas.width)%canvas.width;
    const y=90+artNoise(i+30)*Math.max(1,horizon-130)+Math.sin(t*.012+i)*8;
    ctx.save(); ctx.globalAlpha=.25; artOval(x,y,2,1,interpolateColor('#303a38',ART.paper,c)); ctx.restore();
  }
  if(sea) {
    artRect(canvas.width/2-143,canvas.height-34,286,25,'#102d35dd',12);
    artText(sea==='MEGA'?'ÁGUAS TÓXICAS / TRAVESSIA ESPECIAL':'ÁGUAS TÓXICAS / MANTENHA-SE NO ALTO',canvas.width/2,canvas.height-17,10,ART.paper,'center');
  }
}
function paintPlatforms() {
  for(const p of platforms) {
    const x=p.x,y=p.y,w=p.width,h=GAME_CONFIG.PLATFORM_HEIGHT;
    artRect(x,y,w,h,ART.ink,3); artRect(x+2,y+2,w-4,6,'#ead4af',2);
    artRect(x+3,y+9,w-6,h-12,'#a9847d');
    for(let k=18;k<w-16;k+=36) artLine([[x+k,y+10],[x+k,y+h-4]],'#735d6b',2);
    artRect(x+7,y+2,24,4,ART.copper); artRect(x+w-31,y+2,24,4,ART.copper);
    for(const k of [6,w-8]) artOval(x+k,y+14,2,2,ART.paper);
  }
}
function paintItemIcon(type,x,y,v=0) {
  ctx.save(); ctx.translate(x,y);
  if(type==='RECICLAVEL') {
    if(v===0) { artRect(-7,-8,14,22,ART.ink,4); artRect(-5,-7,10,18,'#75c8bd',3); artRect(-4,-14,8,7,ART.paper,2); artRect(-5,0,10,7,'#e9d8ac'); artLine([[-2,-5],[-2,-1]],'#d1eee0',2); }
    else if(v===1) { artRect(-9,-12,18,26,ART.ink,4); artRect(-7,-10,14,22,ART.copper,3); artRect(-7,-10,14,3,ART.paper,2); artLine([[-3,-3],[3,0],[-3,4]],ART.paper,2); artRect(-7,9,14,3,'#9eafaa'); }
    else { artRect(-12,-11,24,25,ART.ink,2); artRect(-10,-9,20,21,'#cda575'); artLine([[0,-9],[0,12]],'#efd1a0',4); artLine([[-7,4],[-3,4]],ART.ink,2); }
  } else if(type==='ELETRONICO') {
    artRect(-13,-14,26,28,ART.ink,4); artRect(-10,-11,20,21,'#8a9e92',2);
    if(v===1) { artRect(-7,-7,14,13,'#3f7971'); for(let k=-5;k<8;k+=6) artLine([[k,-7],[k,5]],'#d6bc78',1); artRect(-3,-3,7,7,ART.ink); }
    else { artRect(-7,-8,14,13,'#315967',2); artLine([[-5,1],[-1,-4],[3,1],[6,-2]],'#c0d7aa',1); }
    artOval(0,11,2,2,ART.copper);
  } else if(type==='SEMENTE') {
    artOval(0,6,7,9,ART.ink); artOval(0,5,5,7,'#c39b6c');
    artLine([[0,3],[0,-9]],ART.mint,2); artOval(-5,-8,6,3,'#79b987'); artOval(5,-13,6,4,ART.mint);
  }
  ctx.restore();
}
function paintItems() {
  for(const item of items) {
    const x=item.x,y=item.y;
    ctx.save();
    const glow=ITEM_GLOW[item.type];
    if(item.type==='CANTEIRO') {
      ctx.shadowColor=glow.color; ctx.shadowBlur=glow.blur;
      artRect(x-25,y,50,20,ART.ink,3); artRect(x-23,y+2,46,5,'#d6ad7f',2); artRect(x-21,y+7,42,10,'#795744',2);
      artLine([[x-12,y+6],[x-9,y+10],[x-3,y+6],[x+5,y+10],[x+13,y+6]],'#b8855c',2);
    } else {
      const bob=Math.sin(artClock*.055+x*.008)*3;
      artOval(x,y+17,13,3,'#102d3544');
      if(glow) { ctx.shadowColor=glow.color; ctx.shadowBlur=glow.blur; }
      paintItemIcon(item.type,x,y+bob,item.variant);
    }
    ctx.restore();
    if(isPlayerNearItem(item)) {
      const label={RECICLAVEL:'C · RECICLAR',ELETRONICO:'X · GUARDAR',SEMENTE:'SEMENTE',CANTEIRO:'Y · PLANTAR'}[item.type];
      artRect(x-49,y-46,98,20,ART.ink,7); artText(label,x,y-32,10,ART.paper,'center');
    }
  }
}
function paintObstacles() {
  for(const o of obstacles) {
    const x=o.x,y=o.y,w=o.width,h=o.height;
    ctx.save();
    ctx.shadowColor=DAMAGE_GLOW.color; ctx.shadowBlur=DAMAGE_GLOW.blur;
    if(o.isAerial) {
      ctx.save(); ctx.translate(x+w/2,y+h/2); ctx.rotate(Math.sin(artClock*.05+x)*.035);
      artLine([[-18,-8],[18,-8]],ART.ink,5);
      for(const side of [-1,1]) {
        artRect(side*17-3,-17,6,11,'#bdbaa1',2);
        artOval(side*17,-17,10,2,'#a4c1ba');
        artLine([[side*17-9*Math.cos(artClock*.7),-18],[side*17+9*Math.cos(artClock*.7),-18]],ART.paper,2);
      }
      artRect(-15,-10,30,25,ART.ink,10); artRect(-12,-8,24,15,'#d9d7ba',8);
      artRect(-11,0,22,8,'#37545a',3); artOval(4,3,4,4,ART.copper); artOval(5,2,1.5,1.5,ART.paper);
      artLine([[-9,14],[-12,20]],ART.ink,3); artLine([[9,14],[12,20]],ART.ink,3);
      ctx.restore();
    } else {
      artOval(x+w/2,y+h+2,w*.45,4,'#102d3544');
      artRect(x,y,w,h,ART.ink,6); artRect(x+3,y+2,w-6,h-4,'#927e53',5);
      artRect(x+5,y+5,w-10,5,'#c8bb89',2); artRect(x+3,y+h-10,w-6,5,'#435f5b',2);
      artRect(x+w*.35,y+15,w*.3,19,ART.ink,2);
      artLine([[x+w*.5,y+19],[x+w*.5,y+25]],ART.copper,3); artOval(x+w*.5,y+30,1.5,1.5,ART.copper);
      for(let k=0;k<3;k++) { const rise=(artClock*.35+k*13)%35; ctx.save(); ctx.globalAlpha=(1-rise/35)*.25; artOval(x+w*.5+Math.sin(artClock*.03+k)*8,y-rise,3+rise*.1,3+rise*.15,ART.mint); ctx.restore(); }
    }
    ctx.restore();
  }
}
function paintTrees() {
  for(const tree of trees) {
    const x=tree.x,y=GROUND_Y,sway=Math.sin(artClock*.018+x*.003)*3;
    artOval(x,y+2,40,6,'#102d3544');
    artLine([[x-8,y],[x-3,y-87],[x+sway,y-134]],'#4d5745',12);
    artLine([[x-3,y-62],[x-25+sway,y-102]],'#4d5745',6);
    for(const [dx,dy,r] of [[-29,-112,29],[28,-119,31],[0,-153,36],[0,-114,35]]) {
      artOval(x+dx+sway,y+dy,r,r*.87,'#24594e');
      artOval(x+dx+sway-4,y+dy-6,r*.85,r*.7,'#57936b');
      artOval(x+dx+sway-9,y+dy-14,r*.55,r*.4,'#91bb7e');
    }
    artLine([[x-8,y-5],[x-5,y-57]],'#9caa78',2);
  }
}
function paintEcoponto() {
  if(!ecopontoBuilding) return;
  const {x,width:w,height:h}=ecopontoBuilding,y=GROUND_Y-h;
  artRect(x,y,w,h,ART.ink,6); artRect(x+5,y+7,w-10,h-12,'#447e72',3);
  for(let k=15;k<w;k+=18) artRect(x+k,y+9,2,h-20,'#345f59');
  artRect(x-8,y-9,w+16,17,'#bed0ad',4); artRect(x+14,y+25,w-28,50,ART.ink,5);
  artText('ECOPONTO',x+w/2,y+47,17,ART.paper,'center'); artText('RECUPERAR / RENOVAR',x+w/2,y+64,8,ART.mint,'center');
  artRect(x+24,y+95,w-48,h-105,ART.ink,8); artRect(x+31,y+104,w-62,49,'#88aaa0',4);
  artLine([[x+45,y+130],[x+65,y+116],[x+87,y+130]],ART.ink,4);
  artRect(x+45,y+173,w-90,10,'#b4d59e',3);
  artOval(x+w-19,y+90,4,4,ART.mint); artRect(x-6,GROUND_Y-9,w+12,9,'#a9b39b',2);
}
function paintPlayer(p) {
  if(p.invulnerableTimer>0 && Math.floor(p.invulnerableTimer/4)%2===0) return;
  let floor=GROUND_Y;
  for(const platform of platforms) if(p.x+p.width>platform.x && p.x<platform.x+platform.width && p.y+p.height<=platform.y+12) floor=Math.min(floor,platform.y);
  const shadow=Math.max(.25,1-(floor-p.y-p.height)/220);
  artOval(p.x+28,floor,23*shadow,4*shadow,'#102d3555');
  const run=p.isGrounded?Math.sin(artClock*.32):0;
  ctx.save(); ctx.translate(p.x+28,p.y+p.height);
  ctx.rotate(p.isGrounded?.025*run:Math.max(-.22,Math.min(.22,p.velocityY*.016)));
  ctx.scale(p.scaleX,p.scaleY); ctx.translate(-28,-72);
  // Original mascot: a single rounded body, no limbs or clothing.
  // Keep its green palette, pale belly, red iris and yellow antenna.
  const body=ctx.createLinearGradient(0,0,0,72);
  body.addColorStop(0,'#4ade80'); body.addColorStop(1,'#15803d');
  artRect(0,0,56,72,body, [22,22,12,12]);
  ctx.strokeStyle='#14532d'; ctx.lineWidth=2;
  ctx.stroke();
  artLine([[7,25],[7,48]],'#86efac',2);
  artOval(28,42,18,14,'#86efac');
  artOval(36,20,17,17,'#14532d'); artOval(36,20,16,16,'#ffffff');
  if(Math.sin(artClock*.035)>.985) {
    ctx.strokeStyle='#0f172a'; ctx.lineWidth=3; ctx.beginPath();
    ctx.arc(36,20,10,0,Math.PI); ctx.stroke();
  } else {
    artOval(39,20,8,8,'#ef4444'); artOval(40,20,3.5,3.5,'#000000');
    artOval(36,17,3,3,'#ffffff');
  }
  ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(32,40,14,0,Math.PI); ctx.fill();
  artRect(23,40,5,7,'#ffffff',1); artRect(36,40,5,7,'#ffffff',1);
  ctx.fillStyle='#f59e0b'; ctx.beginPath();
  ctx.moveTo(10,4); ctx.lineTo(-2,-14); ctx.lineTo(18,0); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function paintParticles() {
  for(const p of particles) {
    ctx.save(); ctx.globalAlpha=Math.max(0,p.life); ctx.translate(p.x,p.y); ctx.rotate(p.life*3);
    artRect(-p.size/2,-p.size/4,p.size,p.size*.5,p.color,2);
    if(p.size>6) { ctx.globalAlpha*=.5; artRect(-1,-p.size,2,p.size*2,ART.paper,1); }
    ctx.restore();
  }
}
function paintHUD() {
  const compact=canvas.width<1000, pad=compact?10:22;
  const w=Math.max(1,canvas.width-pad*2), top=12;
  artRect(pad,top,w,compact?89:60,'#102d35ee',12);
  artRect(pad+12,top+12,3,34,ART.mint,2);
  artText(playerName||'JOGADOR',pad+24,top+23,11,ART.mint);
  artText(String(scoreBase+Math.floor(distance)).padStart(5,'0'),pad+24,top+45,23,ART.paper);
  const base=compact?pad+15:pad+Math.max(160,w*.28), yy=compact?top+75:top+36;
  artText('VIDAS',base,yy-13,8,'#91b4ae');
  for(let i=0;i<3;i++) { artOval(base+5+i*16,yy-1,5,5,i<lives?ART.copper:'#34555b'); }
  const gap=compact?Math.max(65,(w-90)/4):Math.max(85,(w-260)/4);
  artText(`FASE ${String(phase).padStart(2,'0')}`,base+gap,yy,11);
  artText(`CARGA ${eWasteInBag}`,base+gap*2,yy,11);
  artText(`SEMENTES ${seedsInBag}`,base+gap*3,yy,11);
  artRect(canvas.width-110,12,80,32,'#315b61',8); artText('II   P',canvas.width-70,33,13,ART.paper,'center');
  const barW=Math.min(180,w*.27);
  artRect(pad,compact?108:80,barW,4,'#183e46',2); artRect(pad,compact?108:80,barW*Math.min(1,totalCleanActions/120),4,ART.mint,2);
  artText('CIDADE EM REGENERAÇÃO',pad,compact?125:97,8,'#dfdfc0');
}
