const bgMusic = new Audio('audio/djlofi-pixel-dreams-259187.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

function playBackgroundMusic() {
  bgMusic.play().catch(() => console.log("Aguardando interação do usuário para áudio"));
}

function stopBackgroundMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function setupArcadeAudio() {
  const unlockAudio = () => {
    if (gameState === 'INTRO') return;
    playBackgroundMusic();
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('click', unlockAudio);
  };
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('click', unlockAudio);
}
setupArcadeAudio();

function drawGameWorld() {
  ctx.save();

  // Aplica Screen Shake
  if (typeof screenShake !== 'undefined' && screenShake > 0) {
    let offsetX = (Math.random() - 0.5) * screenShake * 1.5;
    let offsetY = (Math.random() - 0.5) * screenShake * 1.5;
    ctx.translate(offsetX, offsetY);
  }

  drawParallaxCity();
  drawTrees();
  drawEcopontoBuilding();
  drawPlatforms();
  drawItems();
  drawObstacles();
  player.draw();
  drawParticles();
  drawFloatingMessages();

  ctx.restore();
}

// EFEITO CRT (SCANLINES & VINHETA DE MONITOR RETRO)
function drawCRTOverlay() {
  // A restrained edge shade keeps the hand-drawn palette readable.
  const shade=ctx.createLinearGradient(0,0,0,canvas.height);
  shade.addColorStop(0,'rgba(11,30,38,.12)');
  shade.addColorStop(.5,'rgba(11,30,38,0)');
  shade.addColorStop(1,'rgba(11,30,38,.16)');
  ctx.fillStyle=shade; ctx.fillRect(0,0,canvas.width,canvas.height);
}

// BARRA DE INTERFACE (HUD) ARCADE ESTILIZADA
function drawHUD() {
  paintHUD();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'INTRO': drawIntro(); break;
    case 'MENU':
    case 'CONTROLS':
    case 'TUTORIAL':
    case 'RECORDS':
    case 'CREDITS': drawTitleScreen(); break;
    case 'NICKNAME': drawNicknameScreen(); break;
    case 'START': drawStartScreen(); break;
    case 'PLAYING':
      updateWorld();
      drawGameWorld();
      drawHUD();
      drawCRTOverlay();
      break;
    case 'PAUSED':
      drawGameWorld();
      drawHUD();
      drawCRTOverlay();
      drawPauseOverlay();
      break;
    case 'ECOPONTO_PAUSE':
      drawGameWorld();
      drawHUD();
      drawCRTOverlay();
      drawEcopontoOverlay();
      break;
    case 'GAMEOVER':
      drawGameOverScreen();
      break;
  }

  if (flashRed > 0) {
    ctx.fillStyle = `rgba(239, 68, 68, ${flashRed / 25})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashRed--;
  }

  requestAnimationFrame(gameLoop);
}

gameFontsReady.finally(() => requestAnimationFrame(gameLoop));
