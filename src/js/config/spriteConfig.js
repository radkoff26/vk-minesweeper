export class DigitSpriteConfig {
    static #width = 13

    static getDigitPosition(digit) {
        const k = digit === 0 ? 9 : digit - 1;
        const x = -k * (this.#width + 1);
        return x + "px " + 0
    }
}

export class CellSpriteConfig {
    static #width = 16

    static getSprite(sprite) {
        if (sprite < 0 || sprite > 15) {
            throw new Error("Number is out of range!")
        }
        if (sprite > 7) {
            return this.#getNumberCell(sprite - 8)
        }
        const x = -sprite * (this.#width + 1)
        return x + "px -51px"
    }

    static #getNumberCell(n) {
        const x = -n * (this.#width + 1);
        return x + "px -68px"
    }
}

export class CellStatus {
    static DEFAULT = 0
    static OPEN = 1
    static FLAGGED = 2
    static MARKED = 3
    static MARKED_OPEN = 4
    static BOMB_REVEALED = 5
    static BOMB_EXPLODED = 6
    static BOMB_DEFUSED = 7
    static NUMBER = 8

    static CLOSED = [CellStatus.DEFAULT, CellStatus.FLAGGED, CellStatus.MARKED]
}
