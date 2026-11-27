// Cinematic only: simulation and gameplay RNG remain untouched.
const intro = { duration: 15500, started: null, loadingStarted: null, completed: false, illustrated: null };
function introEase(v) {const x=Math.max(0,Math.min(1,v));return x*x*(3-2*x);}
function introLayout() {
  // Fill the actual viewport rather than fitting a fixed letterboxed image.
  const portrait=canvas.width/canvas.height<1.1,scale=portrait?canvas.width/540:canvas.height/720;
  return {portrait,w:canvas.width/scale,h:canvas.height/scale,scale};
}
function finishIntro() {
  if(gameState!=='INTRO')return;
  const hadSound=stopIntroMusic();
  intro.completed=true;gameState='MENU';menuOption=0;
  titleUI.pending=null;titleUI.last=performance.now();canvas.style.cursor='default';
  if(hadSound)playBackgroundMusic();
}
function introCaption(text,l,opacity) {
  if(opacity<=0)return;
  ctx.save();ctx.globalAlpha=opacity;
  const y=l.h-104,fog=ctx.createLinearGradient(0,y-30,0,l.h);
  fog.addColorStop(0,'rgba(9,23,29,0)');fog.addColorStop(1,'rgba(9,23,29,.85)');
  ctx.fillStyle=fog;ctx.fillRect(0,y-30,l.w,l.h-y+30);
  ctx.font=`bold ${l.portrait?17:23}px Georgia, serif`;
  ctx.fillStyle='#eee7d1';ctx.textAlign='center';ctx.fillText(text,l.w/2,y);ctx.restore();
}
function introCity(l,t,shore,travel) {
  for(let layer=0;layer<3;layer++) {
    const step=155+layer*55,offset=travel*(.22+layer*.39),base=shore+20;
    for(let i=Math.floor(offset/step)-1;i<(offset+l.w)/step+1;i++) {
      const n=artNoise(i+layer*90),bh=135+n*185+layer*24,x=i*step-offset,y=base-bh,bw=step-16;
      const color=['#48545e','#35474f','#293f45'][layer];
      artRect(x,y,bw,bh,color,2);ctx.fillStyle=layer===2?'#24373f':color;
      ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+bw*.38,y-28);ctx.lineTo(x+bw+5,y);ctx.closePath();ctx.fill();
      artRect(x-3,y,bw+6,4,layer===2?'#788173':color);artRect(x+bw-16,y+6,14,bh-6,'rgba(11,26,32,.18)');
      if(layer>0) for(let row=0;row<Math.floor((bh-30)/39);row++) for(let col=0;col<Math.floor(bw/30)-1;col++) {
        const wx=x+16+col*30,wy=y+20+row*39,lit=artNoise(i*17+row*3+col)>.68;
        artRect(wx-2,wy-2,16,25,'#59685f',6);artRect(wx,wy,12,21,lit?'#c3b381':'#20353f',5);
        if(lit)artRect(wx+2,wy+2,2,16,'#e0c999',1);
      }
      if(layer===2) {
        artRect(x+18,base-52,46,52,'#1b323b',16);artLine([[x+bw-25,y+15],[x+bw-25,base]],'#63746b',2);
        for(let by=base-65;by-16>y+12;by-=65) {
          artRect(x+85,by,60,4,'#162c34');artLine([[x+87,by],[x+87,by-14],[x+142,by-14],[x+142,by]],'#657b70',1);
        }
      }
      if(layer===1&&i%2===0) {
        artRect(x+30,y-46,18,45,'#3b484c');artRect(x+27,y-50,24,6,'#7a7e6c');
        for(let puff=0;puff<9;puff++) {
          const age=(t*.04+puff/9+n)%1;
          titleCloud(x+39+age*155,y-52-age*155,.1+age*.7,'#24333b',Math.sin(age*Math.PI)*.32);
        }
      }
    }
  }
}
function introWater(l,t,shore,travel,softEdge=false) {
  const {w,h}=l,water=ctx.createLinearGradient(0,shore,0,h);
  water.addColorStop(0,softEdge?'#53675a00':'#53675a');
  if(softEdge)water.addColorStop(.09,'#53675a');
  water.addColorStop(.23,'#304d49');water.addColorStop(1,'#142e35');
  // Overscan eliminates edge gaps, including rounding on unusual aspect ratios.
  ctx.fillStyle=water;ctx.fillRect(-4,shore,w+8,h-shore+4);
  ctx.save();ctx.beginPath();ctx.rect(-4,shore,w+8,h-shore+4);ctx.clip();
  for(let row=0;row<9;row++) {
    const depth=row/8,yy=shore+12+depth*(h-shore),step=65+depth*100,offset=(travel*.25+t*(5+depth*8))%step;
    for(let x=-step-offset;x<w+step;x+=step) {
      const wave=Math.sin(t*1.1+x*.018+row)*2;
      artLine([[x,yy+wave],[x+step*.43,yy+wave]],row%2?'#527169':'#3e5b55',1+depth);
      if(row%3===0){artOval(x+step*.6,yy+7,step*.35,4+depth*5,'#203e3c');artLine([[x+step*.5,yy+5],[x+step*.72,yy+4]],'#626c4c',1);}
    }
  }
  for(let i=0;i<7;i++) for(let k=0;k<8;k++) {
    ctx.save();ctx.globalAlpha=.12*(1-k/8);artRect((i+.4)*w/7+Math.sin(t+k)*4,shore+8+k*8,5+k*2,3,'#dbc48b',1);ctx.restore();
  }
  // Fixed decorative debris: no growth in particle arrays or gameplay calls.
  for(let i=0;i<16;i++) {
    const depth=.15+artNoise(i+40)*.7,span=w+180;
    const x=((i*span/16+t*(6+depth*6)-travel*.4)%span+span)%span-90;
    const y=shore+depth*(h-shore)+Math.sin(t*1.5+i)*3,size=.55+depth*.6;
    artOval(x,y+12*size,20*size,3*size,'#112c31');
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.6+i)*.1+(i%3-1)*.35);ctx.scale(size,size);
    if(i%3===0){ctx.shadowColor=ITEM_GLOW.RECICLAVEL.color;ctx.shadowBlur=5;paintItemIcon('RECICLAVEL',0,0,i%2);}
    else if(i%3===1){ctx.shadowColor=ITEM_GLOW.ELETRONICO.color;ctx.shadowBlur=5;paintItemIcon('ELETRONICO',0,0,0);}
    else {artRect(-17,-6,34,13,'#6e7058',2);artLine([[-13,-1],[12,1]],'#989477',2);}
    ctx.restore();
  }
  ctx.restore();
}
function introHero(l,t,shore) {
  const {w,h}=l,arrive=introEase((t-7.8)/2.1),dockX=w*(l.portrait?.38:.64),dockY=shore+22,scale=l.portrait?1.6:2.2;
  // The dock has pilings, leaving the sea visible underneath all the way down.
  for(let x=dockX+25;x<w+30;x+=120) {
    artRect(x,dockY+20,18,Math.max(0,h-dockY-20),'#1c3339');artRect(x+3,dockY+25,3,Math.max(0,h-dockY-25),'#344b49');
  }
  artRect(dockX-8,dockY,w-dockX+16,27,'#304a48',3);artRect(dockX-8,dockY,w-dockX+16,7,'#a0a588',2);
  for(let x=dockX+10;x<w;x+=36)artLine([[x,dockY+8],[x,dockY+22]],'#52635b',1);
  const target=dockX+22,heroX=w+60+(target-w-60)*arrive,jump=Math.sin(arrive*Math.PI)*65;
  artOval(heroX+28*scale,dockY,26*scale,4,'#122d33');
  ctx.save();ctx.beginPath();ctx.rect(dockX-10,dockY-240,w-dockX+20,242);ctx.clip();
  ctx.translate(heroX,dockY-72*scale-jump);ctx.scale(scale,scale);
  const landing=Math.max(0,t-9.9),squash=t>9.9?Math.sin(landing*12)*Math.exp(-landing*5)*.12:0;
  paintPlayer({x:0,y:0,width:56,height:72,isGrounded:false,velocityY:arrive<1?-Math.cos(arrive*Math.PI)*3:0,
    invulnerableTimer:0,scaleX:1+squash,scaleY:1-squash});ctx.restore();
  const seedX=target+56*scale+25,drop=introEase((t-10.1)/.65),grow=introEase((t-10.9)/1.5);
  if(t>10.1) {
    ctx.save();ctx.shadowColor=ITEM_GLOW.SEMENTE.color;ctx.shadowBlur=10;
    artOval(seedX,dockY-6-(1-drop)*40,5,6,'#aab477');ctx.shadowBlur=0;
    const bend=Math.sin(t*1.7)*grow*3;
    artLine([[seedX,dockY-5],[seedX+bend,dockY-5-grow*38]],'#8cbb82',3);
    if(grow>0){titleLeaf(seedX-8+bend,dockY-8-grow*23,12*grow,'#a8df9b',-.5);titleLeaf(seedX+8+bend,dockY-8-grow*34,10*grow,'#85be83',.5);}
    ctx.restore();
    for(let i=0;i<5;i++){ctx.save();ctx.globalAlpha=grow*.4;artOval(seedX+Math.sin(t+i)*22,dockY-15-grow*(15+i*9),1.5,1.5,'#c9e3aa');ctx.restore();}
  }
}
function paintIntroScene(l,t) {
  const {w,h}=l,descend=introEase((t-3.4)/2.3),recover=introEase((t-7.4)/2.2);
  // Three connected shots: panorama, descent over waste, dock and seed.
  const shore=h*(.79-descend*.27+recover*.15),travel=25*t+descend*80;
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#111c2a');sky.addColorStop(.7,'#3e4b50');sky.addColorStop(1,'#7d7960');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);artOval(w*.8,h*.2-descend*45,42,42,'#6d766a');
  introCity(l,t,shore,travel);
  for(let i=0;i<10;i++){const span=w+500,x=((i*span/10+t*10)%span)-250;titleCloud(x,55+artNoise(i+12)*Math.max(70,shore*.48),1.25,'#293941',.38);}
  const haze=ctx.createLinearGradient(0,shore-100,0,shore);
  haze.addColorStop(0,'rgba(92,104,91,0)');haze.addColorStop(1,'rgba(92,104,91,.25)');ctx.fillStyle=haze;ctx.fillRect(0,shore-100,w,100);
  introWater(l,t,shore,travel);
  if(t>6.2){const slide=(1-introEase((t-6.2)/1.6))*(h-shore+80);ctx.save();ctx.translate(0,slide);introHero(l,t,shore);ctx.restore();}
  for(let i=0;i<16;i++){const x=(i*w/16+t*7)%(w+20)-10,y=artNoise(i+50)*h+Math.sin(t*.6+i)*8;ctx.save();ctx.globalAlpha=.18;artOval(x,y,1.5,1,'#b6b9a2');ctx.restore();}
  const vignette=ctx.createRadialGradient(w*.55,h*.5,Math.min(w,h)*.3,w*.5,h*.5,Math.max(w,h)*.75);
  vignette.addColorStop(0,'rgba(7,17,25,0)');vignette.addColorStop(1,'rgba(7,17,25,.48)');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  artRect(0,0,w,h,`rgba(9,20,28,${1-introEase(t/.8)})`);
  for(const [start,end,text] of [[.9,3.6,'A cidade perdeu suas cores.'],[4.6,7.5,'O que descartamos não desaparece.'],[10.3,13.3,'Mas toda mudança começa com uma ação.']])introCaption(text,l,introEase((t-start)/.6)*(1-introEase((t-end)/.6)));
}
function drawIntro() {
  if(intro.completed){finishIntro();return;}
  const now=performance.now(),l=introLayout();
  // Give local artwork time to decode before starting the score and timeline.
  // Skip controls remain active during loading; failures use the original scene.
  if(intro.illustrated===null) {
    if(intro.loadingStarted===null)intro.loadingStarted=now;
    if(introPanoramaReady())intro.illustrated=true;
    else if(now-intro.loadingStarted>=4000)intro.illustrated=false;
    else {
      artRect(0,0,canvas.width,canvas.height,'#09141c');
      ctx.save();ctx.scale(l.scale,l.scale);
      artText('ESPAÇO / ENTER / CLIQUE PARA PULAR',l.w/2,l.h-35,11,'#dbe2cf','center');ctx.restore();
      return;
    }
  }
  if(intro.started===null) {
    intro.started=now;
    // M may have unlocked sound while the painting was loading.
    if(introSound.enabled)playIntroMusic();
  }
  if(!introSound.attempted)playIntroMusic();
  const seconds=(now-intro.started)/1000;
  if(seconds>=intro.duration/1000){finishIntro();drawTitleScreen();return;}
  if(seconds<14.3) {
    ctx.save();ctx.scale(l.scale,l.scale);
    if(!intro.illustrated||!paintIntroPanorama(l,seconds,now/1000))paintIntroScene(l,seconds);
    ctx.restore();
  } else drawTitleScreen(true);
  // A short passage through warm light separates two distinct locations.
  // Never crossfade their buildings or duplicate the mascot on screen.
  const veil=seconds<14.3?introEase((seconds-13.3)/1):1-introEase((seconds-14.3)/1.2);
  if(veil>0)artRect(0,0,canvas.width,canvas.height,`rgba(224,202,166,${veil})`);
  const reveal=introEase((seconds-13.3)/2.2);
  ctx.save();ctx.scale(l.scale,l.scale);ctx.globalAlpha=1-reveal;
  artText('ESPAÇO / ENTER / CLIQUE PARA PULAR',l.w/2,l.h-35,11,'#dbe2cf','center');
  drawIntroSound(l);ctx.restore();
}
