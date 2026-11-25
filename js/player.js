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
    paintPlayer(this);
  }
}

const player = new Player();
