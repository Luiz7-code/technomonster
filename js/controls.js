function handleVirtualKeyPress(char) {
  if (char === '⌫') {
    playerName = playerName.slice(0, -1);
  } else if (char === 'OK') {
    if (playerName.trim().length === 0) playerName = 'JOGADOR';
    resetGame();
    gameState = 'START';
    if (typeof playBackgroundMusic === 'function') playBackgroundMusic();
  } else {
    if (playerName.length < 10) {
      playerName += char;
    }
  }
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  // 1. MENU PRINCIPAL
  if (gameState === 'MENU') {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') menuOption = 0;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') menuOption = 1;
    if (e.code === 'Enter' || e.code === 'Space') {
      if (menuOption === 0) gameState = 'NICKNAME';
      else gameState = 'CONTROLS';
    }
    return;
  }

  // 2. CONTROLES
  if (gameState === 'CONTROLS') {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
      gameState = 'MENU';
    }
    return;
  }

  // 3. SELEÇÃO DE NICKNAME / JOYSTICK FLIPERAMA
  if (gameState === 'NICKNAME') {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      e.preventDefault();
      kbCol = (kbCol - 1 + vkGrid[kbRow].length) % vkGrid[kbRow].length;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      kbCol = (kbCol + 1) % vkGrid[kbRow].length;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      kbRow = (kbRow - 1 + vkGrid.length) % vkGrid.length;
      kbCol = Math.min(kbCol, vkGrid[kbRow].length - 1);
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      kbRow = (kbRow + 1) % vkGrid.length;
      kbCol = Math.min(kbCol, vkGrid[kbRow].length - 1);
    } else if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      handleVirtualKeyPress(vkGrid[kbRow][kbCol]);
    } else if (e.code === 'Backspace') {
      e.preventDefault();
      playerName = playerName.slice(0, -1);
    } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key) && playerName.length < 10) {
      e.preventDefault();
      playerName += e.key.toUpperCase();
    }
    return;
  }

  // 4. TELA INICIAL (START)
  if (gameState === 'START') {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter' || e.code === 'KeyW') {
      gameState = 'PLAYING';
    }
    return;
  }

  // 5. TECLA DE PAUSA (ENTRAR / SAIR DE PAUSE)
  if (gameState === 'PLAYING') {
    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      pauseOption = 0;
      gameState = 'PAUSED';
      return;
    }
  } else if (gameState === 'PAUSED') {
    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      gameState = 'PLAYING';
      return;
    }

    // Navegação no Menu de Pause
    if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      pauseOption = 0;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'ArrowDown' || e.code === 'KeyS') {
      pauseOption = 1;
    }

    if (e.code === 'Enter' || e.code === 'Space') {
      if (pauseOption === 0) {
        gameState = 'PLAYING';
      } else {
        gameState = 'MENU';
      }
    }
    return;
  }

  // 6. DURANTE O JOGO (PLAYING)
  if (gameState === 'PLAYING') {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      player.jump();
    }

    // TECLA [C]: Coletar lixo reciclável OU comer e-lixo (perde 1 vida)
    if (e.code === 'KeyC') {
      for (let i = items.length - 1; i >= 0; i--) {
        if (isPlayerNearItem(items[i])) {
          if (items[i].type === 'RECICLAVEL') {
            scoreBase += 20;
            totalCleanActions += 2;
            showMessage("+20 Pts: Reciclado! ♻️");
            items.splice(i, 1);
            break;
          } else if (items[i].type === 'ELETRONICO') {
            lives--;
            flashRed = 20;
            if (typeof player !== 'undefined') {
              player.invulnerableTimer = 35;
            }
            showMessage("Comeu E-Lixo Tóxico! -1 Vida ☣️");
            items.splice(i, 1);

            if (lives <= 0) {
              triggerGameOver();
            }
            break;
          }
        }
      }
    }

    // TECLA [X]: Guardar E-Lixo na mochila
    if (e.code === 'KeyX') {
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].type === 'ELETRONICO' && isPlayerNearItem(items[i])) {
          eWasteInBag++;
          totalCleanActions++;
          showMessage("+1 E-Lixo Guardado! 🔋");
          items.splice(i, 1);
          break;
        }
      }
    }

    // TECLA [Y]: Plantar sementes
    if (e.code === 'KeyY') {
      if (seedsInBag > 0) {
        for (let i = items.length - 1; i >= 0; i--) {
          if (items[i].type === 'CANTEIRO' && isPlayerNearItem(items[i])) {
            seedsInBag--;
            scoreBase += 50;
            totalCleanActions += 5;
            trees.push({ x: items[i].x });
            showMessage("Árvore Plantada! 🌳 +50 Pts");
            items.splice(i, 1);
            break;
          }
        }
      } else {
        showMessage("Sem Sementes! ❌");
      }
    }
  }

  // 7. ECOPONTO PAUSE
  if (gameState === 'ECOPONTO_PAUSE') {
    if (e.code === 'Space' || e.code === 'Enter') {
      continueFromEcoponto();
    }
  }

  // 8. GAME OVER
  if (gameState === 'GAMEOVER') {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameOverOption = 0;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') gameOverOption = 1;

    if (e.code === 'Enter' || e.code === 'Space') {
      if (gameOverOption === 0) {
        resetGame();
        gameState = 'PLAYING';
        if (typeof playBackgroundMusic === 'function') playBackgroundMusic();
      } else {
        gameState = 'MENU';
      }
    }
  }

  // REINICIAR (RELOAD)
  if (e.code === 'KeyR' && (gameState === 'GAMEOVER' || gameState === 'PLAYING')) {
    resetGame();
    gameState = 'PLAYING';
  }
});

