class Player {
  constructor() {
    this.width = GAME_CONFIG ? GAME_CONFIG.PLAYER_WIDTH : 56;
    this.height = GAME_CONFIG ? GAME_CONFIG.PLAYER_HEIGHT : 72;
    this.x = 120;
    this.y = GROUND_Y - this.height;
    this.velocityY = 0;
    this.gravity = 0.65;
    this.jumpStrength = -13.2;
    this.isGrounded = false;
    this.wasGrounded = true;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.invulnerableTimer = 0;

    // Escala física de pulo/pouso (Squash & Stretch)
    this.scaleX = 1;
    this.scaleY = 1;
  }

  reset() {
    this.x = 120;
    this.y = GROUND_Y - this.height;
    this.velocityY = 0;
    this.isGrounded = true;
    this.wasGrounded = true;
    this.jumpCount = 0;
    this.invulnerableTimer = 0;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.velocityY = this.jumpStrength;
      this.jumpCount++;
      this.isGrounded = false;

      // Estica ao pular
      this.scaleX = 0.82;
      this.scaleY = 1.22;

      if (typeof createParticles === 'function') {
        createParticles(this.x + this.width / 2, this.y + this.height, '#4ade80', 10, 1.1);
      }
    }
  }

  update() {
    this.wasGrounded = this.isGrounded;
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // Suaviza a escala de volta ao normal
    this.scaleX += (1 - this.scaleX) * 0.15;
    this.scaleY += (1 - this.scaleY) * 0.15;

    this.isGrounded = false;
    let targetGroundY = null;

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
                if (typeof screenShake !== 'undefined') screenShake = 18;
                if (typeof createParticles === 'function') {
                  createParticles(this.x + this.width / 2, this.y + this.height, '#0284c7', 20, 1.5);
                }
                this.velocityY = -13; 
                this.invulnerableTimer = 40;
                showMessage("Caiu no Mar Tóxico! -1 Vida ☣️");
                if (lives <= 0) triggerGameOver();
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

      // Achata levemente ao pousar
      if (!this.wasGrounded) {
        this.scaleX = 1.25;
        this.scaleY = 0.75;
        if (typeof createParticles === 'function') {
          createParticles(this.x + this.width / 2, this.y + this.height, '#cbd5e1', 12, 0.9);
        }
      }
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }
  }

  draw() {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

    // SOMBRA DINÂMICA
    let shadowY = GROUND_Y;
    if (typeof platforms !== 'undefined') {
      for (let p of platforms) {
        if (this.x + this.width > p.x && this.x < p.x + p.width && this.y + this.height <= p.y + 12) {
          shadowY = p.y;
          break;
        }
      }
    }

    let airHeight = Math.max(0, shadowY - (this.y + this.height));
    let shadowScale = Math.max(0.2, 1 - (airHeight / 220));
    let shadowWidth = (this.width * 0.75) * shadowScale;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, shadowY, shadowWidth / 2, 5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // DESENHO DO MONSTRINHO VERDE ICÔNICO
    ctx.save();
    let bounce = (this.isGrounded && typeof gameState !== 'undefined' && gameState === 'PLAYING') ? Math.sin(animTime * 0.25) * 4 : 0;
    let tilt = this.isGrounded ? 0 : this.velocityY * 0.03;
    let px = Math.floor(this.x);
    let py = Math.floor(this.y + bounce);

    // Transformação com física e inclinação
    ctx.translate(px + this.width / 2, py + this.height);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.rotate(tilt);
    ctx.translate(-(px + this.width / 2), -(py + this.height));

    // Corpo Verde
    let bodyGrad = ctx.createLinearGradient(px, py, px, py + this.height);
    bodyGrad.addColorStop(0, '#4ade80');
    bodyGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(px, py, this.width, this.height, [22, 22, 12, 12]);
    } else {
      ctx.fillRect(px, py, this.width, this.height);
    }
    ctx.fill();

    // Barriga Clara
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(px + 28, py + 42, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olho Grande
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px + 36, py + 20, 16, 0, Math.PI * 2);
    ctx.fill();

    let isBlinking = typeof animTime !== 'undefined' && Math.sin(animTime * 0.05) > 0.95;
    if (!isBlinking) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px + 39, py + 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(px + 40, py + 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px + 36, py + 17, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + 36, py + 20, 10, 0, Math.PI);
      ctx.stroke();
    }

    // Boca com Dentes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px + 32, py + 40, 14, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 23, py + 40, 5, 7);
    ctx.fillRect(px + 36, py + 40, 5, 7);

    // Antena Amarela
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 4);
    ctx.lineTo(px - 2, py - 14);
    ctx.lineTo(px + 18, py);
    ctx.fill();

    ctx.restore();
  }
}

const player = new Player();