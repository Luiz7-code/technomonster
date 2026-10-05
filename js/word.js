// CONFIGURAÇÕES E PARÂMETROS DO JOGO
const GAME_CONFIG = {
  SCALE: 1.35,
  PLAYER_WIDTH: 56,
  PLAYER_HEIGHT: 72,
  OBSTACLE_SIZE: 48,
  ITEM_SIZE: 32,
  PLATFORM_HEIGHT: 26,
  ECOPONTO_WIDTH: 180,
  ECOPONTO_HEIGHT: 230,

  ECOPONTO_SAFE_ZONE_BEFORE: 350,
  ECOPONTO_SAFE_ZONE_AFTER: 350,
  ECOPONTO_INTERVAL: 1100,

  SEA_BUBBLE_SPEED: 0.025,

  SEA_NORMAL: {
    COLOR_WATER: '#059669',
    COLOR_WAVE: '#34d399',
    COLOR_BANNER_BG: 'rgba(6, 78, 59, 0.85)',
    COLOR_TITLE: '#6ee7b7',
    PLAT_COUNT: 5,
    PLAT_SPACING: 220,
    ITEM_CHANCE: 0.65, // Aumentado para gerar muito mais lixo no mar
    MIN_DISTANCE: 400
  },

  SEA_MEGA: {
    COLOR_WATER: '#0284c7',
    COLOR_WAVE: '#38bdf8',
    COLOR_BANNER_BG: 'rgba(12, 74, 110, 0.9)',
    COLOR_TITLE: '#7dd3fc',
    PLAT_COUNT: 11,
    PLAT_SPACING: 230,
    ITEM_CHANCE: 0.85, // Aumentado para gerar abundância de lixo no mega mar
    SPAWN_CHANCE: 0.25
  }
};

// INICIALIZAÇÃO ÚNICA DO CANVAS E CONTEXTO
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let GROUND_Y = window.innerHeight - 110;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  GROUND_Y = canvas.height - 110;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ESTADOS E VARIÁVEIS GLOBAIS
let gameState = 'MENU'; 
let menuOption = 0;     
let pauseOption = 0;    
let gameOverOption = 0; 
let ecopontoOption = 0;
let playerName = '';

// NAVEGAÇÃO DO TECLADO VIRTUAL DE FLIPERAMA
let kbRow = 0;
let kbCol = 0;
const vkGrid = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', '⌫', 'OK']
];

// DADOS DA PARTIDA
let lives = 3;
let phase = 1;
let distance = 0;
let scoreBase = 0;
let totalCleanActions = 0;
let baseSpeed = 5.3; // Velocidade inicial aumentada em 15% (antes 4.6)
let speed = baseSpeed;
let flashRed = 0;
let animTime = 0;

let eWasteInBag = 0;
let seedsInBag = 0;

let items = [];
let obstacles = [];
let platforms = [];
let trees = [];
let floatingMessages = [];
let ecopontoBuilding = null;
let spawnTimer = 0;
let ecopontoTimer = 0;
let scoreSaved = false;

let groundSegments = [];
let nextSeaDistance = 350;

function initGroundSegments() {
  groundSegments = [
    { x: 0, width: canvas.width + 800, type: 'ASPHALT' }
  ];
}

function resetGame() {
  lives = 3;
  phase = 1;
  distance = 0;
  scoreBase = 0;
  totalCleanActions = 0;
  speed = baseSpeed;
  eWasteInBag = 0;
  seedsInBag = 0;
  items = [];
  obstacles = [];
  platforms = [];
  trees = [];
  floatingMessages = [];
  ecopontoBuilding = null;
  spawnTimer = 0;
  ecopontoTimer = 0;
  scoreSaved = false;
  pauseOption = 0;
  ecopontoOption = 0;
  nextSeaDistance = 350;
  initGroundSegments();

  if (typeof player !== 'undefined' && player.reset) {
    player.reset();
  }
}

function interpolateColor(color1, color2, factor) {
  if (color1.startsWith('rgba')) return color1;
  let c1 = parseInt(color1.slice(1), 16);
  let c2 = parseInt(color2.slice(1), 16);

  let r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  let r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;

  let r = Math.round(r1 + factor * (r2 - r1));
  let g = Math.round(g1 + factor * (g2 - g1));
  let b = Math.round(b1 + factor * (b2 - b1));

  return `rgb(${r}, ${g}, ${b})`;
}

