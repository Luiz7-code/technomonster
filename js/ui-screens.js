// Screen presentation shares typography, wrapping and mouse targets.
function uiScreenTitle(text,y,color='#a8df9b') {
  typeText(text,canvas.width/2,y,{role:'heading',size:canvas.width<560?30:40,color,align:'center',maxWidth:canvas.width-40,minSize:24});
}
function uiScreenCopy(text,y,{color='#f5e7be',size=20}={}) {
  return typeParagraph(text,canvas.width/2,y,Math.min(760,canvas.width-48),{size,color,align:'center'});
}
function drawPauseOverlay() {
  artRect(0,0,canvas.width,canvas.height,'#0f172ae8');
  uiScreenTitle('Jogo pausado',canvas.height/2-65);
  uiDrawActions('PAUSED',['Continuar','Sair para o menu'],pauseOption);
  const last=uiActionButtons('PAUSED')[1];
  uiScreenCopy('Setas para escolher · Enter para confirmar',last.y+last.h+32,{size:16,color:'#c3d6ca'});
}
function drawNicknameScreen() {
  drawParallaxCity();artRect(0,0,canvas.width,canvas.height,'#102d35a8');
  uiScreenTitle('TECHNOMONSTER',Math.max(40,canvas.height/2-190));
  uiScreenCopy('Escolha seu nome no teclado ou joystick',Math.max(78,canvas.height/2-150),{size:18});
  const width=Math.min(360,canvas.width-40),y=Math.max(100,canvas.height/2-125);
  artRect((canvas.width-width)/2,y,width,48,'#102d35',7);
  typeText((playerName||'')+(Math.floor(Date.now()/500)%2===0?'_':''),canvas.width/2,y+33,{role:'score',size:26,align:'center',color:'#e5c590',maxWidth:width-24});
  uiNicknameKeys().flat().forEach(b=>{
    const selected=b.r===kbRow&&b.c===kbCol;
    artRect(b.x,b.y,b.w,b.h,selected?'#e5c590':'#1e293b',4);
    typeText(b.char,b.x+b.w/2,b.y+b.h*.7,{role:'button',size:Math.min(22,b.w*.6),color:selected?'#102d35':'#f5e7be',align:'center',maxWidth:b.w-4,minSize:12});
  });
}
function drawStartScreen() {
  drawParallaxCity();artRect(0,0,canvas.width,canvas.height,'#102d35b8');
  uiScreenTitle('TECHNOMONSTER',canvas.height/2-110);
  const end=uiScreenCopy(`Olá, ${playerName||'JOGADOR'}! Limpe a cidade para fazê-la brilhar novamente.`,canvas.height/2-50);
  uiScreenCopy('Pressione Espaço ou ↑ para iniciar',end+36,{color:'#bce3a7',size:20});
}
function drawEcopontoOverlay() {
  artRect(0,0,canvas.width,canvas.height,'#0f172af2');
  uiScreenTitle(`Fase ${phase} concluída!`,canvas.height/2-150);
  typeText(`${scoreBase+Math.floor(distance)} PTS`,canvas.width/2,canvas.height/2-98,{role:'score',align:'center'});
  uiScreenCopy('Eletrônicos depositados! Você ganhou sementes para a próxima etapa.',canvas.height/2-56,{size:18,color:'#bce3a7'});
  uiDrawActions('ECOPONTO_PAUSE',['Próxima fase','Finalizar corrida'],ecopontoOption);
}
function drawGameOverScreen() {
  artRect(0,0,canvas.width,canvas.height,'#0f172af8');
  const compact=canvas.width<560,short=canvas.height<600;
  uiScreenTitle('Fim de jogo',short?40:65,'#e5a57d');
  typeText(playerName||'JOGADOR',canvas.width/2,short?70:103,{role:'label',size:16,align:'center',maxWidth:canvas.width-48});
  typeText(`${scoreBase+Math.floor(distance)} PTS`,canvas.width/2,short?100:140,{role:'score',align:'center'});
  typeText('MELHORES CORRIDAS',canvas.width/2,short?130:180,{role:'label',size:14,color:'#bce3a7',align:'center'});
  const scores=getScores(),base=short?canvas.height-(compact?172:112):Math.max(350,Math.min(canvas.height-205,520)),step=Math.min(130,(canvas.width-36)/3);
  [{rank:2,height:90,offset:-1,color:'#78968d'},{rank:1,height:130,offset:0,color:'#c8a24c'},{rank:3,height:70,offset:1,color:'#a86f4d'}].forEach(p=>{
    const cx=canvas.width/2+p.offset*step,height=p.height*(short?.6:1),top=base-height,width=step-8,s=scores[p.rank-1];
    artRect(cx-width/2,top,width,height,p.color,5);
    typeText(`${p.rank}º`,cx,top+36,{role:'section',size:26,color:'#102d35',align:'center'});
    if(s){typeText(String(s.name).slice(0,10),cx,top-28,{role:'label',size:compact?13:16,align:'center',maxWidth:step-6});typeText(`${s.score} pts`,cx,top-9,{role:'small',size:14,align:'center',maxWidth:step-6});}
  });
  uiDrawActions('GAMEOVER',['Jogar novamente','Menu inicial'],gameOverOption);
}
