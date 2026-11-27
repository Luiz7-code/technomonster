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

let gameState = 'INTRO';
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
  paintParticles();
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
  visualClean = 0;
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
  for (const msg of floatingMessages) { msg.y -= 1; msg.alpha -= 0.02; }
  floatingMessages = floatingMessages.filter(msg => msg.alpha > 0);

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
  paintCity();
}

function drawFloatingMessages() {
  for (let i = floatingMessages.length - 1; i >= 0; i--) {
    let msg = floatingMessages[i];
    ctx.fillStyle = `rgba(245, 231, 190, ${msg.alpha})`;
    ctx.font = '14px "Trebuchet MS", Segoe UI, sans-serif';
    ctx.fillText(msg.text, msg.x, msg.y);
  }
}

function drawPlatforms() {
  paintPlatforms();
}

function drawItems() {
  paintItems();
}

// Rendering delegates share the palette and drawing helpers in art.js.
function drawObstacles() {
  paintObstacles();
}

function drawTrees() {
  paintTrees();
}

function drawEcopontoBuilding() {
  paintEcoponto();
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
