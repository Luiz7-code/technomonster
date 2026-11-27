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

function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#a8df9b';
  ctx.font = 'bold 38px "Trebuchet MS", sans-serif';
  ctx.fillText("JOGO PAUSADO", canvas.width / 2, canvas.height / 2 - 50);

  let btnY = canvas.height / 2 + 10;
  let btnW = 210;
  let btnH = 48;

  ctx.fillStyle = pauseOption === 0 ? '#447e72' : '#315b61';
  ctx.fillRect(canvas.width / 2 - 220, btnY, btnW, btnH);
  ctx.fillStyle = '#f5e7be';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText("▶ CONTINUAR", canvas.width / 2 - 115, btnY + 30);

  ctx.fillStyle = pauseOption === 1 ? '#d98d61' : '#315b61';
  ctx.fillRect(canvas.width / 2 + 10, btnY, btnW, btnH);
  ctx.fillStyle = '#f5e7be';
  ctx.fillText("🏠 SAIR PARA O MENU", canvas.width / 2 + 115, btnY + 30);

  ctx.fillStyle = '#9bb7ad';
  ctx.font = '14px sans-serif';
  ctx.fillText("USE AS SETAS PARA NAVEGAR | ENTER PARA CONFIRMAR", canvas.width / 2, canvas.height / 2 + 90);
  ctx.textAlign = 'left';
}

function drawNicknameScreen() {
  drawParallaxCity();
  ctx.textAlign = 'center';

  ctx.fillStyle = '#447e72';
  ctx.font = 'bold 42px "Trebuchet MS", sans-serif';
  ctx.fillText("TECHNOMONSTER", canvas.width / 2, canvas.height / 2 - 190);

  ctx.fillStyle = '#f5e7be';
  ctx.font = '20px sans-serif';
  ctx.fillText("Escolha o seu Nickname no Joystick:", canvas.width / 2, canvas.height / 2 - 145);

  ctx.fillStyle = '#102d35';
  ctx.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 125, 320, 48);
  ctx.strokeStyle = '#a8df9b';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width / 2 - 160, canvas.height / 2 - 125, 320, 48);

  ctx.fillStyle = '#e5c590';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText((playerName || "") + (Math.floor(Date.now() / 500) % 2 === 0 ? '_' : ''), canvas.width / 2, canvas.height / 2 - 92);

  const keyWidth = 48;
  const keyHeight = 48;
  const keyGap = 10;
  const startY = canvas.height / 2 - 50;

  vkGrid.forEach((row, rIdx) => {
    const rowWidth = row.length * keyWidth + (row.length - 1) * keyGap;
    const startX = canvas.width / 2 - rowWidth / 2;

    row.forEach((char, cIdx) => {
      const kx = startX + cIdx * (keyWidth + keyGap);
      const ky = startY + rIdx * (keyHeight + keyGap);
      const isSelected = (rIdx === kbRow && cIdx === kbCol);

      ctx.fillStyle = isSelected ? '#e5c590' : '#1e293b';
      ctx.fillRect(kx, ky, keyWidth, keyHeight);
      ctx.strokeStyle = isSelected ? '#f5e7be' : '#315b61';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(kx, ky, keyWidth, keyHeight);

      ctx.fillStyle = isSelected ? '#000000' : '#f5e7be';
      ctx.font = isSelected ? 'bold 20px sans-serif' : '18px sans-serif';
      ctx.fillText(char, kx + keyWidth / 2, ky + keyHeight / 2 + 7);
    });
  });

  ctx.textAlign = 'left';
}