function isPositionInSafeZone(x, width = 0) {
  if (ecopontoBuilding) {
    let safeStart = ecopontoBuilding.x - GAME_CONFIG.ECOPONTO_SAFE_ZONE_BEFORE;
    let safeEnd = ecopontoBuilding.x + ecopontoBuilding.width + GAME_CONFIG.ECOPONTO_SAFE_ZONE_AFTER;
    if (x + width > safeStart && x < safeEnd) {
      return true;
    }
  }

  for (let seg of groundSegments) {
    if (seg.type === 'SEA') {
      if (x + width > seg.x && x < seg.x + seg.width) {
        return true;
      }
    }
  }
  return false;
}

function isPositionOverSea(x) {
  for (let seg of groundSegments) {
    if (seg.type === 'SEA') {
      if (x >= seg.x && x <= seg.x + seg.width) {
        return true;
      }
    }
  }
  return false;
}

function showMessage(text) {
  floatingMessages.push({
    text: text,
    x: typeof player !== 'undefined' ? player.x : 120,
    y: typeof player !== 'undefined' ? player.y - 15 : 200,
    alpha: 1.0
  });
}

function triggerGameOver() {
  if (typeof stopBackgroundMusic === 'function') {
    stopBackgroundMusic();
  }
  if (!scoreSaved) {
    saveScore(playerName || "JOGADOR", scoreBase + Math.floor(distance));
    scoreSaved = true;
  }
  gameState = 'GAMEOVER';
}

function updateWorld() {
  if (groundSegments.length === 0) initGroundSegments();

  spawnTimer++;
  ecopontoTimer++;
  animTime++;
  distance += speed * 0.1;

  speed = baseSpeed + Math.floor(distance / 400) * 0.4;

  if (typeof player !== 'undefined' && player.update) {
    player.update();
  }

  for (let i = groundSegments.length - 1; i >= 0; i--) {
    groundSegments[i].x -= speed;
    if (groundSegments[i].x + groundSegments[i].width < -300) {
      groundSegments.splice(i, 1);
    }
  }

  let lastSeg = groundSegments[groundSegments.length - 1];
  if (lastSeg && (lastSeg.x + lastSeg.width) < canvas.width + 600) {
    let newStartX = lastSeg.x + lastSeg.width;

    if (distance >= nextSeaDistance && lastSeg.type === 'ASPHALT') {
      let isMega = Math.random() < GAME_CONFIG.SEA_MEGA.SPAWN_CHANCE;
      let seaCfg = isMega ? GAME_CONFIG.SEA_MEGA : GAME_CONFIG.SEA_NORMAL;
      let seaWidth = seaCfg.PLAT_COUNT * seaCfg.PLAT_SPACING + 140;

      groundSegments.push({
        x: newStartX,
        width: seaWidth,
        type: 'SEA',
        seaType: isMega ? 'MEGA' : 'NORMAL'
      });

      for (let p = 0; p < seaCfg.PLAT_COUNT; p++) {
        let pX = newStartX + 70 + p * seaCfg.PLAT_SPACING;
        let pY = GROUND_Y - 90 - (p % 2 === 0 ? 0 : 40);
        let pW = 120 + Math.random() * 30;

        platforms.push({ x: pX, y: pY, width: pW });

        // Maior frequência e priorização de lixo e e-lixo no mar
        if (Math.random() < seaCfg.ITEM_CHANCE) {
          let itemTypes = ['RECICLAVEL', 'ELETRONICO', 'RECICLAVEL', 'ELETRONICO', 'SEMENTE'];
          let chosenItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
          items.push({ 
            x: pX + pW / 2, 
            y: pY - 28, 
            type: chosenItem,
            variant: Math.floor(Math.random() * 3)
          });
        }
      }

      nextSeaDistance = distance + GAME_CONFIG.SEA_NORMAL.MIN_DISTANCE + Math.random() * 500;
    } else {
      groundSegments.push({
        x: newStartX,
        width: 800 + Math.random() * 400,
        type: 'ASPHALT'
      });
    }
  }

  if (spawnTimer % 75 === 0) {
    spawnElements();
  }

  if (ecopontoTimer > GAME_CONFIG.ECOPONTO_INTERVAL && !ecopontoBuilding) {
    let spawnX = canvas.width + 100;
    if (!isPositionOverSea(spawnX) && !isPositionOverSea(spawnX + GAME_CONFIG.ECOPONTO_WIDTH)) {
      ecopontoBuilding = { x: spawnX, width: GAME_CONFIG.ECOPONTO_WIDTH, height: GAME_CONFIG.ECOPONTO_HEIGHT };
      ecopontoTimer = 0;
    }
  }

  if (ecopontoBuilding) {
    obstacles = obstacles.filter(obs => !isPositionInSafeZone(obs.x, obs.width));
    items = items.filter(it => !isPositionInSafeZone(it.x, GAME_CONFIG.ITEM_SIZE) || it.y < GROUND_Y - 40);
  }

  for (let i = platforms.length - 1; i >= 0; i--) {
    platforms[i].x -= speed;
    if (platforms[i].x + platforms[i].width < -100) {
      platforms.splice(i, 1);
    }
  }

  for (let i = items.length - 1; i >= 0; i--) {
    items[i].x -= speed;

    if (items[i].type === 'SEMENTE' && isPlayerNearItem(items[i])) {
      seedsInBag++;
      showMessage("+1 Semente Coletada! 🌱");
      items.splice(i, 1);
      continue;
    }

    if (items[i].x < -100) items.splice(i, 1);
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= speed;
    if (
      typeof player !== 'undefined' &&
      player.invulnerableTimer <= 0 &&
      player.x < obstacles[i].x + obstacles[i].width &&
      player.x + player.width > obstacles[i].x &&
      player.y < obstacles[i].y + obstacles[i].height &&
      player.y + player.height > obstacles[i].y
    ) {
      lives--;
      flashRed = 15;
      player.invulnerableTimer = 35;
      showMessage("Dano! -1 Vida 💔");
      obstacles.splice(i, 1);
      if (lives <= 0) {
        triggerGameOver();
      }
      continue;
    }
    if (obstacles[i] && obstacles[i].x < -100) obstacles.splice(i, 1);
  }

  for (let i = trees.length - 1; i >= 0; i--) {
    trees[i].x -= speed;
    if (trees[i].x < -100) trees.splice(i, 1);
  }

  if (ecopontoBuilding) {
    ecopontoBuilding.x -= speed;
    if (typeof player !== 'undefined' && player.x + player.width >= ecopontoBuilding.x) {
      if (eWasteInBag > 0) {
        seedsInBag += eWasteInBag * 2;
        scoreBase += eWasteInBag * 30;
        totalCleanActions += eWasteInBag * 3;
        eWasteInBag = 0;
      }
      ecopontoOption = 0;
      gameState = 'ECOPONTO_PAUSE';
      ecopontoBuilding = null;
    }
  }
}

