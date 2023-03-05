import {CellStatus} from "../config/spriteConfig";

function countAround(field, row, column) {
    let count = 0
    if (row > 0) {
        if (field[row - 1][column] === 1) {
            count++
        }
        if (column > 0 && field[row - 1][column - 1] === 1) {
            count++
        }
        if (column < 15 && field[row - 1][column + 1] === 1) {
            count++
        }
    }
    if (row < 15) {
        if (field[row + 1][column] === 1) {
            count++
        }
        if (column > 0 && field[row + 1][column - 1] === 1) {
            count++
        }
        if (column < 15 && field[row + 1][column + 1] === 1) {
            count++
        }
    }
    if (column > 0 && field[row][column - 1] === 1) {
        count++
    }
    if (column < 15 && field[row][column + 1] === 1) {
        count++
    }
    return count
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function processCell(fieldMines, fieldState, r, c) {
    if (fieldMines[r][c] === 1) {
        return true
    }
    const queue = [[r, c]]
    const visited = new Set()
    // Depth-First Search Algorithm
    // Here all adjacent non-bombed cells are revealed
    while (queue.length > 0) {
        const [row, column] = queue.shift()
        // Either cell already open, or flagged, or with bomb, or just visited
        if (row < 0 || row >= 16 || column < 0 || column >= 16 || !CellStatus.CLOSED.includes(fieldState[row][column]) || (fieldState[row][column] === CellStatus.FLAGGED && row !== r && column !== c) || visited.has([row, column]) || fieldMines[row][column] === 1) {
            continue
        }
        const count = countAround(fieldMines, row, column)
        if (count > 0) {
            fieldState[row][column] = CellStatus.NUMBER + count - 1
            continue
        }
        fieldState[row][column] = CellStatus.OPEN
        visited.add([row, column])
        queue.push([row - 1, column])
        queue.push([row + 1, column])
        queue.push([row, column - 1])
        queue.push([row, column + 1])
    }
    return false
}

export function generateField(mineCount, excludeRow, excludeColumn) {
    const excludeIndex = excludeRow * 16 + excludeColumn
    const array = []
    for (let i = 0; i < 256; i++) {
        if (i === excludeIndex) {
            continue
        }
        array.push(i)
    }
    shuffleArray(array)
    const field = []
    for (let i = 0; i < 16; i++) {
        field.push([])
        for (let j = 0; j < 16; j++) {
            field[i].push(0)
        }
    }
    for (let i = 0; i < mineCount; i++) {
        const row = Math.floor(array[i] / 16)
        const column = array[i] % 16
        field[row][column] = 1
    }
    return field
}

export function hasWonGame(fieldState, fieldMines) {
    let countOpen = 0
    let countFlagged = 0

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            if (!CellStatus.CLOSED.includes(fieldState[i][j])) {
                countOpen++
            } else if (fieldState[i][j] === CellStatus.FLAGGED && fieldMines[i][j] === 1) {
                countFlagged++
            }
        }
    }
    return countOpen + countFlagged === 256;
}
