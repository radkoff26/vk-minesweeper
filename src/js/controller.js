import Mines from "./components/mines";
import Timer from "./components/timer";
import {CellSpriteConfig, CellStatus} from "./config/spriteConfig";
import {hasWonGame, processCell} from "./functions/gameFunctions";
import actions from "./store/actions";

export default class Controller {
    /**
     * Main game block element
     * @type Element
     * */
    #game

    /**
     * Field element
     * @type Element
     * */
    #field

    /**
     * Dispatch from store
     * @type {function}
     * */
    #dispatch

    /**
     * Method to get state from store
     * @type {function}
     * */
    #getState

    /**
     * Mines widget
     * @type Mines
     * */
    #mines

    /**
     * Status button to restart the game
     * @type Element
     * */
    #statusButton

    /**
     * Game timer
     * @type Timer
     * */
    #timer

    /**
     * Boolean showing if the game is started
     * @type boolean
     * */
    #isGameStarted = false

    /**
     * @param game {Element}
     * @param store {{dispatch: function, getState: function}}
     * */
    constructor(game, store) {
        this.#game = game
        this.#dispatch = store.dispatch
        this.#getState = store.getState
    }

    /**
     * Method to initialize game space
     * */
    initGame() {
        // Header adjustment
        const header = this.#createElement("div", ["header", "inset_border"])
        this.#mines = new Mines(header, ["header__mines"], this.#dispatch, this.#getState)
        this.#statusButton = this.#createElement("div", ["header__status-button", "status-button", "default"])
        header.appendChild(this.#statusButton)
        this.#timer = new Timer(header, ["header__timer"], this.#dispatch, this.#getState)

        this.#statusButton.addEventListener("click", this.#restartGame)

        // Field adjustment
        this.#field = this.#createElement("div", ["field", "inset_border"])

        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                const cell = this.#createElement("div", ["cell"])
                cell.setAttribute("data-row", i.toString())
                cell.setAttribute("data-column", j.toString())
                this.#field.appendChild(cell)
            }
        }

        this.#restartGame()
        this.#field.addEventListener("contextmenu", e => e.preventDefault())