function continueFromEcoponto() {
  phase++;
  gameState = 'PLAYING';
}

function spawnElements() {
  let spawnX = canvas.width + 50;
  if (isPositionInSafeZone(spawnX, 100)) return;

  let rand = Math.random();
  if (rand < 0.4) {
    let platY = GROUND_Y - 110 - Math.random() * 50;
    let platW = 150 + Math.random() * 50;
    platforms.push({ x: spawnX, y: platY, width: platW });

    let itemType = Math.random() < 0.5 ? 'RECICLAVEL' : 'ELETRONICO';
    items.push({ 
      x: spawnX + platW / 2, 
      y: platY - 28, 
      type: itemType, 
      variant: Math.floor(Math.random() * 3) 
    });
  } else if (rand < 0.8) {
    let types = ['RECICLAVEL', 'ELETRONICO', 'CANTEIRO', 'SEMENTE'];
    let chosenType = types[Math.floor(Math.random() * types.length)];
    items.push({ 
      x: spawnX, 
      y: GROUND_Y - 28, 
      type: chosenType, 
      variant: Math.floor(Math.random() * 3) 
    });
  } else {
    obstacles.push({ x: spawnX, y: GROUND_Y - GAME_CONFIG.OBSTACLE_SIZE, width: GAME_CONFIG.OBSTACLE_SIZE, height: GAME_CONFIG.OBSTACLE_SIZE });
  }
}

function isPlayerNearItem(item) {
  if (typeof player === 'undefined') return false;
  let playerCenterX = player.x + player.width / 2;
  let playerCenterY = player.y + player.height / 2;
  let dist = Math.hypot(playerCenterX - item.x, playerCenterY - item.y);
  return dist < 95;
}

