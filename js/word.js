// CONFIGURAÇÕES E PARÂMETROS DO JOGO
const GAME_CONFIG = {
  SCALE: 1.35,
  PLAYER_WIDTH: 56,
  PLAYER_HEIGHT: 72,
  OBSTACLE_SIZE: 48,
  ITEM_SIZE: 32,
  PLATFORM_HEIGHT: 24,
  ECOPONTO_WIDTH: 180,
  ECOPONTO_HEIGHT: 230,

  ECOPONTO_SAFE_ZONE_BEFORE: 350,
  ECOPONTO_SAFE_ZONE_AFTER: 350,
  ECOPONTO_INTERVAL: 1100,

  SEA_BUBBLE_SPEED: 0.025,

  TIERS: [
    0,    // Tier 0: Chão
    85,   // Tier 1: Baixo
    160,  // Tier 2: Médio
    225   // Tier 3: Alto
  ],

  SEA_NORMAL: {
    COLOR_WATER: '#059669',
    COLOR_WAVE: '#34d399',
    COLOR_BANNER_BG: 'rgba(6, 78, 59, 0.85)',
    COLOR_TITLE: '#6ee7b7',
    PLAT_COUNT: 7,
    PLAT_SPACING: 260,
    ITEM_CHANCE: 0.7,
    MIN_DISTANCE: 400
  },

  SEA_MEGA: {
    COLOR_WATER: '#0284c7',
    COLOR_WAVE: '#38bdf8',
    COLOR_BANNER_BG: 'rgba(12, 74, 110, 0.9)',
    COLOR_TITLE: '#7dd3fc',
    PLAT_COUNT: 12,
    PLAT_SPACING: 260,
    ITEM_CHANCE: 0.85,
    SPAWN_CHANCE: 0.3
  }
};

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

let gameState = 'MENU'; 
let menuOption = 0;     
let pauseOption = 0;    
let gameOverOption = 0; 
let ecopontoOption = 0;
let playerName = '';

let particles = [];
let screenShake = 0;

function createParticles(x, y, color, count = 12, speedMult = 1) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6 * speedMult,
      vy: (Math.random() - 0.7) * 5 * speedMult,
      size: Math.random() * 5 + 3,
      color: color,
      life: 1.0,
      decay: Math.random() * 0.04 + 0.02
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (let p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x - p.size / 2), Math.floor(p.y - p.size / 2), p.size, p.size);
    ctx.restore();
  }
}

let kbRow = 0;
let kbCol = 0;
const vkGrid = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', '⌫', 'OK']
];

let lives = 3;
let phase = 1;
let distance = 0;
let scoreBase = 0;
let totalCleanActions = 0;
let baseSpeed = 5.3;
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
  groundSegments = [{ x: 0, width: canvas.width + 800, type: 'ASPHALT' }];
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
  particles = [];
  screenShake = 0;
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
    if (x + width > safeStart && x < safeEnd) return true;
  }

  for (let seg of groundSegments) {
    if (seg.type === 'SEA' && x + width > seg.x && x < seg.x + seg.width) return true;
  }
  return false;
}

