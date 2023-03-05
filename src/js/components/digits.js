import {DigitSpriteConfig} from "../config/spriteConfig";

export default class Digits {
    /**
     * Digits container element
     * @type Element
     * */
    #digits

    /**
     * Current value to display
     * @type number
     * */
    _currentValue

    /**
     * Number of digits to display
     * @type number
     * */
    NUMBER_OF_DIGITS = 3

    constructor(root, initialValue, additionalClasses) {
        this.#digits = document.createElement("div")
        this.#digits.classList.add("digits", ...additionalClasses)

        for (let i = 0; i < this.NUMBER_OF_DIGITS; i++) {
            const digit = document.createElement("div")
            digit.classList.add("digits__digit")
            digit.setAttribute("data-index", i.toString())
            this.#digits.insertAdjacentElement("afterbegin", digit)
        }

        this._currentValue = initialValue

        this.render()
        root.insertAdjacentElement("beforeend", this.#digits)
    }

    render() {
        let num = this._currentValue

        for (let i = 0; i < this.NUMBER_OF_DIGITS; i++) {
            const digit = this.#digits.querySelector(`[data-index="${i}"]`)
            digit.style.backgroundPosition = DigitSpriteConfig.getDigitPosition(num % 10)
            num = Math.floor(num / 10)
        }
    }
}