// INTERAÇÃO VIA CLIQUE DE MOUSE / TOQUE
window.addEventListener('load', () => {
  const gameCanvas = document.getElementById('gameCanvas');
  if (!gameCanvas) return;

  gameCanvas.addEventListener('click', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Teclado Virtual Nickname
    if (gameState === 'NICKNAME') {
      const keyWidth = 48;
      const keyHeight = 48;
      const keyGap = 10;
      const startY = gameCanvas.height / 2 - 50;

      vkGrid.forEach((row, rIdx) => {
        const rowWidth = row.length * keyWidth + (row.length - 1) * keyGap;
        const startX = gameCanvas.width / 2 - rowWidth / 2;

        row.forEach((char, cIdx) => {
          const kx = startX + cIdx * (keyWidth + keyGap);
          const ky = startY + rIdx * (keyHeight + keyGap);

          if (clickX >= kx && clickX <= kx + keyWidth && clickY >= ky && clickY <= ky + keyHeight) {
            kbRow = rIdx;
            kbCol = cIdx;
            handleVirtualKeyPress(char);
          }
        });
      });
      return;
    }

    // Clique no Overlay de Pausa
    if (gameState === 'PAUSED') {
      const btnW = 210;
      const btnH = 48;
      const btnY = gameCanvas.height / 2 + 10;

      // Botão Continuar
      const btn1X = gameCanvas.width / 2 - 220;
      if (clickX >= btn1X && clickX <= btn1X + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        gameState = 'PLAYING';
        return;
      }

      // Botão Sair
      const btn2X = gameCanvas.width / 2 + 10;
      if (clickX >= btn2X && clickX <= btn2X + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        gameState = 'MENU';
        return;
      }
    }

    // Botão de Pausa no Canto Superior
    if (clickX >= gameCanvas.width - 110 && clickX <= gameCanvas.width - 30 && clickY >= 12 && clickY <= 44) {
      if (gameState === 'PLAYING') {
        pauseOption = 0;
        gameState = 'PAUSED';
      } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
      }
    }
  });
});