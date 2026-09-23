// GERENCIADOR DE ÁUDIO
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
    playBackgroundMusic();
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('click', unlockAudio);
  };
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('click', unlockAudio);
}
setupArcadeAudio();

// RENDERIZAÇÃO DAS TELAS DO JOGO
function drawGameWorld() {
  drawParallaxCity();
  drawTrees();
  drawEcopontoBuilding();
  drawPlatforms();
  drawItems();
  drawObstacles();
  player.draw();
  drawFloatingMessages();
}

function drawHUD() {
  ctx.font = 'bold 16px Segoe UI, sans-serif';
  let yPos = 35;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.fillRect(0, 0, canvas.width, 50);

  ctx.fillStyle = '#a855f7';
  ctx.fillText(`👤 ${playerName || "JOGADOR"}`, 25, yPos);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Vidas: `, 175, yPos);
  ctx.fillStyle = '#ef4444';
  ctx.fillText('❤️'.repeat(Math.max(0, lives)), 230, yPos);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Fase: ${phase}`, 340, yPos);
  ctx.fillText(`Pontos: ${scoreBase + Math.floor(distance)}`, 450, yPos);
  ctx.fillText(`Mochila: 📦 ${eWasteInBag}`, 610, yPos);
  ctx.fillText(`Sementes: 🌱 ${seedsInBag}`, 770, yPos);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(canvas.width - 110, 12, 80, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Segoe UI, sans-serif';
  ctx.fillText("⏸ [P]", canvas.width - 95, 33);
}

function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 42px Segoe UI, sans-serif';
  ctx.fillText("JOGO PAUSADO", canvas.width / 2, canvas.height / 2 - 50);

  let btnY = canvas.height / 2 + 10;
  let btnW = 210;
  let btnH = 48;

  // Botão 0: Continuar
  ctx.fillStyle = pauseOption === 0 ? '#22c55e' : '#334155';
  ctx.fillRect(canvas.width / 2 - 220, btnY, btnW, btnH);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Segoe UI, sans-serif';
  ctx.fillText("▶ CONTINUAR", canvas.width / 2 - 115, btnY + 30);

  // Botão 1: Sair para o Menu
  ctx.fillStyle = pauseOption === 1 ? '#ef4444' : '#334155';
  ctx.fillRect(canvas.width / 2 + 10, btnY, btnW, btnH);
  ctx.fillStyle = '#ffffff';
  ctx.fillText("🏠 SAIR PARA O MENU", canvas.width / 2 + 115, btnY + 30);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Segoe UI, sans-serif';
  ctx.fillText("USE AS SETAS (← / →) PARA NAVEGAR | ENTER PARA CONFIRMAR OU P PARA DESPAUSAR", canvas.width / 2, canvas.height / 2 + 90);

  ctx.textAlign = 'left';
}

function drawMenuScreen() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 48px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("TECHNOMONSTER", canvas.width / 2, 130);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 20px Segoe UI, sans-serif';
  ctx.fillText(" SALVE A CIDADE DO LIXO! ", canvas.width / 2, 175);

  let btnY1 = canvas.height / 2 - 20;
  ctx.fillStyle = menuOption === 0 ? '#22c55e' : '#334155';
  ctx.fillRect(canvas.width / 2 - 120, btnY1, 240, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Segoe UI, sans-serif';
  ctx.fillText("▶ JOGAR", canvas.width / 2, btnY1 + 32);

  let btnY2 = canvas.height / 2 + 50;
  ctx.fillStyle = menuOption === 1 ? '#38bdf8' : '#334155';
  ctx.fillRect(canvas.width / 2 - 120, btnY2, 240, 50);
  ctx.fillStyle = '#ffffff';
  ctx.fillText("🎮 CONTROLES", canvas.width / 2, btnY2 + 32);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Segoe UI, sans-serif';
  ctx.fillText("USE AS SETAS (↑ / ↓) PARA NAVEGAR E ENTER PARA SELECIONAR", canvas.width / 2, canvas.height - 40);

  ctx.textAlign = 'left';
}

