(function () {
  const SIZE = 4;
  const gridBg = document.getElementById("grid-bg");
  const tileContainer = document.getElementById("tile-container");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");
  const overlayBtn = document.getElementById("overlay-btn");
  const newGameBtn = document.getElementById("new-game-btn");

  let board = [];
  let score = 0;
  let best = Number(localStorage.getItem("2048-best") || 0);
  let gameOver = false;
  let won = false;
  let tileIdCounter = 0;

  bestEl.textContent = best;

  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    gridBg.appendChild(cell);
  }

  function emptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function cellsAvailable() {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!board[r][c]) cells.push({ r, c });
      }
    }
    return cells;
  }

  function addRandomTile() {
    const available = cellsAvailable();
    if (available.length === 0) return;
    const { r, c } = available[Math.floor(Math.random() * available.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    board[r][c] = { id: tileIdCounter++, value, r, c, isNew: true, merged: false };
  }

  function startGame() {
    board = emptyBoard();
    score = 0;
    gameOver = false;
    won = false;
    scoreEl.textContent = "0";
    overlay.classList.add("hidden");
    addRandomTile();
    addRandomTile();
    render();
  }

  function render() {
    tileContainer.innerHTML = "";
    const cellSize = tileContainer.clientWidth / SIZE;
    const gap = 8;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const tile = board[r][c];
        if (!tile) continue;
        const el = document.createElement("div");
        const displayValue = tile.value > 2048 ? tile.value : tile.value;
        const cls = tile.value <= 2048 ? `tile-${tile.value}` : "tile-super";
        el.className = `tile ${cls}`;
        el.textContent = displayValue;
        const step = (cellSize + gap * 0.75);
        el.style.width = `calc(25% - 6px)`;
        el.style.height = `calc(25% - 6px)`;
        el.style.left = `calc(${tile.c} * (100% / 4) + ${tile.c} * 2px)`;
        el.style.top = `calc(${tile.r} * (100% / 4) + ${tile.r} * 2px)`;
        if (tile.isNew) {
          tile.isNew = false;
        }
        tileContainer.appendChild(el);
      }
    }
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("2048-best", String(best));
    }
    bestEl.textContent = best;
  }

  function cloneBoardValues() {
    return board.map((row) => row.map((t) => (t ? t.value : null)));
  }

  function boardsEqual(a, b) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  function move(direction) {
    if (gameOver) return;
    const before = cloneBoardValues();

    // Reset merged flags
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c]) board[r][c].merged = false;
      }
    }

    const vectors = {
      up: { dr: -1, dc: 0 },
      down: { dr: 1, dc: 0 },
      left: { dr: 0, dc: -1 },
      right: { dr: 0, dc: 1 },
    };
    const { dr, dc } = vectors[direction];

    const traversalR = [...Array(SIZE).keys()];
    const traversalC = [...Array(SIZE).keys()];
    if (dr === 1) traversalR.reverse();
    if (dc === 1) traversalC.reverse();

    let moved = false;

    for (const r of traversalR) {
      for (const c of traversalC) {
        const tile = board[r][c];
        if (!tile) continue;

        let newR = r;
        let newC = c;

        while (true) {
          const nextR = newR + dr;
          const nextC = newC + dc;
          if (nextR < 0 || nextR >= SIZE || nextC < 0 || nextC >= SIZE) break;

          const target = board[nextR][nextC];
          if (!target) {
            newR = nextR;
            newC = nextC;
            continue;
          }
          if (target.value === tile.value && !target.merged && !tile.merged) {
            newR = nextR;
            newC = nextC;
          }
          break;
        }

        if (newR !== r || newC !== c) {
          const target = board[newR][newC];
          board[r][c] = null;
          if (target && target.value === tile.value && !target.merged) {
            target.value *= 2;
            target.merged = true;
            score += target.value;
            if (target.value === 2048 && !won) {
              won = true;
            }
          } else {
            tile.r = newR;
            tile.c = newC;
            board[newR][newC] = tile;
          }
          moved = true;
        }
      }
    }

    if (moved) {
      addRandomTile();
      render();

      const after = cloneBoardValues();
      if (won) {
        showOverlay("Você venceu! 🎉", "Continuar");
      } else if (!hasMoves()) {
        gameOver = true;
        showOverlay("Fim de jogo!", "Tentar de novo");
      }
    }
  }

  function hasMoves() {
    if (cellsAvailable().length > 0) return true;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = board[r][c].value;
        if (c < SIZE - 1 && board[r][c + 1].value === val) return true;
        if (r < SIZE - 1 && board[r + 1][c].value === val) return true;
      }
    }
    return false;
  }

  function showOverlay(message, btnText) {
    overlayMessage.textContent = message;
    overlayBtn.textContent = btnText;
    overlay.classList.remove("hidden");
  }

  overlayBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    if (gameOver) startGame();
  });

  newGameBtn.addEventListener("click", startGame);

  document.addEventListener("keydown", (e) => {
    const map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      move(dir);
    }
  });

  // Touch support
  let touchStartX = 0;
  let touchStartY = 0;
  const boardWrap = document.querySelector(".board-wrap");

  boardWrap.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  boardWrap.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 20;
    if (Math.max(absX, absY) < threshold) return;
    if (absX > absY) {
      move(dx > 0 ? "right" : "left");
    } else {
      move(dy > 0 ? "down" : "up");
    }
  }, { passive: true });

  window.addEventListener("resize", render);

  startGame();
})();
