let start = false;

const startButton = document.getElementById('start');
const menu = document.getElementById('menu');
const restartButton = document.getElementById('restart');
const message = document.getElementById('message');

const main = document.getElementById('main');
const game = document.getElementById('game');

const ROWS = 22, COLUMNS = 10;
const board = Array.from(Array(ROWS), () => new Array(COLUMNS));

const PIECES = {
    straight : {
        color : 'cyan',
        startingCoords : [[0, 3], [0, 4], [0, 5], [0, 6]]
    },
    left_L : {
        color : 'blue',
        startingCoords : [[0, 3], [1, 3], [1, 4], [1, 5]]
    },
    right_L : {
        color : 'orange',
        startingCoords : [[1, 3], [1, 4], [1, 5], [0, 5]]
    },
    left_Z : {
        color : 'red',
        startingCoords : [[0, 3], [0, 4], [1, 4], [1, 5]]
    },
    right_Z : {
        color : 'green',
        startingCoords : [[1, 3], [1, 4], [0, 4], [0, 5]]
    },
    T : {
        color : 'pink',
        startingCoords : [[1, 3], [1, 4], [1, 5], [0, 4]]
    },
    square : {
        color : 'yellow',
        startingCoords : [[0, 4], [0, 5], [1, 4], [1, 5]]
    }
}

let currPiece, nextPiece = getNextBlock();
let runGame;

// setInterval(descendPiece, 1000);
startButton.addEventListener('click', () => {
    start = true;
    menu.classList.add('started');
    main.classList.add('tetris');
    setDisplay();
    if (!currPiece) {
        currPiece = structuredClone(PIECES[nextPiece]);
        nextPiece = getNextBlock();
    }
    runGame = setInterval(descendPiece, 1000);
})

document.body.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        while (canDescend()) {
            for (let i = 0; i < 4; i++) {
                currPiece.startingCoords[i][0]++;
            }
        }
        for (let [x, y] of currPiece.startingCoords) {
            board[x][y] = currPiece.color;
        }
        currPiece = structuredClone(PIECES[nextPiece]);
        nextPiece = getNextBlock();
        eliminateRows();
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        if (canRight()) {
            for (let i = 0; i < 4; i++) {
                currPiece.startingCoords[i][1]++;
            }
        }
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        if (canLeft()) {
            for (let i = 0; i < 4; i++) {
                currPiece.startingCoords[i][1]--;
            }
        }
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        if (canDescend()) {
            for (let i = 0; i < 4; i++) {
                currPiece.startingCoords[i][0]++;
            }
        }
    } else if (event.key === 'ArrowUp' || event.key === 'w') {
        for (let i = 0; i < 4; i++) {
            currPiece.startingCoords[i][1]--;
        }
    } else if (event.key === 'Escape') {
        start = false;
        clearInterval(runGame);
        menu.classList.remove('started');
        main.classList.remove('tetris');
        restartButton.classList.add('paused');
        message.innerHTML = 'Game Paused';
    }
    setDisplay();
})

function isFull(row) {
    for (let block of row) {
        if (!block) {
            return false;
        }
    }
    return true;
}

function setDisplay() {
    let curr = '';
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLUMNS; j++) {
            if (board[i][j]) {
                curr += `<div class="${board[i][j]}"></div>`
            } else if (currPiece && includes(i, j)) {
                curr += `<div class="${currPiece.color}"></div>`
            } else if (i === 0 || i === 1) {
                curr += '<div class="blank"></div>'
            } else {
                curr += '<div></div>'
            }
        }
    }
    game.innerHTML = curr;
}

function eliminateRows() {
    let i = ROWS - 1;
    for (let count = 0; count < ROWS; count++) {
        if (isFull(board[i])) {
            board.splice(i, 1);
            board.unshift(new Array(COLUMNS));
        } else {
            i--;
        }
    }
}

function getNextBlock() {
    const random = Math.random();

    if (random < 1/7) {
        return 'straight';
    } else if (random < 2/7) {
        return 'left_L';
    } else if (random < 3/7) {
        return 'right_L';
    } else if (random < 4/7) {
        return 'left_Z';
    } else if (random < 5/7) {
        return 'right_Z';
    } else if (random < 6/7) {
        return 'T';
    } else {
        return 'square';
    }
}

function descendPiece() {
    if (canDescend()) {
        for (let i = 0; i < 4; i++) {
            currPiece.startingCoords[i][0]++;
        }
    } else {
        for (let [x, y] of currPiece.startingCoords) {
            board[x][y] = currPiece.color;
        }
        currPiece = structuredClone(PIECES[nextPiece]);
        nextPiece = getNextBlock();
        eliminateRows();
    }
    setDisplay();
}

// Utility functions
function canDescend() {
    for (let [x, y] of currPiece.startingCoords) {
        if (x + 1 === ROWS || board[x + 1][y]) {
            return false;
        }
    }
    return true
}

function includes(i, j) {
    for (let [x, y] of currPiece.startingCoords) {
        if (x === i && y === j) {
            return true;
        }
    }
    return false
}

function canLeft() {
    for (let [x, y] of currPiece.startingCoords) {
        if (y === 0 || board[x][y - 1]) {
            return false;
        }
    }
    return true;
}

function canRight() {
    for (let [x, y] of currPiece.startingCoords) {
        if (y + 1 === COLUMNS || board[x][y + 1]) {
            return false;
        }
    }
    return true;
}

// board[18][0] = 'cyan';
// board[18][1] = 'cyan';
// board[18][2] = 'cyan';
// board[18][3] = 'cyan';
// board[18][4] = 'yellow';
// board[18][5] = 'yellow';
// board[17][4] = 'yellow';
// board[17][5] = 'yellow';

// board[19][0] = 'pink';
// board[19][1] = 'pink';
// board[19][2] = 'pink';
// board[19][3] = 'pink';
// board[19][4] = 'pink';
// board[19][5] = 'pink';
// board[19][6] = 'pink';
// board[19][7] = 'pink';
// board[19][8] = 'pink';
// board[19][9] = 'pink';