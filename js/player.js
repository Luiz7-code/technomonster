class Player {
  constructor() {
    this.width = GAME_CONFIG ? GAME_CONFIG.PLAYER_WIDTH : 48;
    this.height = GAME_CONFIG ? GAME_CONFIG.PLAYER_HEIGHT : 60;
    this.x = 120;
    this.y = GROUND_Y - this.height;
    this.velocityY = 0;
    this.gravity = 0.65;
    this.jumpStrength = -13.2;
    this.isGrounded = false;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.invulnerableTimer = 0;
  }

  reset() {
    this.x = 120;
    this.y = GROUND_Y - this.height;
    this.velocityY = 0;
    this.isGrounded = true;
    this.jumpCount = 0;
    this.invulnerableTimer = 0;
  }

  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.velocityY = this.jumpStrength;
      this.jumpCount++;
      this.isGrounded = false;
    }
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    this.isGrounded = false;
    let targetGroundY = null;

    // 1. Colisão com Plataformas
    if (typeof platforms !== 'undefined') {
      for (let platform of platforms) {
        if (
          this.x + this.width > platform.x &&
          this.x < platform.x + platform.width &&
          this.y + this.height >= platform.y &&
          this.y + this.height <= platform.y + 18 &&
          this.velocityY >= 0
        ) {
          targetGroundY = platform.y - this.height;
          this.isGrounded = true;
          break;
        }
      }
    }

    // 2. Colisão com Terreno (Asfalto vs Mar Tóxico)
    if (!this.isGrounded && typeof groundSegments !== 'undefined') {
      let playerCenterX = this.x + this.width / 2;

      for (let seg of groundSegments) {
        if (playerCenterX >= seg.x && playerCenterX <= seg.x + seg.width) {
          if (seg.type === 'ASPHALT') {
            if (this.y + this.height >= GROUND_Y) {
              targetGroundY = GROUND_Y - this.height;
              this.isGrounded = true;
            }
          } else if (seg.type === 'SEA') {
            if (this.y + this.height >= GROUND_Y) {
              if (this.invulnerableTimer === 0) {
                lives--;
                flashRed = 20;
                this.velocityY = -13; // Impulso para tentar sair da água
                this.invulnerableTimer = 40;
                showMessage("Caiu no Mar Tóxico! -1 Vida ☣️");
                if (lives <= 0) {
                  triggerGameOver();
                }
              }
            }
          }
          break;
        }
      }
    }

    if (this.isGrounded && targetGroundY !== null) {
      this.y = targetGroundY;
      this.velocityY = 0;
      this.jumpCount = 0;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }
  }

  draw() {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

    ctx.save();
    let bounce = (this.isGrounded && gameState === 'PLAYING') ? Math.sin(animTime * 0.25) * 4 : 0;
    let tilt = this.isGrounded ? 0 : this.velocityY * 0.03;
    let px = Math.floor(this.x);
    let py = Math.floor(this.y + bounce);

    ctx.translate(px + 26, py + 28);
    ctx.rotate(tilt);
    ctx.translate(-(px + 26), -(py + 28));

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 26, Math.min(GROUND_Y - 2, py + 55), 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo Verde Monster
    let bodyGrad = ctx.createLinearGradient(px, py, px, py + this.height);
    bodyGrad.addColorStop(0, '#4ade80');
    bodyGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(px, py, this.width, this.height, [22, 22, 12, 12]);
    ctx.fill();

    // Barriga
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(px + 26, py + 38, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olho
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px + 34, py + 18, 15, 0, Math.PI * 2);
    ctx.fill();

    let isBlinking = Math.sin(animTime * 0.05) > 0.95;
    if (!isBlinking) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px + 37, py + 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(px + 38, py + 18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px + 34, py + 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + 34, py + 18, 10, 0, Math.PI);
      ctx.stroke();
    }

    // Boca e Dentes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px + 30, py + 36, 13, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 22, py + 36, 5, 6);
    ctx.fillRect(px + 33, py + 36, 5, 6);

    // Chifre
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 4);
    ctx.lineTo(px - 2, py - 14);
    ctx.lineTo(px + 16, py);
    ctx.fill();

    ctx.restore();
  }
}

const player = new Player();