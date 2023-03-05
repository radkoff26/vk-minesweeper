import Digits from "./digits";
import actions from "../store/actions";

export default class Timer extends Digits {
    /**
     * @type boolean
     * */
    #isStarted = false

    /**
     * @type number
     * */
    #interval

    /**
     * @type function
     * */
    #dispatch

    /**
     * @type function
     * */
    #getState

    constructor(root, additionalClasses, dispatch, getState) {
        super(root, 0, additionalClasses);
        this.#dispatch = dispatch
        this.#getState = getState
    }

    start() {
        if (!this.#isStarted) {
            this._currentValue = 0
            this.#interval = setInterval(() => {
                this.#dispatch(actions.INCREMENT_TIME)
                this._currentValue = this.#getState().time
                if (this._currentValue >= 1000) {
                    this.#dispatch(actions.RESET_TIME)
                    this._currentValue = this.#getState().time
                }
                this.render()
            }, 1000)
            this.#isStarted = true
        }
    }

    stop() {
        if (this.#isStarted) {
            clearInterval(this.#interval)
            this.#isStarted = false
        }
    }

    render = () => {
        this._currentValue = this.#getState().time
        super.render();
    }
}