const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");
const startButton = document.getElementById("startButton");

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = canvas.width / COLS;



const COLORS = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];

const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 0], [0, 1, 1]]
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 1000;
let lastTime = 0;
let gameRunning = false;

function drawBoard() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                ctx.fillStyle = COLORS[board[r][c] - 1];
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function createPiece() {
    const index = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[index],
        color: COLORS[index],
        row: 0,
        col: Math.floor(COLS / 2) - 1
    };
}

function drawPiece(piece) {
    ctx.fillStyle = piece.color;
    piece.shape.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                ctx.fillRect((piece.col + cIdx) * CELL_SIZE, (piece.row + rIdx) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect((piece.col + cIdx) * CELL_SIZE, (piece.row + rIdx) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        });
    });
}

function collide(piece) {
    return piece.shape.some((row, rIdx) => {
        return row.some((cell, cIdx) => {
            let newRow = piece.row + rIdx;
            let newCol = piece.col + cIdx;
            return cell && (newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol]);
        });
    });
}