function drawControlsScreen() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 36px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("🎮 CONTROLES DO JOGO", canvas.width / 2, 75);

  const controlsList = [
    { key: "SETA CIMA / ESPAÇO / W", action: "Pulo Duplo" },
    { key: "TECLA [C]", action: "Coletar Lixo Reciclável" },
    { key: "TECLA [X]", action: "Guardar E-Lixo na Mochila" },
    { key: "TECLA [Y]", action: "Plantar Sementes no Canteiro" },
    { key: "SEMENTES 🌱", action: "Coleta Automática ao Encostar" }
  ];

  let startY = 125;
  controlsList.forEach((c, index) => {
    let rowY = startY + index * 42;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(canvas.width / 2 - 230, rowY, 460, 34);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(c.key, canvas.width / 2 - 210, rowY + 22);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(c.action, canvas.width / 2 + 210, rowY + 22);
  });

  let btnY = canvas.height - 90;
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(canvas.width / 2 - 100, btnY, 200, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("⬅ VOLTAR", canvas.width / 2, btnY + 28);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Segoe UI, sans-serif';
  ctx.fillText("PRESSIONE ENTER OU ESPAÇO PARA VOLTAR", canvas.width / 2, canvas.height - 25);

  ctx.textAlign = 'left';
}

function drawNicknameScreen() {
  drawParallaxCity();
  ctx.textAlign = 'center';

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 42px Segoe UI, sans-serif';
  ctx.fillText("TECHNOMONSTER", canvas.width / 2, canvas.height / 2 - 190);

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Segoe UI, sans-serif';
  ctx.fillText("Escolha o seu Nickname no Joystick:", canvas.width / 2, canvas.height / 2 - 145);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 125, 320, 48);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width / 2 - 160, canvas.height / 2 - 125, 320, 48);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px Segoe UI, sans-serif';
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

      ctx.fillStyle = isSelected ? '#facc15' : '#1e293b';
      ctx.fillRect(kx, ky, keyWidth, keyHeight);

      ctx.strokeStyle = isSelected ? '#ffffff' : '#334155';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(kx, ky, keyWidth, keyHeight);

      ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
      ctx.font = isSelected ? 'bold 20px Segoe UI, sans-serif' : '18px Segoe UI, sans-serif';
      ctx.fillText(char, kx + keyWidth / 2, ky + keyHeight / 2 + 7);
    });
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Segoe UI, sans-serif';
  ctx.fillText("🕹️ Use O JOYSTICK / SETAS para navegar e ESPAÇO / ENTER para selecionar", canvas.width / 2, canvas.height - 35);

  ctx.textAlign = 'left';
}

