// Opening score is separate from the existing looping gameplay music.
const introMusic=new Audio('audio/technomonster-primeiro-broto.wav');
introMusic.preload='auto';introMusic.volume=.55;
const introSound={attempted:false,enabled:false,failed:false,request:0};
function playIntroMusic() {
  introSound.attempted=true;
  if(introMusic.error){introSound.failed=true;return;}
  const request=++introSound.request;
  introMusic.currentTime=Math.min(15.4,Math.max(0,(performance.now()-(intro.started??performance.now()))/1000));
  introMusic.play().then(()=>{
    if(request!==introSound.request)return;
    if(gameState!=='INTRO'){introMusic.pause();return;}
    introSound.enabled=true;introSound.failed=false;
  }).catch(error=>{
    if(request!==introSound.request)return;
    introSound.enabled=false;
    introSound.failed=error.name!=='NotAllowedError'&&error.name!=='AbortError';
  });
}
function toggleIntroSound() {
  if(introSound.enabled){introSound.request++;introMusic.pause();introSound.enabled=false;}
  else playIntroMusic();
}
function stopIntroMusic() {
  const audible=introSound.enabled;
  introSound.request++;introMusic.pause();introMusic.currentTime=0;introSound.enabled=false;
  return audible;
}
function introSoundButton(l) {return {x:l.w-218,y:22,w:196,h:38};}
function introSoundClick(e) {
  const l=introLayout(),b=introSoundButton(l),r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*canvas.width/r.width/l.scale,y=(e.clientY-r.top)*canvas.height/r.height/l.scale;
  if(x<b.x||x>b.x+b.w||y<b.y||y>b.y+b.h)return false;
  toggleIntroSound();return true;
}
function drawIntroSound(l) {
  const b=introSoundButton(l);
  artRect(b.x,b.y,b.w,b.h,'#142d38e8',7);
  const label=introSound.failed?'SOM INDISPONÍVEL':introSound.enabled?'SOM LIGADO · M':'ATIVAR SOM · M';
  typeText(label,b.x+b.w/2,b.y+25,{role:'label',size:16,color:introSound.enabled?'#a8df9b':'#eee7d1',align:'center',maxWidth:b.w-16});
}
