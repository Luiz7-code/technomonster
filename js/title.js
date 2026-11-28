// Title-screen presentation and navigation. No simulation state is advanced here.
const TITLE_OPTIONS = [
  ['JOGAR', 'NICKNAME'], ['TUTORIAL', 'TUTORIAL'], ['CONTROLES', 'CONTROLS'],
  ['RECORDES', 'RECORDS'], ['CRÉDITOS', 'CREDITS']
];
const TITLE_STATES = ['MENU', 'TUTORIAL', 'CONTROLS', 'RECORDS', 'CREDITS'];
const titleUI = { pending: null, start: 0, hover: -1, focus: [0,0,0,0,0], last: 0 };
function titleLayout() {
  const portrait=canvas.width/canvas.height<1.1;
  const w=portrait?440:Math.min(1280,Math.max(960,canvas.width)),h=portrait?Math.max(900,440*canvas.height/canvas.width):720;
  const scale=Math.min(canvas.width/w,canvas.height/h);
  return {portrait,w,h,scale,x:(canvas.width-w*scale)/2,y:(canvas.height-h*scale)/2};
}
function titleButtons(l,menuPreview=false) {
  if(gameState!=='MENU'&&!menuPreview) return [{x:l.w/2-115,y:l.h-104,w:230,h:48}];
  const x=l.portrait?42:84,y=l.portrait?296:305;
  return TITLE_OPTIONS.map((_,i)=>({x,y:y+i*62,w:l.portrait?l.w-84:350,h:51}));
}
function titleActivate(index) {
  if(titleUI.pending!==null) return;
  if(gameState==='MENU') menuOption=index;
  titleUI.pending=gameState==='MENU'?TITLE_OPTIONS[index][1]:'MENU';
  titleUI.start=performance.now();
}
function titleKey(e) {
  if(!TITLE_STATES.includes(gameState)) return false;
  if(['ArrowUp','ArrowDown','KeyW','KeyS','Enter','Space','Escape','Tab'].includes(e.code)) e.preventDefault();
  if(titleUI.pending!==null) return true;
  if(gameState==='MENU') {
    if(['ArrowUp','KeyW'].includes(e.code) || (e.code==='Tab'&&e.shiftKey)) menuOption=(menuOption+4)%5;
    if(['ArrowDown','KeyS'].includes(e.code) || (e.code==='Tab'&&!e.shiftKey)) menuOption=(menuOption+1)%5;
    if(e.code==='Enter'||e.code==='Space') titleActivate(menuOption);
  } else if(['Enter','Space','Escape'].includes(e.code)) titleActivate(0);
  return true;
}
function titlePointer(e,click=false) {
  if(!TITLE_STATES.includes(gameState)) {canvas.style.cursor='default';return false;}
  const rect=canvas.getBoundingClientRect(),l=titleLayout();
  const x=((e.clientX-rect.left)*canvas.width/rect.width-l.x)/l.scale;
  const y=((e.clientY-rect.top)*canvas.height/rect.height-l.y)/l.scale;
  const idx=titleButtons(l).findIndex(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);
  titleUI.hover=idx;canvas.style.cursor=idx>=0?'pointer':'default';
  if(idx>=0 && titleUI.pending===null) {if(gameState==='MENU')menuOption=idx;if(click)titleActivate(idx);}
  return true;
}
canvas.addEventListener('pointermove',e=>titlePointer(e));
canvas.addEventListener('pointerleave',()=>{titleUI.hover=-1;canvas.style.cursor='default';});
function titleLeaf(x,y,size,color,angle) {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;
  ctx.beginPath();ctx.moveTo(-size,0);ctx.quadraticCurveTo(0,-size,size,0);
  ctx.quadraticCurveTo(0,size,-size,0);ctx.fill();ctx.restore();
}
function titleCloud(x,y,size,color,opacity) {
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.globalAlpha=opacity;
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-105,14);
  ctx.bezierCurveTo(-119,-1,-87,-17,-64,-12);
  ctx.bezierCurveTo(-59,-46,-12,-48,4,-23);
  ctx.bezierCurveTo(29,-39,65,-21,66,-7);
  ctx.bezierCurveTo(93,-9,113,1,118,14);
  ctx.closePath();ctx.fill();ctx.restore();
}
function titleAtmosphere(l,t) {
  // Fixed counts, time-based motion and off-screen wrapping: no particle buildup.
  for(let layer=0;layer<2;layer++) for(let i=0;i<7;i++) {
    const size=.55+artNoise(i+layer*23)*.55;
    const span=l.w+300;
    const x=((i*span/7+t*(layer?9:4)+layer*100)%span)-150;
    const y=50+artNoise(i+layer*51)*Math.min(240,l.h*.28)+Math.sin(t*.2+i)*4;
    titleCloud(x,y,size,layer?'#f2d4bf':'#c9b6bf',layer?.2:.13);
  }
  // Smog banks remain distinct from the pale clouds without hiding the menu.
  for(let i=0;i<5;i++) {
    const span=l.w+420,x=((i*span/5+t*6)%span)-210;
    const y=90+artNoise(i+90)*135;
    titleCloud(x,y,1.1+artNoise(i+70)*.5,'#434454',.12);
  }
  // A small, distant flock follows a gentle arc across the upper sky.
  const flight=((t*13)%(l.w+160))-80;
  for(let i=0;i<4;i++) {
    const x=flight-i*19,y=l.h*.32+Math.sin(t*.25)*12+i%2*9;
    const flap=Math.sin(t*3.5+i*.7)*3;
    artLine([[x-5,y+flap],[x,y+2],[x+5,y+flap]],'#57586b',1.3);
  }
}
function titleSmoke(l,t) {
  for(let chimney=0;chimney<2;chimney++) {
    const x=l.w*(.42+chimney*.12),y=l.h-265-chimney*35;
    artRect(x-7,y,14,55,'#626276',2);artRect(x-10,y-3,20,6,'#89818c',1);
    for(let i=0;i<9;i++) {
      const age=((t*.045+i/9+chimney*.3)%1);
      const opacity=Math.sin(age*Math.PI)*.16;
      const drift=age*125+Math.sin(t*.35+i)*age*12;
      titleCloud(x+drift,y-age*200,.12+age*.65,'#424451',opacity);
    }
  }
}
function titleScene(l,t) {
  if(paintIllustratedTitle(l,t))return;
  const {w,h}=l;
  const sky=ctx.createLinearGradient(0,0,w,h);
  sky.addColorStop(0,'#282d43');sky.addColorStop(.55,'#8e7b91');sky.addColorStop(1,'#e9bb94');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  artOval(w*.81,h*.28,62,62,'#f8dcb0');
  titleAtmosphere(l,t);
  for(let layer=0;layer<3;layer++) {
    const step=[135,175,230][layer],base=h-80+layer*15;
    for(let i=-1;i<w/step+1;i++) {
      const n=artNoise(i+layer*27),x=i*step+Math.sin(t*.03)*layer*3;
      const bh=110+n*165+layer*22,by=base-bh,bw=step-12;
      const color=layer===0?'#716d86':layer===1?'#66637a':['#a78985','#c39b86','#82a29a'][Math.abs(i)%3];
      artRect(x,by,bw,bh,color,2);
      ctx.fillStyle=layer===2?'#71596f':color;ctx.beginPath();ctx.moveTo(x-4,by);ctx.lineTo(x+bw*.5,by-28);ctx.lineTo(x+bw+4,by);ctx.fill();
      if(layer===0) continue;
      artRect(x-3,by,bw+6,4,layer===2?'#dabda0':color);
      for(let r=0;r<Math.floor((bh-20)/35);r++) for(let c=0;c<Math.floor((bw-22)/28);c++) {
        const wx=x+13+c*28,wy=by+18+r*35;
        artRect(wx-2,wy-2,15,22,layer===2?'#d9c6aa':'#77778c',6);
        artRect(wx,wy,11,18,artNoise(i*50+r*9+c)>.6?'#e6c998':'#475768',5);
      }
      if(layer===2 && i%2===0) {
        artRect(x+13,base-45,46,45,'#465867',15);
        for(let k=0;k<4;k++) artRect(x+8+k*15,base-49,12,6,k%2?'#dcbea0':'#79968b');
      }
    }
  }
  // Smoke on the neglected side; foliage on the restored rooftop to the right.
  titleSmoke(l,t);
  const roofX=l.portrait?300:780,roofY=l.portrait?h-135:596;
  artRect(roofX,roofY,w-roofX+20,h-roofY,'#344b50',6);
  artRect(roofX-12,roofY,w-roofX+30,14,'#d8c4a0',4);
  artRect(roofX-12,roofY-5,w-roofX+30,7,'#8fb383',3);
  for(let i=0;i<14;i++) {
    const x=roofX+25+i*28;
    const sway=Math.sin(t*1.2+i*.6)*3;
    artLine([[x,roofY],[x+sway,roofY-15-i%3*7]],'#6c9e7d',2);
    titleLeaf(x+4+sway,roofY-11-i%3*6,8,'#9bc98c',-.5+sway*.04);
  }
  const treeX=w-90,treeY=roofY;
  artLine([[treeX,treeY],[treeX-7,treeY-120],[treeX+14,treeY-175]],'#4a6555',11);
  for(const [dx,dy,r] of [[-30,-134,44],[23,-147,43],[2,-192,41]]) {
    const sway=Math.sin(t*.7+dy*.01)*3;
    artOval(treeX+dx+sway,treeY+dy,r,r*.78,'#467b66');
    artOval(treeX+dx-7+sway,treeY+dy-10,r*.7,r*.5,'#85b784');
  }
  // Use the actual mascot art, with local drawing coordinates only.
  ctx.save();ctx.beginPath();ctx.rect(roofX-30,roofY-210,230,215);ctx.clip();
  ctx.translate(roofX+26,roofY-146+Math.sin(t*2)*2);ctx.scale(2,2);
  paintPlayer({x:0,y:0,width:56,height:72,isGrounded:false,velocityY:Math.sin(t)*.4,scaleX:1,scaleY:1,invulnerableTimer:0});ctx.restore();
  for(let i=0;i<12;i++) {const x=(i*127+t*(9+i%3))%(w+30);titleLeaf(x,90+artNoise(i+71)*(h-180)+Math.sin(t+i)*12,3+i%3,'#c2c894',t*.2+i);}
  const shade=ctx.createLinearGradient(0,0,w,0);
  shade.addColorStop(0,'rgba(15,29,40,.94)');shade.addColorStop(l.portrait?.44:.37,'rgba(15,29,40,.72)');shade.addColorStop(1,'rgba(15,29,40,0)');
  ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
}
function titleLogo(l) { paintedTitleLogo(l); }
function titleButton(b,label,selected,amount,index) { paintedTitleButton(b,label,selected,amount,index); }
function titleWrap(text,x,y,maxWidth,size=17,color='#d7ddce',lineHeight=25) {
  size=Math.max(18,size);
  return typeParagraph(text,x,y,maxWidth,{size,color,lineHeight:Math.max(lineHeight,Math.ceil(size*1.35))});
}
function titlePanel(l) {
  const w=l.portrait?l.w-32:720,x=(l.w-w)/2,top=l.portrait?40:45;
  artRect(x,top,w,l.h-top-132,'#142d38f5',12);
  artRect(x+28,top+30,3,32,'#a8df9b',1);
  const name={TUTORIAL:'COMO RECUPERAR A CIDADE',CONTROLS:'CONTROLES',RECORDS:'RECORDES',CREDITS:'CRÉDITOS'}[gameState];
  typeText(name,x+45,top+53,{role:'section',size:gameState==='TUTORIAL'?24:30,color:'#e9e6ca',maxWidth:w-65,minSize:20});
  let y=top+102;
  if(gameState==='TUTORIAL') {
    const steps=[['01 / ATRAVESSE','A corrida é automática. Use o pulo duplo para alcançar plataformas e evitar drones, barris e o mar tóxico.'],['02 / RECUPERE','Azul: coma recicláveis com C. Laranja: guarde eletrônicos com X. Vermelho: perigo. Comer eletrônicos tira uma vida.'],['03 / CULTIVE','Verde: sementes e canteiros. Sementes são coletadas por proximidade; use Y perto de um canteiro para plantar.'],['04 / TRANSFORME','No ecoponto, cada eletrônico rende 2 sementes e 30 pontos. Continue para a próxima fase e veja a cidade se recuperar.']];
    for(const [heading,body] of steps) {typeText(heading,x+28,y,{role:'label',size:15,color:'#a8df9b'});y=titleWrap(body,x+28,y+25,w-56,18,'#d7ddce',25)+18;}
  } else if(gameState==='CONTROLS') {
    for(const [key,action] of [['↑ / W / ESPAÇO','Pular · pressione duas vezes para pulo duplo'],['C','Comer reciclável · eletrônico causa dano'],['X','Guardar lixo eletrônico'],['Y','Plantar uma semente no canteiro'],['P / ESC','Pausar ou continuar'],['R','Reiniciar a corrida'],['SETAS / ENTER','Navegar e confirmar nos menus']]) {
      typeText(key,x+28,y,{role:'label',size:15,color:'#a8df9b'});
      y=l.portrait?titleWrap(action,x+28,y+24,w-56,18)+16:titleWrap(action,x+212,y,w-240,18)+18;
    }
  } else if(gameState==='RECORDS') {
    y=typeParagraph('AS MELHORES CORRIDAS DESTE NAVEGADOR',x+28,y,w-56,{role:'label',size:14,color:'#a8df9b'})+24;
    let scores=[];try{scores=getScores();if(!Array.isArray(scores))scores=[];}catch{}
    if(!scores.length) titleWrap('A cidade está esperando seu primeiro recorde. Termine uma corrida para entrar no ranking.',x+32,y,w-64,20);
    scores.slice(0,5).forEach((s,i)=>{
      artRect(x+24,y-24,w-48,48,i===0?'#35534c':'#223b46',5);
      typeText(String(i+1).padStart(2,'0'),x+38,y+7,{role:'score',size:20,color:i===0?'#e7cc94':'#9bb5ab'});
      typeText(String(s.name).slice(0,10),x+83,y+7,{role:'body',size:19,maxWidth:w-248,minSize:14});
      typeText(`${s.score} PTS`,x+w-40,y+7,{role:'score',size:18,color:'#d7ddce',align:'right',maxWidth:122,minSize:12});y+=62;
    });
  } else {
    typeText('TECHNOMONSTER',x+28,y,{role:'section',size:26,color:'#a8df9b',maxWidth:w-56});
    y=titleWrap('Projeto educacional desenvolvido por estudantes do SENAI.',x+28,y+40,w-56,18)+16;
    y=titleWrap('Um jogo sobre reciclagem, responsabilidade ambiental e a transformação de uma cidade pelas nossas ações.',x+28,y,w-56,18)+16;
    artText('TRILHA SONORA',x+32,y,12,'#a8df9b');
    y=titleWrap('Pixel Dreams — djlofi (partidas).',x+32,y+27,w-64,16);
    y=titleWrap('Primeiro Broto — trilha original da abertura, criada com assistência do Codex por síntese digital, sem samples externos.',x+32,y+12,w-64,18);
    titleWrap('Fontes: Fraunces e Nunito Sans · SIL Open Font License 1.1.',x+32,y+16,w-64,18);
  }
  titleButton(titleButtons(l)[0],'VOLTAR',true,0,0);
}
function drawTitleScreen(menuPreview=false) {
  const now=performance.now(),dt=Math.min(50,now-(titleUI.last||now));titleUI.last=now;
  const l=titleLayout();
  artRect(0,0,canvas.width,canvas.height,'#142632');
  // One continuous full-viewport painting; fit only the interactive UI.
  ctx.save();ctx.scale(l.scale,l.scale);
  titleScene({...l,w:canvas.width/l.scale,h:canvas.height/l.scale},now/1000);
  ctx.restore();
  ctx.save();ctx.translate(l.x,l.y);ctx.scale(l.scale,l.scale);
  if(gameState==='MENU'||menuPreview) {
    titleLogo(l);
    titleButtons(l,true).forEach((b,i)=>{titleUI.focus[i]+=((menuOption===i?1:0)-titleUI.focus[i])*(1-Math.exp(-dt/90));titleButton(b,TITLE_OPTIONS[i][0],menuOption===i,titleUI.focus[i],i);});
    typeText('↑ ↓  ESCOLHER   ENTER  CONFIRMAR',l.portrait?42:92,l.h-55,{role:'label',size:14,color:'#c5d5c8',maxWidth:l.portrait?l.w-84:420});
    typeText('PROJETO SENAI / TECHNOMONSTER',l.portrait?42:92,l.h-30,{role:'small',size:13,color:'#a8bdb4',maxWidth:l.portrait?l.w-84:420});
  } else titlePanel(l);
  if(titleUI.pending!==null) {
    const progress=Math.min(1,(now-titleUI.start)/220);
    ctx.fillStyle=`rgba(14,29,37,${progress*.8})`;ctx.fillRect(0,0,l.w,l.h);
    if(progress===1){gameState=titleUI.pending;titleUI.pending=null;titleUI.hover=-1;canvas.style.cursor='default';}
  }
  ctx.restore();
}