function drawStartScreen() {
  drawParallaxCity();
  ctx.textAlign = 'center';

  ctx.fillStyle = '#447e72';
  ctx.font = 'bold 48px "Trebuchet MS", sans-serif';
  ctx.fillText("TECHNOMONSTER", canvas.width / 2, canvas.height / 2 - 80);

  ctx.fillStyle = '#f5e7be';
  ctx.font = '22px sans-serif';
  ctx.fillText(`Olá, ${playerName || "JOGADOR"}! Limpe a cidade para fazê-la brilhar novamente.`, canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = '#a8df9b';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText("Pressione ESPAÇO ou SETA CIMA para iniciar", canvas.width / 2, canvas.height / 2 + 60);

  ctx.textAlign = 'left';
}

function drawEcopontoOverlay() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#447e72';
  ctx.font = '900 40px "Trebuchet MS", sans-serif';
  ctx.fillText(`FASE ${phase} CONCLUÍDA! ♻️`, canvas.width / 2, canvas.height / 2 - 110);

  let totalPts = scoreBase + Math.floor(distance);
  ctx.fillStyle = '#f5e7be';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Pontuação Atual: ${totalPts} PTS`, canvas.width / 2, canvas.height / 2 - 50);

  ctx.fillStyle = '#a8df9b';
  ctx.font = '18px sans-serif';
  ctx.fillText(`E-Lixo depositado! Você ganhou sementes para a próxima etapa.`, canvas.width / 2, canvas.height / 2 - 10);

  let btnY = canvas.height / 2 + 60;
  let btnW = 210;
  let btnH = 48;

  ctx.fillStyle = ecopontoOption === 0 ? '#447e72' : '#315b61';
  ctx.fillRect(canvas.width / 2 - 220, btnY, btnW, btnH);
  ctx.fillStyle = '#f5e7be';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText("▶ PRÓXIMA FASE", canvas.width / 2 - 115, btnY + 30);

  ctx.fillStyle = ecopontoOption === 1 ? '#d98d61' : '#315b61';
  ctx.fillRect(canvas.width / 2 + 10, btnY, btnW, btnH);
  ctx.fillStyle = '#f5e7be';
  ctx.fillText("🏁 FINALIZAR CORRIDA", canvas.width / 2 + 115, btnY + 30);

  ctx.textAlign = 'left';
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#d98d61';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = '#d98d61';
  ctx.font = '900 48px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("GAME OVER", canvas.width / 2, 85);

  ctx.fillStyle = '#f5e7be';
  ctx.font = 'bold 20px sans-serif';
  let finalPts = scoreBase + Math.floor(distance);
  ctx.fillText(`JOGADOR: ${playerName || "JOGADOR"} | PONTUAÇÃO FINAL: ${finalPts} PTS`, canvas.width / 2, 125);

  let scores = getScores();
  let podiumX = canvas.width / 2;
  let podiumBaseY = canvas.height - 180;

  ctx.fillText("🏆 PÓDIO 🏆", canvas.width / 2, 175);

  const podiumData = [
    { rank: 2, label: '2º LUGAR', height: 90, width: 120, xOffset: -130, color: '#9bb7ad', textColor: '#f8fafc' },
    { rank: 1, label: '1º LUGAR', height: 130, width: 130, xOffset: 0, color: '#eab308', textColor: '#fef08a' },
    { rank: 3, label: '3º LUGAR', height: 70, width: 120, xOffset: 130, color: '#b45309', textColor: '#ffedd5' }
  ];

  podiumData.forEach(p => {
    let blockX = podiumX + p.xOffset - p.width / 2;
    let blockY = podiumBaseY - p.height;
    let rankData = scores[p.rank - 1];

    ctx.fillStyle = p.color;
    ctx.fillRect(blockX, blockY, p.width, p.height);

    ctx.fillStyle = '#000000';
    ctx.font = '900 22px sans-serif';
    ctx.fillText(`${p.rank}º`, podiumX + p.xOffset, blockY + 35);

    if (rankData) {
      ctx.fillStyle = p.textColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(rankData.name.substring(0, 10), podiumX + p.xOffset, blockY - 25);
      ctx.font = '14px sans-serif';
      ctx.fillText(`${rankData.score} pts`, podiumX + p.xOffset, blockY - 8);
    }
  });

  let optY = canvas.height - 90;
  ctx.fillStyle = gameOverOption === 0 ? '#447e72' : '#475569';
  ctx.fillRect(canvas.width / 2 - 210, optY, 200, 45);
  ctx.fillStyle = '#f5e7be';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText("▶ JOGAR NOVAMENTE", canvas.width / 2 - 110, optY + 28);

  ctx.fillStyle = gameOverOption === 1 ? '#a8df9b' : '#475569';
  ctx.fillRect(canvas.width / 2 + 10, optY, 200, 45);
  ctx.fillStyle = '#f5e7be';
  ctx.fillText("🏠 MENU INICIAL", canvas.width / 2 + 110, optY + 28);

  ctx.textAlign = 'left';
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

requestAnimationFrame(gameLoop);