function drawStartScreen() {
  drawParallaxCity();
  ctx.textAlign = 'center';

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 48px Segoe UI, sans-serif';
  ctx.fillText("TECHNOMONSTER", canvas.width / 2, canvas.height / 2 - 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = '22px Segoe UI, sans-serif';
  ctx.fillText(`Olá, ${playerName || "JOGADOR"}! Limpe a cidade para fazê-la brilhar novamente.`, canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px Segoe UI, sans-serif';
  ctx.fillText("Pressione ESPAÇO ou SETA CIMA para iniciar", canvas.width / 2, canvas.height / 2 + 60);

  ctx.textAlign = 'left';
}

function drawEcopontoOverlay() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 38px Segoe UI, sans-serif';
  ctx.fillText("ECOPONTO ALCANÇADO!", canvas.width / 2, canvas.height / 2 - 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Segoe UI, sans-serif';
  ctx.fillText(`Entregou o E-Lixo da mochila!`, canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText(`Ganhou sementes para plantar e iluminar a cidade.`, canvas.width / 2, canvas.height / 2 + 20);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 22px Segoe UI, sans-serif';
  ctx.fillText("Pressione ESPAÇO para continuar", canvas.width / 2, canvas.height / 2 + 80);

  ctx.textAlign = 'left';
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = '#ef4444';
  ctx.font = '900 48px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("GAME OVER", canvas.width / 2, 85);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Segoe UI, sans-serif';
  let finalPts = scoreBase + Math.floor(distance);
  ctx.fillText(`JOGADOR: ${playerName || "JOGADOR"} | PONTUAÇÃO FINAL: ${finalPts} PTS`, canvas.width / 2, 125);

  let scores = getScores();
  let podiumX = canvas.width / 2;
  let podiumBaseY = canvas.height - 180;

  ctx.fillText("🏆 PÓDIO 🏆", canvas.width / 2, 175);

  const podiumData = [
    { rank: 2, label: '2º LUGAR', height: 90, width: 120, xOffset: -130, color: '#94a3b8', textColor: '#f8fafc' },
    { rank: 1, label: '1º LUGAR', height: 130, width: 130, xOffset: 0, color: '#eab308', textColor: '#fef08a' },
    { rank: 3, label: '3º LUGAR', height: 70, width: 120, xOffset: 130, color: '#b45309', textColor: '#ffedd5' }
  ];

  podiumData.forEach(p => {
    let blockX = podiumX + p.xOffset - p.width / 2;
    let blockY = podiumBaseY - p.height;
    let rankData = scores[p.rank - 1];

    let isCurrentPlayer = rankData && rankData.name === playerName && rankData.score === finalPts;

    ctx.fillStyle = p.color;
    ctx.fillRect(blockX, blockY, p.width, p.height);

    if (isCurrentPlayer) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(blockX - 4, blockY - 4, p.width + 8, p.height + 8);
    }

    ctx.fillStyle = '#000000';
    ctx.font = '900 22px Segoe UI, sans-serif';
    ctx.fillText(`${p.rank}º`, podiumX + p.xOffset, blockY + 35);

    if (rankData) {
      ctx.fillStyle = p.textColor;
      ctx.font = 'bold 15px Segoe UI, sans-serif';
      ctx.fillText(rankData.name.substring(0, 10), podiumX + p.xOffset, blockY - 25);
      ctx.font = '14px Segoe UI, sans-serif';
      ctx.fillText(`${rankData.score} pts`, podiumX + p.xOffset, blockY - 8);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 14px Segoe UI, sans-serif';
      ctx.fillText("Vago", podiumX + p.xOffset, blockY - 12);
    }
  });

  ctx.fillStyle = '#334155';
  ctx.fillRect(podiumX - 220, podiumBaseY, 440, 15);

  let optY = canvas.height - 90;

  ctx.fillStyle = gameOverOption === 0 ? '#22c55e' : '#475569';
  ctx.fillRect(canvas.width / 2 - 210, optY, 200, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Segoe UI, sans-serif';
  ctx.fillText("▶ JOGAR NOVAMENTE", canvas.width / 2 - 110, optY + 28);

  ctx.fillStyle = gameOverOption === 1 ? '#38bdf8' : '#475569';
  ctx.fillRect(canvas.width / 2 + 10, optY, 200, 45);
  ctx.fillStyle = '#ffffff';
  ctx.fillText("🏠 MENU INICIAL", canvas.width / 2 + 110, optY + 28);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px Segoe UI, sans-serif';
  ctx.fillText("USE AS SETAS (← / →) PARA SELECIONAR E PRESSIONE ENTER", canvas.width / 2, canvas.height - 25);

  ctx.textAlign = 'left';
}

// GAME LOOP PRINCIPAL
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (gameState) {
    case 'MENU':
      drawMenuScreen();
      break;
    case 'CONTROLS':
      drawControlsScreen();
      break;
    case 'NICKNAME':
      drawNicknameScreen();
      break;
    case 'START':
      drawStartScreen();
      break;
    case 'PLAYING':
      updateWorld();
      drawGameWorld();
      drawHUD();
      break;
    case 'PAUSED':
      drawGameWorld();
      drawHUD();
      drawPauseOverlay();
      break;
    case 'ECOPONTO_PAUSE':
      drawGameWorld();
      drawHUD();
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