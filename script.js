// Obtém o elemento canvas e seu contexto 2D para desenhar
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Obtém os elementos HTML para exibir pontuação, nível e linhas
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");

// Obtém o botão de iniciar jogo
const startButton = document.getElementById("startButton");

// Define o número de colunas e linhas do tabuleiro
const COLS = 10;
const ROWS = 20;

// Calcula o tamanho de cada célula com base na largura do canvas
const CELL_SIZE = canvas.width / COLS;

// Cores das peças
const COLORS = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];

// Formatos das peças (shapes)
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 0, 1]], // L
    [[1, 1, 1], [1, 0, 0]], // J
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 0], [0, 1, 1]] // Z
];

// Inicializa o tabuleiro como uma matriz de zeros
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Variáveis para controlar a peça atual, pontuação, nível, linhas e estado do jogo
let currentPiece;
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 1000; // Intervalo de queda da peça (em milissegundos)
let lastTime = 0; // Último tempo registrado para controle de queda
let gameRunning = false; // Estado do jogo (rodando ou não)

// Função para desenhar o tabuleiro
function drawBoard() {
    // Preenche o fundo do canvas com preto
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Percorre o tabuleiro e desenha as células preenchidas
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                ctx.fillStyle = COLORS[board[r][c] - 1]; // Define a cor da célula
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE); // Desenha a célula
                ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE); // Desenha a borda da célula
            }
        }
    }
}

// Função para criar uma nova peça aleatória
function createPiece() {
    const index = Math.floor(Math.random() * SHAPES.length); // Escolhe um formato aleatório
    return {
        shape: SHAPES[index], // Formato da peça
        color: COLORS[index], // Cor da peça
        row: 0, // Posição inicial na linha (topo do tabuleiro)
        col: Math.floor(COLS / 2) - 1 // Posição inicial na coluna (centro do tabuleiro)
    };
}

// Função para desenhar a peça atual no canvas
function drawPiece(piece) {
    ctx.fillStyle = piece.color; // Define a cor da peça
    piece.shape.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                // Desenha cada célula da peça
                ctx.fillRect((piece.col + cIdx) * CELL_SIZE, (piece.row + rIdx) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect((piece.col + cIdx) * CELL_SIZE, (piece.col + cIdx) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        });
    });
}

// Função para verificar colisões da peça com o tabuleiro ou bordas
function collide(piece) {
    return piece.shape.some((row, rIdx) => {
        return row.some((cell, cIdx) => {
            let newRow = piece.row + rIdx; // Nova linha da célula
            let newCol = piece.col + cIdx; // Nova coluna da célula
            // Verifica se a célula está fora do tabuleiro ou colidindo com outra célula
            return cell && (newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol]);
        });
    });
}

// Função para mesclar a peça atual ao tabuleiro
function mergePiece() {
    currentPiece.shape.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                // Adiciona a célula da peça ao tabuleiro
                board[currentPiece.row + rIdx][currentPiece.col + cIdx] = COLORS.indexOf(currentPiece.color) + 1;
            }
        });
    });
    clearLines(); // Verifica e limpa linhas completas
}

// Função para limpar linhas completas e atualizar pontuação
function clearLines() {
    let cleared = 0;
    // Filtra as linhas que não estão completamente preenchidas
    board = board.filter(row => row.some(cell => !cell));
    // Adiciona novas linhas vazias no topo do tabuleiro
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
        cleared++;
    }
    // Atualiza pontuação, linhas e nível
    score += cleared * 10;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - level * 100); // Aumenta a velocidade conforme o nível

    // Atualiza os elementos HTML com os novos valores
    scoreElement.textContent = score;
    linesElement.textContent = lines;
    levelElement.textContent = level;
}

// Função para mover a peça horizontalmente
function movePiece(dir) {
    currentPiece.col += dir; // Move a peça para a esquerda ou direita
    if (collide(currentPiece)) currentPiece.col -= dir; // Desfaz o movimento se houver colisão
}

// Função para fazer a peça cair
function dropPiece() {
    currentPiece.row++; // Move a peça para baixo
    if (collide(currentPiece)) {
        currentPiece.row--; // Desfaz o movimento se houver colisão
        mergePiece(); // Mescla a peça ao tabuleiro
        currentPiece = createPiece(); // Cria uma nova peça
        if (collide(currentPiece)) {
            gameRunning = false; // Fim de jogo se a nova peça colidir imediatamente
            alert("Game Over");
        }
    }
}

// Função para rotacionar a peça
function rotatePiece() {
    let prevShape = currentPiece.shape; // Salva o formato atual da peça
    // Rotaciona a peça
    currentPiece.shape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
    if (collide(currentPiece)) currentPiece.shape = prevShape; // Desfaz a rotação se houver colisão
}

// Função principal de atualização do jogo
function update(time = 0) {
    if (!gameRunning) return; // Sai da função se o jogo não estiver rodando
    if (time - lastTime > dropInterval) {
        dropPiece(); // Faz a peça cair no intervalo definido
        lastTime = time; // Atualiza o último tempo registrado
    }
    drawBoard(); // Redesenha o tabuleiro
    drawPiece(currentPiece); // Desenha a peça atual
    requestAnimationFrame(update); // Chama a próxima atualização
}

// Adiciona listeners para as teclas de controle
document.addEventListener("keydown", (event) => {
    if (!gameRunning) return; // Ignora se o jogo não estiver rodando
    if (event.key === "ArrowLeft") movePiece(-1); // Move para a esquerda
    if (event.key === "ArrowRight") movePiece(1); // Move para a direita
    if (event.key === "ArrowDown") dropPiece(); // Acelera a queda
    if (event.key === "ArrowUp") rotatePiece(); // Rotaciona a peça
});

// Adiciona listener para o botão de iniciar jogo
startButton.addEventListener("click", () => {
    // Reinicia o tabuleiro e as variáveis do jogo
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    gameRunning = true; // Inicia o jogo
    currentPiece = createPiece(); // Cria a primeira peça
    update(); // Inicia o loop de atualização
});