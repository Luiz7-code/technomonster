// Shared Canvas typography. Sizes are CSS pixels unless a screen uses a fitted
// virtual layout; callers keep text metrics and hit targets in the same space.
const TYPE=Object.freeze({
  display:{family:'"TM Display", Georgia, serif',size:64,weight:800,spacing:0},
  heading:{family:'"TM Display", Georgia, serif',size:38,weight:750,spacing:0},
  section:{family:'"TM Display", Georgia, serif',size:26,weight:700,spacing:0},
  body:{family:'"TM Text", "Segoe UI", sans-serif',size:20,weight:600,spacing:0},
  button:{family:'"TM Text", "Segoe UI", sans-serif',size:20,weight:800,spacing:.3},
  label:{family:'"TM Text", "Segoe UI", sans-serif',size:14,weight:800,spacing:.45},
  small:{family:'"TM Text", "Segoe UI", sans-serif',size:14,weight:600,spacing:.1},
  score:{family:'"TM Text", "Segoe UI", sans-serif',size:28,weight:850,spacing:0}
});
function typeFont(role='body',size=TYPE[role].size,weight=TYPE[role].weight,italic=false) {
  return `${italic?'italic ':''}${weight} ${size}px ${TYPE[role].family}`;
}
function setType(role='body',size=TYPE[role].size,weight=TYPE[role].weight,italic=false) {
  ctx.font=typeFont(role,size,weight,italic);
  if('letterSpacing' in ctx)ctx.letterSpacing=`${TYPE[role].spacing}px`;
  ctx.textBaseline='alphabetic';
}
function typeText(text,x,y,{role='body',size=TYPE[role].size,weight=TYPE[role].weight,color='#f5e7be',align='left',maxWidth=Infinity,minSize=12,italic=false,outline=false}={}) {
  ctx.save();setType(role,size,weight,italic);text=String(text);
  while(ctx.measureText(text).width>maxWidth&&size>minSize){size-=.5;setType(role,size,weight,italic);}
  // Explicit fitting uses font size, never Canvas horizontal glyph compression.
  if(ctx.measureText(text).width>maxWidth){while(text.length&&ctx.measureText(text+'…').width>maxWidth)text=text.slice(0,-1);text+='…';}
  ctx.textAlign=align;ctx.fillStyle=color;
  if(outline){ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#102d35e6';ctx.strokeText(text,x,y);}
  ctx.fillText(text,x,y);ctx.restore();
}
function typeLines(text,width,role='body',size=20) {
  ctx.save();setType(role,size);
  const lines=[];let line='';
  for(const word of String(text).split(/\s+/)) {
    const next=line?line+' '+word:word;
    if(line&&ctx.measureText(next).width>width){lines.push(line);line='';}
    for(const letter of word) {
      if(!line&&ctx.measureText(word).width<=width){line=word;break;}
      // Normal words are appended together, with a separate path for long tokens.
      if(ctx.measureText(word).width<=width){line+=(line?' ':'')+word;break;}
      if(ctx.measureText(line+letter).width>width&&line){lines.push(line);line='';}
      line+=letter;
    }
  }
  if(line)lines.push(line);ctx.restore();return lines;
}
function typeParagraph(text,x,y,width,{size=20,lineHeight=Math.ceil(size*1.4),color='#d7ddce',align='left',role='body'}={}) {
  for(const line of typeLines(text,width,role,size)){typeText(line,x,y,{role,size,color,align});y+=lineHeight;}
  return y;
}
const gameFontsReady=Promise.race([
  Promise.allSettled([document.fonts.load('800 64px "TM Display"'),document.fonts.load('italic 800 64px "TM Display"'),document.fonts.load('600 20px "TM Text"'),document.fonts.load('800 20px "TM Text"')]),
  new Promise(resolve=>setTimeout(resolve,3000))
]);
function uiActionButtons(kind) {
  const compact=canvas.width<560,w=compact?Math.min(320,canvas.width-40):220,h=48,gap=12;
  const y=kind==='GAMEOVER'?canvas.height-(compact?142:90):canvas.height/2+(kind==='ECOPONTO_PAUSE'?32:10);
  return [0,1].map(i=>({x:compact?(canvas.width-w)/2:canvas.width/2+(i?gap/2:-w-gap/2),y:y+(compact?i*(h+gap):0),w,h}));
}
function uiNicknameKeys() {
  const columns=Math.max(...vkGrid.map(row=>row.length)),gap=canvas.width<560?5:10;
  const startY=Math.max(155,canvas.height/2-50);
  const size=Math.min(48,(canvas.width-32-(columns-1)*gap)/columns,(canvas.height-startY-16-(vkGrid.length-1)*gap)/vkGrid.length);
  return vkGrid.map((row,r)=>row.map((char,c)=>({char,r,c,x:(canvas.width-(row.length*size+(row.length-1)*gap))/2+c*(size+gap),y:startY+r*(size+gap),w:size,h:size})));
}
function uiDrawActions(kind,labels,selected) {
  uiActionButtons(kind).forEach((b,i)=>{
    artRect(b.x,b.y,b.w,b.h,selected===i?'#447e72':'#243f49',7);
    typeText(labels[i],b.x+b.w/2,b.y+31,{role:'button',size:18,align:'center',maxWidth:b.w-20,minSize:16});
  });
}
function paintTypeHUD() {
  const compact=canvas.width<900,pad=compact?10:22,w=canvas.width-2*pad,top=12,height=compact?108:72;
  artRect(pad,top,w,height,'#102d35f5',12);artRect(pad+12,top+12,3,42,ART.mint,2);
  typeText(playerName||'JOGADOR',pad+24,top+24,{role:'label',size:14,color:ART.mint,maxWidth:compact?w-128:160});
  typeText(String(scoreBase+Math.floor(distance)).padStart(5,'0'),pad+24,top+53,{role:'score',maxWidth:compact?w-128:160,minSize:20});
  const start=compact?pad+12:pad+200,available=compact?w-24:w-304,col=available/4,yy=compact?top+77:top+26;
  ['VIDAS','FASE','CARGA','SEMENTES'].forEach((label,i)=>typeText(label,start+i*col,yy,{role:'label',size:12,color:'#aac8bd',maxWidth:col-6}));
  for(let i=0;i<3;i++)artOval(start+6+i*17,yy+18,5,5,i<lives?ART.copper:'#34555b');
  [String(phase).padStart(2,'0'),eWasteInBag,seedsInBag].forEach((value,i)=>typeText(value,start+(i+1)*col,yy+23,{role:'score',size:21,maxWidth:col-6}));
  artRect(canvas.width-110,12,80,32,'#315b61',8);typeText('Ⅱ  P',canvas.width-70,34,{role:'button',size:16,align:'center'});
  const barY=top+height+8,barW=Math.min(180,w*.4);
  artRect(pad,barY,barW,4,'#183e46',2);artRect(pad,barY,barW*Math.min(1,totalCleanActions/120),4,ART.mint,2);
  typeText('CIDADE EM REGENERAÇÃO',pad,barY+21,{role:'label',size:12,color:'#e4e5cb',outline:true});
}
