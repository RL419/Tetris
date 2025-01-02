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
        startingCoords : [[0, 3], [0, 4], [0, 5], [0, 6]],
        center : [0, 4],
        squareDimension : 4
    },
    left_L : {
        color : 'blue',
        startingCoords : [[0, 3], [1, 3], [1, 4], [1, 5]],
        center : [1, 4],
        squareDimension : 3
    },
    right_L : {
        color : 'orange',
        startingCoords : [[1, 3], [1, 4], [1, 5], [0, 5]],
        center : [1, 4],
        squareDimension : 3
    },
    left_Z : {
        color : 'red',
        startingCoords : [[0, 3], [0, 4], [1, 4], [1, 5]],
        center : [1, 4],
        squareDimension : 3
    },
    right_Z : {
        color : 'green',
        startingCoords : [[1, 3], [1, 4], [0, 4], [0, 5]],
        center : [1, 4],
        squareDimension : 3
    },
    T : {
        color : 'pink',
        startingCoords : [[1, 3], [1, 4], [1, 5], [0, 4]],
        center : [1, 4],
        squareDimension : 3
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
        clearInterval(runGame);
        currPiece = structuredClone(PIECES[nextPiece]);
        nextPiece = getNextBlock();
        eliminateRows();
        runGame = setInterval(descendPiece, 1000);
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        const new_coords = [];
        for (let [x, y] of currPiece.startingCoords) {
            if (y + 1 === COLUMNS || board[x][y + 1]) {
                return;
            }
            new_coords.push([x, y + 1])
        }
        currPiece.startingCoords = new_coords;
        if (currPiece.center) {
            currPiece.center[1]++;
        }
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        const new_coords = [];
        for (let [x, y] of currPiece.startingCoords) {
            if (y === 0 || board[x][y - 1]) {
                return;
            }
            new_coords.push([x, y - 1])
        }
        currPiece.startingCoords = new_coords;
        if (currPiece.center) {
            currPiece.center[1]--;
        }
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        if (canDescend()) {
            for (let i = 0; i < 4; i++) {
                currPiece.startingCoords[i][0]++;
            }
            if (currPiece.center) {
                currPiece.center[0]++;
            }
        }
    } else if (event.key === 'ArrowUp' || event.key === 'w') {
        if (currPiece.center) {
            const new_coords = [];
            for (let [i, j] of currPiece.startingCoords) {
                // To rotate a nxn square matrix clockwise by 90 degrees [i][j] => [j][n-1-i]
                // Turn the 3x3 square where the piece is located to zero index => [j - (center[1] - 1)][3 - 1 - (i - (center[0] - 1))]
                // To relocate the square back to it position => [j - center[1] + 1 + (center[0] - 1)][3 - 1 - i + center[0] - 1 + (center[1] - 1)]
                // Which simplifies to [j - center[1] + center[0]][center[0] + center[1] - i]
                // Or [j - center[1] + center[0]][n - 3 - i + center[0] + center[1]]
                const x = j - currPiece.center[1] + currPiece.center[0], y = currPiece.squareDimension - 3 - i + currPiece.center[0] + currPiece.center[1];
                if (x < 0 || x >= ROWS || y < 0 || y >= COLUMNS || board[x][y]) {
                    return;
                }
                new_coords.push([x, y])
            }
            currPiece.startingCoords = new_coords;
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
});

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
        if (currPiece.center) {
            currPiece.center[0]++;
        }
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

function canRotate() {
    const [x, y] = currPiece.startingCoords[1];
    for (let [xi, yi] of currPiece.startingCoords) {
        const dx = xi - x, dy = yi - y;
        if (x + dy < 0 || x + dy >= ROWS || y + dx < 0 || y + dx >= COLUMNS || board[x + dy][y + dx]) {
            return false;
        }
    }
    return true;
}
