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
  if (gameState === 'INTRO') {
    e.preventDefault();
    if (e.code === 'KeyM') toggleIntroSound(); else finishIntro();
    return;
  }
  if (titleKey(e)) return;

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
            createParticles(items[i].x, items[i].y, ART.mint, 18, 1.1);
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
          createParticles(items[i].x, items[i].y, ART.copper, 16, 1.0);
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
            createParticles(items[i].x, items[i].y, ART.mint, 24, 1.4);
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

  // 7. ECOPONTO PAUSE (TRANSIÇÃO DE FASE)
  if (gameState === 'ECOPONTO_PAUSE') {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      ecopontoOption = 0;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'ArrowDown' || e.code === 'KeyS') {
      ecopontoOption = 1;
    }

    if (e.code === 'Enter' || e.code === 'Space') {
      if (ecopontoOption === 0) {
        continueFromEcoponto();
      } else {
        triggerGameOver();
      }
    }
    return;
  }

  // 8. GAME OVER
  if (gameState === 'GAMEOVER') {
    if (['ArrowLeft','KeyA','ArrowUp','KeyW'].includes(e.code)) gameOverOption = 0;
    if (['ArrowRight','KeyD','ArrowDown','KeyS'].includes(e.code)) gameOverOption = 1;

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
    if (gameState === 'INTRO') { if (!introSoundClick(e)) finishIntro(); return; }
    if (titlePointer(e, true)) return;
    const rect = gameCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Rendering and pointer input share the same responsive rectangles.
    if (gameState === 'NICKNAME') {
      const key=uiNicknameKeys().flat().find(b=>clickX>=b.x&&clickX<=b.x+b.w&&clickY>=b.y&&clickY<=b.y+b.h);
      if(key){kbRow=key.r;kbCol=key.c;handleVirtualKeyPress(key.char);}return;
    }
    if (['PAUSED','ECOPONTO_PAUSE','GAMEOVER'].includes(gameState)) {
      const choice=uiActionButtons(gameState).findIndex(b=>clickX>=b.x&&clickX<=b.x+b.w&&clickY>=b.y&&clickY<=b.y+b.h);
      if(choice>=0){
        if(gameState==='PAUSED')gameState=choice===0?'PLAYING':'MENU';
        else if(gameState==='ECOPONTO_PAUSE'){if(choice===0)continueFromEcoponto();else triggerGameOver();}
        else if(choice===0){resetGame();gameState='PLAYING';playBackgroundMusic();}else gameState='MENU';
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