// CENA URBAN - PRÉDIOS GIGANTES
function drawParallaxCity() {
  let cleanProgress = Math.min(1, totalCleanActions / 120);

  // Céu
  let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (cleanProgress < 1) {
    skyGrad.addColorStop(0, interpolateColor('#0f172a', '#38bdf8', cleanProgress));
    skyGrad.addColorStop(0.6, interpolateColor('#1e293b', '#60a5fa', cleanProgress));
    skyGrad.addColorStop(1, interpolateColor('#291e1d', '#93c5fd', cleanProgress));
  } else {
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#93c5fd');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sol
  let sunColor = interpolateColor('rgba(234, 179, 8, 0.25)', 'rgba(250, 204, 21, 0.95)', cleanProgress);
  ctx.fillStyle = sunColor;
  ctx.beginPath();
  ctx.arc(canvas.width - 160, 110, 85, 0, Math.PI * 2);
  ctx.fill();

  // Camada 1: Prédios do fundo (até 620px de altura)
  let p1 = Math.floor((distance * 1.2) % 1400);
  let bgBuildingColor = interpolateColor('#1e1b2e', '#64748b', cleanProgress);
  ctx.fillStyle = bgBuildingColor;
  for (let x = -1400; x < canvas.width + 1400; x += 300) {
    let rx = Math.floor(x - p1);
    ctx.fillRect(rx, GROUND_Y - 620, 190, 620);
    ctx.fillRect(rx + 200, GROUND_Y - 520, 130, 520);
  }

  // Camada 2: Prédios da frente (480px de altura)
  let p2 = Math.floor((distance * 2.5) % 1400);
  const buildingColors = ['#f43f5e', '#fb923c', '#fbbf24', '#818cf8', '#38bdf8'];

  for (let x = -1400; x < canvas.width + 1400; x += 250) {
    let rx = Math.floor(x - p2);
    let bIndex = Math.abs(Math.floor(x / 250)) % buildingColors.length;
    let finalColor = interpolateColor('#334155', buildingColors[bIndex], cleanProgress);
    ctx.fillStyle = finalColor;
    ctx.fillRect(rx, GROUND_Y - 480, 180, 480);

    ctx.fillStyle = cleanProgress > 0.5 ? '#fef08a' : '#f59e0b';
    const windowRows = [440, 380, 320, 260, 200, 140, 80];
    windowRows.forEach(wY => {
      ctx.fillRect(rx + 24, GROUND_Y - wY, 26, 26);
      ctx.fillRect(rx + 77, GROUND_Y - wY, 26, 26);
      ctx.fillRect(rx + 130, GROUND_Y - wY, 26, 26);
    });
  }

  // Pista / Chão / Mar de Lixo
  let activeSeaConfig = null;
  let activeSeaTypeStr = null;

  for (let seg of groundSegments) {
    if (seg.x + seg.width > 0 && seg.x < canvas.width) {
      let renderX = Math.floor(seg.x);

      if (seg.type === 'ASPHALT') {
        ctx.fillStyle = interpolateColor('#0f172a', '#475569', cleanProgress);
        ctx.fillRect(renderX, GROUND_Y, seg.width, canvas.height - GROUND_Y);

        ctx.fillStyle = interpolateColor('#334155', '#fde047', cleanProgress);
        ctx.fillRect(renderX, GROUND_Y, seg.width, 8);
      } else if (seg.type === 'SEA') {
        let seaCfg = seg.seaType === 'MEGA' ? GAME_CONFIG.SEA_MEGA : GAME_CONFIG.SEA_NORMAL;
        activeSeaConfig = seaCfg;
        activeSeaTypeStr = seg.seaType;

        ctx.fillStyle = seaCfg.COLOR_WATER;
        ctx.fillRect(renderX, GROUND_Y, seg.width, canvas.height - GROUND_Y);

        ctx.fillStyle = seaCfg.COLOR_WAVE;
        for (let bx = Math.max(0, renderX); bx < Math.min(canvas.width, renderX + seg.width); bx += 26) {
          let waveY = GROUND_Y + Math.sin((animTime * GAME_CONFIG.SEA_BUBBLE_SPEED) + bx * 0.04) * 5;
          ctx.beginPath();
          ctx.arc(bx, waveY, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(renderX - 7, GROUND_Y, 7, 40);
        ctx.fillRect(renderX + seg.width, GROUND_Y, 7, 40);
      }
    }
  }

  if (activeSeaConfig) {
    ctx.fillStyle = activeSeaConfig.COLOR_BANNER_BG;
    ctx.fillRect(0, canvas.height - 45, canvas.width, 45);

    ctx.fillStyle = activeSeaConfig.COLOR_TITLE;
    ctx.font = 'bold 17px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    let title = activeSeaTypeStr === 'MEGA' 
      ? `⚡ DESAFIO ESPECIAL: MEGA MAR DE LIXO TÓXICO!` 
      : `🌊 TRAVESSIA: MAR DE LIXO`;
    ctx.fillText(title, canvas.width / 2, canvas.height - 18);
    ctx.textAlign = 'left';
  }
}

function drawFloatingMessages() {
  for (let i = floatingMessages.length - 1; i >= 0; i--) {
    let msg = floatingMessages[i];
    ctx.fillStyle = `rgba(250, 204, 21, ${msg.alpha})`;
    ctx.font = 'bold 17px Segoe UI, sans-serif';
    ctx.fillText(msg.text, msg.x, msg.y);
    msg.y -= 1;
    msg.alpha -= 0.02;
    if (msg.alpha <= 0) floatingMessages.splice(i, 1);
  }
}

function drawPlatforms() {
  for (let p of platforms) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.width, GAME_CONFIG.PLATFORM_HEIGHT);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.width, 5);
  }
}

