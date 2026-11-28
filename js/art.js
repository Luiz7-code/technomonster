// Visual language: ink outlines, oxidized copper, sea glass and warm paper.
// Rendering only: world coordinates and collision boxes belong to the simulation.
const ART = { ink: '#102d35', paper: '#f5e7be', mint: '#a8df9b', teal: '#368b89', copper: '#d98d61' };
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
  typeText(text,x,y,{size:Math.max(14,size),color,align,role:size>=24?'section':'body'});
}
function artNoise(n) { return ((Math.sin(n*127.1+311.7)*43758.5453)%1+1)%1; }
function paintCity() {
  if(gameState==='PLAYING') { artClock++; visualClean+=(Math.min(1,totalCleanActions/120)-visualClean)*0.012; }
  const c=visualClean, t=artClock, horizon=GROUND_Y;
  const sky=ctx.createLinearGradient(0,0,0,horizon);
  sky.addColorStop(0,interpolateColor('#182f46','#487f92',c));
  sky.addColorStop(.65,interpolateColor('#687b80','#9bc5b4',c));
  sky.addColorStop(1,interpolateColor('#d9a885','#f3d9a2',c));
  ctx.fillStyle=sky; ctx.fillRect(0,0,canvas.width,canvas.height);
  const sunX=canvas.width*.76, sunY=Math.max(115,horizon*.28);
  const glow=ctx.createRadialGradient(sunX,sunY,40,sunX,sunY,160);
  glow.addColorStop(0,'rgba(244,213,162,.22)'); glow.addColorStop(1,'rgba(244,213,162,0)');
  ctx.fillStyle=glow; ctx.fillRect(sunX-160,sunY-160,320,320);
  artOval(sunX,sunY,59,59,'#f0c79a');
  // Long painted cloud banks, with a slow drift independent of world generation.
  for(let i=0;i<7;i++) {
    const x=((i*337-t*.09)%(canvas.width+400)+canvas.width+400)%(canvas.width+400)-200;
    const y=75+artNoise(i)*Math.max(80,horizon*.32);
    ctx.save(); ctx.globalAlpha=.12; artOval(x,y,150,12,ART.paper); artOval(x+70,y-9,80,15,ART.paper); ctx.restore();
  }
  // Continuous deterministic architecture avoids seams when parallax wraps.
  for(let layer=0;layer<3;layer++) {
    const step=[150,210,260][layer], offset=distance*[.32,.85,1.65][layer];
    const start=Math.floor(offset/step)-1;
    for(let i=start;i<(offset+canvas.width)/step+1;i++) {
      const x=i*step-offset, n=artNoise(i+layer*90), w=step-14;
      const h=[130,205,265][layer]+n*[170,150,100][layer];
      const y=horizon-h;
      const shade=[interpolateColor('#697d87','#7fa7a4',c),interpolateColor('#3f5e6b','#5c8d89',c),interpolateColor('#254652','#396c6c',c)][layer];
      artRect(x,y,w,h,shade,3);
      artRect(x+12,y-10,w-24,12,shade);
      if(layer===0) { artRect(x+w*.5,y-32,3,24,shade); continue; }
      artRect(x+w-22,y+6,20,h-6,'rgba(9,32,42,.18)');
      artRect(x+12,y+12,w-42,4,'rgba(239,222,184,.15)');
      for(let row=0;row<Math.floor((h-40)/39);row++) {
        for(let col=0;col<Math.floor((w-32)/28);col++) {
          const wx=x+16+col*28, wy=y+30+row*39;
          const lit=artNoise(i*31+row*7+col)>.52;
          artRect(wx,wy,12,21,lit?'#c6b88a':'#1e404c',2);
          artRect(wx,wy+17,15,3,'rgba(9,28,35,.28)');
          if(lit) artRect(wx+2,wy+2,3,15,'#edce94');
        }
      }
      if(layer===2) {
        if(n>.55) {
          // A sawtooth workshop roof breaks the apartment-block silhouette.
          ctx.fillStyle=shade; ctx.beginPath(); ctx.moveTo(x,y);
          for(let k=0;k<w-30;k+=50) {ctx.lineTo(x+k+40,y-27);ctx.lineTo(x+k+40,y);}
          ctx.lineTo(x+w,y);ctx.closePath();ctx.fill();
          for(let k=0;k<w-30;k+=50) artLine([[x+k+7,y-3],[x+k+36,y-22]],'#769991',2);
        }
        // Water tanks, ventilation stacks, exterior plumbing and shop awnings.
        artRect(x+27,y-37,35,28,'#49696d',5); artOval(x+44,y-37,18,5,'#8c9c91');
        artLine([[x+30,y-10],[x+28,y],[x+60,y],[x+57,y-10]],ART.ink,3);
        artLine([[x+w-30,y+30],[x+w-30,horizon-12]],'#74928b',3);
        artRect(x+17,horizon-54,65,54,'#193843',3);
        artRect(x+12,horizon-60,80,10,ART.copper,2);
        for(let a=0;a<5;a++) artRect(x+13+a*16,horizon-60,8,10,'#f0c99b');
        if(n<.4) {
          for(let floor=1;floor<4;floor++) {
            const by=horizon-floor*65;
            artRect(x+100,by,70,4,'#153640');
            artLine([[x+103,by],[x+103,by-15],[x+166,by-15],[x+166,by]],'#87a399',1);
            for(let k=114;k<166;k+=12) artLine([[x+k,by],[x+k,by-15]],'#87a399',1);
          }
        }
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
    artLine([[x,horizon],[x,horizon-170],[x+28,horizon-184],[x+54,horizon-184]],'#183c46',5);
    artRect(x+41,horizon-187,25,7,ART.ink,3);
    artOval(x+54,horizon-179,9,3,ART.paper);
    ctx.save(); ctx.globalAlpha=.045; ctx.fillStyle=ART.paper; ctx.beginPath(); ctx.moveTo(x+48,horizon-177); ctx.lineTo(x-12,horizon); ctx.lineTo(x+120,horizon); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  let sea=null;
  for(const seg of groundSegments) {
    if(seg.x>canvas.width || seg.x+seg.width<0) continue;
    const x=seg.x,w=seg.width;
    if(seg.type==='ASPHALT') {
      artRect(x,horizon,w,canvas.height-horizon,'#183941');
      artRect(x,horizon,w,10,'#a1afa0'); artRect(x,horizon+10,w,7,'#496b68');
      for(let k=0;k<w;k+=66) { artRect(x+k,horizon+2,1,8,'#5a7a74'); artRect(x+k+9,horizon+29,43,3,'#254951'); }
      artRect(x,horizon+63,w,2,'#31535b');
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
    ctx.save(); ctx.globalAlpha=.25; artOval(x,y,2,1,ART.paper); ctx.restore();
  }
  if(sea) {
    artRect(canvas.width/2-143,canvas.height-34,286,25,'#102d35dd',12);
    typeText(sea==='MEGA'?'ÁGUAS TÓXICAS / TRAVESSIA ESPECIAL':'ÁGUAS TÓXICAS / MANTENHA-SE NO ALTO',canvas.width/2,canvas.height-17,{role:'label',size:14,color:ART.paper,align:'center',maxWidth:canvas.width-24});
  }
}
function paintPlatforms() {
  for(const p of platforms) {
    const x=p.x,y=p.y,w=p.width,h=GAME_CONFIG.PLATFORM_HEIGHT;
    artRect(x,y,w,h,ART.ink,3); artRect(x+2,y+2,w-4,6,'#b7c4ac',2);
    artRect(x+3,y+9,w-6,h-12,'#486e70');
    for(let k=18;k<w-16;k+=36) artLine([[x+k,y+11],[x+k+12,y+h-4],[x+k+24,y+11]],'#244b55',2);
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
      const labelX=Math.max(74,Math.min(canvas.width-74,x));
      artRect(labelX-70,y-49,140,25,ART.ink,7); typeText(label,labelX,y-32,{role:'label',size:14,color:ART.paper,align:'center',maxWidth:128});
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
  artText('ECOPONTO',x+w/2,y+47,17,ART.paper,'center'); typeText('RECUPERAR / RENOVAR',x+w/2,y+66,{role:'label',size:14,color:ART.mint,align:'center',maxWidth:w-32});
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
function paintHUD() { paintTypeHUD(); }