        // Header and Field integrating
        this.#game.appendChild(header)
        this.#game.appendChild(this.#field)
    }

    #createElement(tag, classes = []) {
        const block = document.createElement(tag)
        block.classList.add(...classes)
        return block
    }

    #restartGame = () => {
        this.#timer.stop()
        this.#dispatch(actions.RESTART_GAME)
        this.#toggleClass(this.#statusButton, ["defeated", "cool", "worried"], "default")
        this.#isGameStarted = false
        this.#timer.render()
        this.#mines.render()
        this.#field.addEventListener("mousedown", this.#clickListenerCallback)
        this.#rerenderCells()
    }

    #clickListenerCallback = (e) => {
        // if left click, then it's a default click to reveal territory
        if (!e.target.classList.contains("cell")) {
            return
        }
        e.preventDefault()
        // Since current target is a cell it has its row and column
        const row = Number(e.target.getAttribute("data-row"))
        const column = Number(e.target.getAttribute("data-column"))
        if (e.button === 0) {
            // if current clicked cell is not opened yet
            if (CellStatus.CLOSED.includes(this.#getState().fieldState[row][column])) {
                // While mouse is down, emoji is worried
                this.#toggleClass(this.#statusButton, "default", "worried")

                const onMouseUpOnLeftClick = e => {
                    let hasLost = false

                    // By this moment emoji gets default whether current target is cell or not
                    this.#toggleClass(this.#statusButton, "worried", "default")

                    // If current target is cell
                    if (e.target.classList.contains("cell")) {
                        const currentRow = Number(e.target.getAttribute("data-row"))
                        const currentColumn = Number(e.target.getAttribute("data-column"))

                        // Its cell coords are compared with initially clicked cell coords
                        if (currentRow === row && currentColumn === column) {
                            // If they are equal, then cell is completely clicked
                            // If this is the first step, then field is generated first
                            if (!this.#isGameStarted) {
                                this.#dispatch(actions.GENERATE_FIELD_MINES, [row, column])
                                this.#isGameStarted = true
                                this.#timer.start()
                            }
                            hasLost = this.#openCell(row, column)
                        }
                    }
                    // If bomb is clicked, then game is over
                    if (hasLost) {
                        this.#toggleClass(this.#statusButton, "default", "defeated")

                        // No clicks by cells are available anymore
                        this.#stopGame(row, column)
                    } else if (hasWonGame(this.#getState().fieldState, this.#getState().fieldMines)) {
                        this.#toggleClass(this.#statusButton, "default", "cool")
                        this.#stopGame(-1, -1)
                    }
                    // Rerender cells according to state
                    this.#rerenderCells()

                    this.#field.removeEventListener("mouseup", onMouseUpOnLeftClick)
                }
                this.#field.addEventListener("mouseup", onMouseUpOnLeftClick)
            }
        } else if (e.button === 2 && this.#isGameStarted) {
            // or if it's right click, then it's click to flag or mark current cell
            const onMouseUpOnRightClick = (e) => {
                if (e.target.classList.contains("cell")) {
                    const currentRow = Number(e.target.getAttribute("data-row"))
                    const currentColumn = Number(e.target.getAttribute("data-column"))

                    // Also comparing coords to find out if the cell is the same
                    if (currentRow === row && currentColumn === column) {
                        const fieldState = this.#copy(this.#getState().fieldState)
                        const currentState = fieldState[row][column]

                        switch (currentState) {
                            case CellStatus.DEFAULT:
                                const mines = this.#getState().mineCount
                                if (mines > 0) {
                                    this.#mines.removeMine()
                                    fieldState[row][column] = CellStatus.FLAGGED
                                } else {
                                    fieldState[row][column] = CellStatus.MARKED
                                }
                                break
                            case CellStatus.FLAGGED:
                                fieldState[row][column] = CellStatus.MARKED
                                this.#mines.addMine()
                                break
                            case CellStatus.MARKED:
                                fieldState[row][column] = CellStatus.DEFAULT
                                break
                        }

                        this.#dispatch(actions.UPDATE_FIELD_STATE, fieldState)
                        if (hasWonGame(fieldState, this.#getState().fieldMines)) {
                            this.#toggleClass(this.#statusButton, "default", "cool")
                            this.#stopGame(-1, -1)
                        }
                        this.#rerenderCells()
                    }
                    this.#field.removeEventListener("mouseup", onMouseUpOnRightClick)
                }
            }
            this.#field.addEventListener("mouseup", onMouseUpOnRightClick)
        }
    }

    #stopGame = (row, column) => {
        const fieldState = this.#revealBombs(row, column)
        this.#dispatch(actions.UPDATE_FIELD_STATE, fieldState)
        this.#timer.stop()
        this.#field.removeEventListener("mousedown", this.#clickListenerCallback)
    }

    #toggleClass(element, remove, add) {
        if (Array.isArray(remove)) {
            for (let removeElement of remove) {
                element.classList.toggle(removeElement, false)
            }
        } else {
            element.classList.toggle(remove, false)
        }
        element.classList.toggle(add, true)
    }

    #openCell(row, column) {
        const fieldState = this.#copy(this.#getState().fieldState)
        // If flagged cell is clicked, then it's no longer flagged in any case
        if (fieldState[row][column] === CellStatus.FLAGGED) {
            this.#dispatch(actions.INCREMENT_MINES)
            this.#mines.render()
        }
        const hasLost = processCell(this.#getState().fieldMines, fieldState, row, column)
        this.#dispatch(actions.UPDATE_FIELD_STATE, fieldState)
        return hasLost
    }

    #rerenderCells() {
        const fieldState = this.#getState().fieldState
        // Rerender every single cell according to its current state
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                const current = this.#field.querySelector(`.cell[data-row="${i}"][data-column="${j}"]`)
                current.style.backgroundPosition = CellSpriteConfig.getSprite(fieldState[i][j])
            }
        }
    }

    #revealBombs(explodedRow, explodedColumn) {
        const fieldMines = this.#getState().fieldMines
        const fieldState = this.#copy(this.#getState().fieldState)
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                if (i === explodedRow && j === explodedColumn) {
                    fieldState[i][j] = CellStatus.BOMB_EXPLODED
                    continue
                }
                if (fieldState[i][j] === CellStatus.MARKED) {
                    fieldState[i][j] = CellStatus.MARKED_OPEN
                    continue
                }
                if (fieldMines[i][j] === 1) {
                    if (fieldState[i][j] === CellStatus.FLAGGED) {
                        fieldState[i][j] = CellStatus.BOMB_DEFUSED
                    } else {
                        fieldState[i][j] = CellStatus.BOMB_REVEALED
                    }
                }
            }
        }
        return fieldState
    }

    #copy(obj) {
        return JSON.parse(JSON.stringify(obj))
    }
}