function isPositionOverSea(x) {
  for (let seg of groundSegments) {
    if (seg.type === 'SEA' && x >= seg.x && x <= seg.x + seg.width) return true;
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
  if (typeof stopBackgroundMusic === 'function') stopBackgroundMusic();
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

  if (screenShake > 0) screenShake--;
  updateParticles();

  speed = baseSpeed + Math.floor(distance / 400) * 0.4;

  if (typeof player !== 'undefined' && player.update) player.update();

  for (let i = groundSegments.length - 1; i >= 0; i--) {
    groundSegments[i].x -= speed;
    if (groundSegments[i].x + groundSegments[i].width < -300) groundSegments.splice(i, 1);
  }

  let lastSeg = groundSegments[groundSegments.length - 1];
  if (lastSeg && (lastSeg.x + lastSeg.width) < canvas.width + 600) {
    let newStartX = lastSeg.x + lastSeg.width;

    if (distance >= nextSeaDistance && lastSeg.type === 'ASPHALT') {
      let isMega = Math.random() < GAME_CONFIG.SEA_MEGA.SPAWN_CHANCE;
      let seaCfg = isMega ? GAME_CONFIG.SEA_MEGA : GAME_CONFIG.SEA_NORMAL;
      let seaWidth = seaCfg.PLAT_COUNT * seaCfg.PLAT_SPACING + 180;

      groundSegments.push({
        x: newStartX,
        width: seaWidth,
        type: 'SEA',
        seaType: isMega ? 'MEGA' : 'NORMAL'
      });

      let patternType = Math.floor(Math.random() * 2);

      for (let p = 0; p < seaCfg.PLAT_COUNT; p++) {
        let pX = newStartX + 80 + p * seaCfg.PLAT_SPACING;
        let pW = 200 + Math.random() * 50; 
        let pY = GROUND_Y - GAME_CONFIG.TIERS[1];

        if (patternType === 0) {
          let tierIndex = 1 + (p % 3);
          pY = GROUND_Y - GAME_CONFIG.TIERS[tierIndex];
        } else {
          let tierIndex = (p % 2 === 0) ? 3 : 1;
          pY = GROUND_Y - GAME_CONFIG.TIERS[tierIndex];
          
          if (tierIndex === 3) {
            platforms.push({ x: pX - 110, y: GROUND_Y - GAME_CONFIG.TIERS[1], width: 110 });
          }
        }

        platforms.push({ x: pX, y: pY, width: pW });

        let hasDrone = (pY <= GROUND_Y - GAME_CONFIG.TIERS[1]) && (Math.random() < 0.60);

        if (hasDrone) {
          obstacles.push({
            x: pX + pW - 55, 
            y: pY - 65,
            width: 44,
            height: 44,
            isAerial: true
          });
          items.push({ 
            x: pX + 45, 
            y: pY - 28, 
            type: 'RECICLAVEL',
            variant: Math.floor(Math.random() * 3)
          });
        } else if (Math.random() < seaCfg.ITEM_CHANCE) {
          let itemTypes = ['RECICLAVEL', 'ELETRONICO', 'RECICLAVEL', 'SEMENTE'];
          items.push({ 
            x: pX + pW / 2, 
            y: pY - 28, 
            type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
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

  if (spawnTimer % 55 === 0) spawnElements();

  if (ecopontoTimer > GAME_CONFIG.ECOPONTO_INTERVAL && !ecopontoBuilding) {
    let spawnX = canvas.width + 100;
    if (!isPositionOverSea(spawnX) && !isPositionOverSea(spawnX + GAME_CONFIG.ECOPONTO_WIDTH)) {
      ecopontoBuilding = { x: spawnX, width: GAME_CONFIG.ECOPONTO_WIDTH, height: GAME_CONFIG.ECOPONTO_HEIGHT };
      ecopontoTimer = 0;
      
      // Filtra a área segura de obstáculos apenas UMA VEZ na criação do Ecoponto
      let safeStart = spawnX - GAME_CONFIG.ECOPONTO_SAFE_ZONE_BEFORE;
      let safeEnd = spawnX + GAME_CONFIG.ECOPONTO_WIDTH + GAME_CONFIG.ECOPONTO_SAFE_ZONE_AFTER;
      
      obstacles = obstacles.filter(obs => !(obs.x + obs.width > safeStart && obs.x < safeEnd));
      items = items.filter(it => !(it.x + GAME_CONFIG.ITEM_SIZE > safeStart && it.x < safeEnd) || it.y < GROUND_Y - 40);
    }
  }

  for (let i = platforms.length - 1; i >= 0; i--) {
    platforms[i].x -= speed;
    if (platforms[i].x + platforms[i].width < -100) platforms.splice(i, 1);
  }

  for (let i = items.length - 1; i >= 0; i--) {
    items[i].x -= speed;

    if (items[i].type === 'SEMENTE' && isPlayerNearItem(items[i])) {
      seedsInBag++;
      createParticles(items[i].x, items[i].y, '#22c55e', 14, 1.2);
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
      flashRed = 20;
      screenShake = 16;
      createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ef4444', 18, 1.4);
      player.invulnerableTimer = 35;
      showMessage("Dano! -1 Vida 💔");
      obstacles.splice(i, 1);
      if (lives <= 0) triggerGameOver();
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

  if (rand < 0.45) { // Plataformas
    let tierIndex = Math.floor(Math.random() * 3) + 1; 
    let platY = GROUND_Y - GAME_CONFIG.TIERS[tierIndex];
    let platW = 220 + Math.random() * 60; 

    if (tierIndex === 3) {
      platforms.push({ 
        x: spawnX, 
        y: GROUND_Y - GAME_CONFIG.TIERS[1], 
        width: 120 
      });
      spawnX += 130; 
    }

    platforms.push({ x: spawnX, y: platY, width: platW });

    // MAIS DRONES NA CIDADE
    let hasDrone = (tierIndex >= 1) && (Math.random() < 0.55);

    if (hasDrone) {
      obstacles.push({
        x: spawnX + platW - 55, 
        y: platY - 65,
        width: 44,
        height: 44,
        isAerial: true
      });
      items.push({ 
        x: spawnX + 45, 
        y: platY - 28, 
        type: 'RECICLAVEL', 
        variant: Math.floor(Math.random() * 3) 
      });
    } else {
      let itemType = Math.random() < 0.5 ? 'RECICLAVEL' : 'ELETRONICO';
      items.push({ 
        x: spawnX + platW / 2, 
        y: platY - 28, 
        type: itemType, 
        variant: Math.floor(Math.random() * 3) 
      });
    }

  } else if (rand < 0.85) { // MAIS CANTEIROS E ITENS NO CHÃO
    let types = ['CANTEIRO', 'CANTEIRO', 'CANTEIRO', 'RECICLAVEL', 'ELETRONICO', 'SEMENTE'];
    items.push({ 
      x: spawnX, 
      y: GROUND_Y - 28, 
      type: types[Math.floor(Math.random() * types.length)], 
      variant: Math.floor(Math.random() * 3) 
    });
  } else {
    obstacles.push({ 
      x: spawnX, 
      y: GROUND_Y - GAME_CONFIG.OBSTACLE_SIZE, 
      width: GAME_CONFIG.OBSTACLE_SIZE, 
      height: GAME_CONFIG.OBSTACLE_SIZE,
      isAerial: false
    });
  }
}

function isPlayerNearItem(item) {
  if (typeof player === 'undefined') return false;
  let dist = Math.hypot((player.x + player.width / 2) - item.x, (player.y + player.height / 2) - item.y);
  return dist < 95;
}

function drawParallaxCity() {
  let cleanProgress = Math.min(1, totalCleanActions / 120);

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

  ctx.fillStyle = interpolateColor('rgba(234, 179, 8, 0.25)', 'rgba(250, 204, 21, 0.95)', cleanProgress);
  ctx.beginPath();
  ctx.arc(canvas.width - 160, 110, 85, 0, Math.PI * 2);
  ctx.fill();

  let p1 = Math.floor((distance * 1.2) % 1400);
  ctx.fillStyle = interpolateColor('#1e1b2e', '#64748b', cleanProgress);
  for (let x = -1400; x < canvas.width + 1400; x += 300) {
    let rx = Math.floor(x - p1);
    ctx.fillRect(rx, GROUND_Y - 620, 190, 620);
    ctx.fillRect(rx + 200, GROUND_Y - 520, 130, 520);
  }

  let p2 = Math.floor((distance * 2.5) % 1400);
  const buildingColors = ['#f43f5e', '#fb923c', '#fbbf24', '#818cf8', '#38bdf8'];

  for (let x = -1400; x < canvas.width + 1400; x += 250) {
    let rx = Math.floor(x - p2);
    let bIndex = Math.abs(Math.floor(x / 250)) % buildingColors.length;
    ctx.fillStyle = interpolateColor('#334155', buildingColors[bIndex], cleanProgress);
    ctx.fillRect(rx, GROUND_Y - 480, 180, 480);

    ctx.fillStyle = cleanProgress > 0.5 ? '#fef08a' : '#f59e0b';
    const windowRows = [440, 380, 320, 260, 200, 140, 80];
    windowRows.forEach((wY) => {
      ctx.fillRect(rx + 24, GROUND_Y - wY, 26, 26);
      ctx.fillRect(rx + 77, GROUND_Y - wY, 26, 26);
      ctx.fillRect(rx + 130, GROUND_Y - wY, 26, 26);
    });
  }

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
    ctx.font = 'bold 15px "BostonAngel", Segoe UI, sans-serif';
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
    ctx.font = '14px "BostonAngel", Segoe UI, sans-serif';
    ctx.fillText(msg.text, msg.x, msg.y);
    msg.y -= 1;
    msg.alpha -= 0.02;
    if (msg.alpha <= 0) floatingMessages.splice(i, 1);
  }
}

function drawPlatforms() {
  for (let p of platforms) {
    let px = Math.floor(p.x);
    let py = Math.floor(p.y);
    let pw = p.width;
    let ph = GAME_CONFIG.PLATFORM_HEIGHT;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(px + 6, py + ph, pw - 6, 8);

    let platGrad = ctx.createLinearGradient(px, py, px, py + ph);
    platGrad.addColorStop(0, '#475569');
    platGrad.addColorStop(0.5, '#334155');
    platGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = platGrad;
    ctx.fillRect(px, py, pw, ph);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + 2, py, pw - 4, 4);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + 5, py + 8, 4, 4);
    ctx.fillRect(px + pw - 9, py + 8, 4, 4);
  }
}

function drawItems() {
  for (let item of items) {
    let rx = Math.floor(item.x);
    let ry = Math.floor(item.y);
    let variant = item.variant || 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(rx, ry + 12, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();

    if (item.type === 'RECICLAVEL') {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      if (variant === 0) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(rx - 7, ry - 10, 14, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(rx - 7, ry - 3, 14, 8);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(rx - 4, ry - 14, 8, 4);
      } else if (variant === 1) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rx - 8, ry - 12, 16, 24);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(rx - 8, ry - 12, 16, 3);
        ctx.fillRect(rx - 8, ry + 9, 16, 3);
      } else {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(rx - 10, ry - 12, 20, 24);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx - 10, ry - 2, 20, 6);
      }

      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "BostonAngel", sans-serif';
      ctx.fillText("[C] PEGAR", rx - 24, ry - 18);

    } else if (item.type === 'ELETRONICO') {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;

      if (variant === 0) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx - 8, ry - 14, 16, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(rx - 6, ry - 11, 12, 20);
      } else if (variant === 1) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(rx - 12, ry - 10, 24, 20);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx - 10, ry - 10, 3, 20);
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx - 12, ry - 12, 24, 22);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(rx - 9, ry - 9, 18, 14);
      }

      ctx.restore();
      ctx.fillStyle = '#facc15';
      ctx.font = '11px "BostonAngel", sans-serif';
      ctx.fillText("[X] GUARDAR", rx - 32, ry - 18);

    } else if (item.type === 'SEMENTE') {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(rx, ry + 4, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(rx - 2, ry + 2, 3, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rx, ry + 2);
      ctx.quadraticCurveTo(rx - 3, ry - 6, rx, ry - 12);
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(rx - 7, ry - 13, 8, 4, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(rx + 6, ry - 14, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(rx + 4, ry - 16, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "BostonAngel", sans-serif';
      ctx.fillText("🌱 SEMENTE", rx - 28, ry - 24);

    } else if (item.type === 'CANTEIRO') {
      ctx.restore();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(rx - 25, ry, 50, 20);
      
      // Detalhes da terra
      ctx.fillStyle = '#78350f';
      ctx.fillRect(rx - 25, ry + 4, 50, 4);
      ctx.fillRect(rx - 25, ry + 12, 50, 4);
      
      ctx.fillStyle = '#facc15';
      ctx.font = '11px "BostonAngel", sans-serif';
      ctx.fillText("[Y] PLANTAR", rx - 30, ry - 8);
    }
  }
}

// DESENHO DOS OBSTÁCULOS (DRONE REDESENHADO BASEADO NA IMAGEM DE REFERÊNCIA)
function drawObstacles() {
  for (let obs of obstacles) {
    let ox = Math.floor(obs.x);
    let oy = Math.floor(obs.y);
    let w = obs.width;
    let h = obs.height;

    if (obs.isAerial) {
      let hoverY = oy + Math.sin(animTime * 0.15) * 6;

      ctx.save();
      
      // Sombra projetada na plataforma
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.beginPath();
      ctx.ellipse(ox + w / 2, hoverY + 50, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pernas (Invertidas e Cinza Escuro)
      ctx.fillStyle = '#334155';
      ctx.fillRect(ox + w/2 - 12, hoverY + 28, 6, 12);
      ctx.fillRect(ox + w/2 + 6, hoverY + 28, 6, 12);
      
      // Sensor inferior (Vermelho)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ox + w/2 - 6, hoverY + 26, 12, 6);
      
      // Braços dos Rotores (Cinza Escuro Horizontais)
      ctx.fillStyle = '#334155';
      ctx.fillRect(ox + 2, hoverY + 18, w - 4, 6); 
      
      // Suportes Verticais dos Rotores
      ctx.fillRect(ox + 4, hoverY + 12, 8, 16);
      ctx.fillRect(ox + w - 12, hoverY + 12, 8, 16);
      
      // Hélices / Rotores Superiores (Brancas/Claras Animadas)
      ctx.fillStyle = '#f8fafc'; 
      let propW = (Math.floor(animTime / 2) % 2 === 0) ? 18 : 6;
      
      // Hélice Esquerda
      ctx.fillRect(ox + 8 - propW/2, hoverY + 8, propW, 4);
      // Hélice Direita
      ctx.fillRect(ox + w - 8 - propW/2, hoverY + 8, propW, 4);
      
      // Corpo Central (Cúpula Branca/Azul Claro e base Cinza Escuro)
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(ox + w/2, hoverY + 18, 14, Math.PI, 0);
      ctx.fill();
      
      ctx.fillStyle = '#cbd5e1'; 
      ctx.fillRect(ox + w/2 - 14, hoverY + 18, 28, 8);
      
      // Contornos Simples Pixelados (Estilo da Imagem)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + w/2 - 14, hoverY + 18, 28, 8); // Base da cúpula
      
      ctx.restore();

    } else {
      // BARRIL TÓXICO NO CHÃO
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(ox + 4, oy + h, w - 4, 6);

      let barrelGrad = ctx.createLinearGradient(ox, oy, ox + w, oy);
      barrelGrad.addColorStop(0, '#15803d');
      barrelGrad.addColorStop(0.5, '#22c55e');
      barrelGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = barrelGrad;
      ctx.fillRect(ox, oy, w, h);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox, oy + 8, w, 4);
      ctx.fillRect(ox, oy + h - 12, w, 4);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☣', ox + w / 2, oy + h / 2 + 7);
      ctx.textAlign = 'left';

      if (Math.random() < 0.4) {
        createParticles(ox + w / 2, oy, 'rgba(34, 197, 94, 0.6)', 1, 0.5);
      }
    }
  }
}

function drawTrees() {
  for (let tree of trees) {
    let rx = Math.floor(tree.x);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.ellipse(rx, GROUND_Y + 2, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    let trunkGrad = ctx.createLinearGradient(rx - 16, 0, rx + 16, 0);
    trunkGrad.addColorStop(0, '#451a03');
    trunkGrad.addColorStop(0.5, '#78350f');
    trunkGrad.addColorStop(1, '#3a1303');
    ctx.fillStyle = trunkGrad;

    ctx.beginPath();
    ctx.moveTo(rx - 25, GROUND_Y);
    ctx.lineTo(rx - 12, GROUND_Y - 110);
    ctx.lineTo(rx + 12, GROUND_Y - 110);
    ctx.lineTo(rx + 25, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#571c05';
    ctx.beginPath();
    ctx.moveTo(rx, GROUND_Y - 70);
    ctx.lineTo(rx - 32, GROUND_Y - 100);
    ctx.lineTo(rx - 24, GROUND_Y - 108);
    ctx.lineTo(rx + 3, GROUND_Y - 76);
    ctx.fill();

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(rx - 30, GROUND_Y - 115, 36, 0, Math.PI * 2);
    ctx.arc(rx + 30, GROUND_Y - 115, 36, 0, Math.PI * 2);
    ctx.arc(rx, GROUND_Y - 155, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(rx - 25, GROUND_Y - 122, 33, 0, Math.PI * 2);
    ctx.arc(rx + 25, GROUND_Y - 122, 33, 0, Math.PI * 2);
    ctx.arc(rx, GROUND_Y - 160, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(rx - 18, GROUND_Y - 130, 28, 0, Math.PI * 2);
    ctx.arc(rx + 18, GROUND_Y - 130, 28, 0, Math.PI * 2);
    ctx.arc(rx, GROUND_Y - 166, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(rx - 12, GROUND_Y - 176, 11, 0, Math.PI * 2);
    ctx.arc(rx + 14, GROUND_Y - 138, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEcopontoBuilding() {
  if (ecopontoBuilding) {
    let rx = Math.floor(ecopontoBuilding.x);
    let bW = ecopontoBuilding.width;
    let bH = ecopontoBuilding.height;
    let bY = GROUND_Y - bH;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(rx, GROUND_Y, bW, 14);

    ctx.fillStyle = '#334155';
    ctx.fillRect(rx, GROUND_Y - 12, bW, 12);

    let bGrad = ctx.createLinearGradient(rx, bY, rx + bW, bY);
    bGrad.addColorStop(0, '#047857');
    bGrad.addColorStop(0.3, '#10b981');
    bGrad.addColorStop(0.7, '#059669');
    bGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = bGrad;
    ctx.fillRect(rx, bY, bW, bH - 12);

    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 3;
    ctx.strokeRect(rx, bY, bW, bH - 12);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(rx, bY);
    ctx.lineTo(rx + bW / 2, bY - 40);
    ctx.lineTo(rx + bW, bY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(rx + 8, bY - 2);
    ctx.lineTo(rx + bW / 2, bY - 34);
    ctx.lineTo(rx + bW - 8, bY - 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#022c22';
    ctx.fillRect(rx + 30, bY + 110, bW - 60, 80);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(rx + 36, bY + 116, bW - 72, 68);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx + 36, bY + 116, bW - 72, 68);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(rx + bW / 2, bY + 150, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx + 16, bY + 35, bW - 32, 52);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(rx + 16, bY + 35, bW - 32, 52);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px "BostonAngel", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("♻ ECOPONTO", rx + bW / 2, bY + 68);

    ctx.fillStyle = (Math.floor(animTime / 20) % 2 === 0) ? '#4ade80' : '#16a34a';
    ctx.beginPath();
    ctx.arc(rx + 30, bY + 48, 4, 0, Math.PI * 2);
    ctx.arc(rx + bW - 30, bY + 48, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
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