// DESENHO VISUAL DOS ITENS (3 VARIANTES PARA CADA)
function drawItems() {
  for (let item of items) {
    let rx = Math.floor(item.x);
    let ry = Math.floor(item.y);
    let variant = item.variant || 0;

    if (item.type === 'RECICLAVEL') {
      if (variant === 0) {
        // Garrafa Plástica
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(rx - 7, ry - 10, 14, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(rx - 7, ry - 3, 14, 8);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(rx - 4, ry - 14, 8, 4);
      } else if (variant === 1) {
        // Lata de Alumínio
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rx - 8, ry - 12, 16, 24);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(rx - 8, ry - 12, 16, 3);
        ctx.fillRect(rx - 8, ry + 9, 16, 3);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(rx - 5, ry - 9, 3, 18);
      } else {
        // Caixa de Papelão / Tetra Pak
        ctx.fillStyle = '#d97706';
        ctx.fillRect(rx - 10, ry - 12, 20, 24);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx - 10, ry - 2, 20, 6);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(rx - 10, ry - 12, 20, 4);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("[C] PEGAR", rx - 24, ry - 18);

    } else if (item.type === 'ELETRONICO') {
      if (variant === 0) {
        // Smartphone
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx - 8, ry - 14, 16, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(rx - 6, ry - 11, 12, 20);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(rx, ry + 10, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (variant === 1) {
        // Placa de Circuito
        ctx.fillStyle = '#15803d';
        ctx.fillRect(rx - 12, ry - 10, 24, 20);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx - 10, ry - 10, 3, 20);
        ctx.fillRect(rx + 7, ry - 10, 3, 20);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rx - 4, ry - 5, 8, 10);
      } else {
        // Monitor CRT Antigo
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx - 12, ry - 12, 24, 22);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(rx - 9, ry - 9, 18, 14);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx + 6, ry + 6, 3, 3);
      }

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("[X] GUARDAR", rx - 32, ry - 18);

    } else if (item.type === 'SEMENTE') {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(rx, ry, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("🌱 SEMENTE", rx - 28, ry - 18);
    } else if (item.type === 'CANTEIRO') {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(rx - 25, ry, 50, 20);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("[Y] PLANTAR", rx - 30, ry - 8);
    }
  }
}

function drawObstacles() {
  ctx.fillStyle = '#ef4444';
  for (let obs of obstacles) {
    ctx.fillRect(Math.floor(obs.x), Math.floor(obs.y), obs.width, obs.height);
  }
}

function drawTrees() {
  for (let tree of trees) {
    let rx = Math.floor(tree.x);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(rx - 10, GROUND_Y - 75, 20, 75);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(rx, GROUND_Y - 80, 38, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEcopontoBuilding() {
  if (ecopontoBuilding) {
    let rx = Math.floor(ecopontoBuilding.x);
    let bY = GROUND_Y - ecopontoBuilding.height;

    ctx.fillStyle = '#10b981';
    ctx.fillRect(rx, bY, ecopontoBuilding.width, ecopontoBuilding.height);

    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(rx - 14, bY);
    ctx.lineTo(rx + ecopontoBuilding.width / 2, bY - 40);
    ctx.lineTo(rx + ecopontoBuilding.width + 14, bY);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.fillRect(rx + 18, bY + 45, ecopontoBuilding.width - 36, 45);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Segoe UI, sans-serif';
    ctx.fillText("♻ ECOPONTO", rx + 24, bY + 74);
  }
}

function saveScore(name, score) {
  if (!name || name.trim() === '') return;
  let scores = getScores();
  scores.push({ name: name, score: score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('techno_monster_scores', JSON.stringify(scores.slice(0, 5)));
}

function getScores() {
  let saved = localStorage.getItem('techno_monster_scores');
  return saved ? JSON.parse(saved) : [];
}

initGroundSegments();