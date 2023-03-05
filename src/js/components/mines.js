import Digits from "./digits";
import actions from "../store/actions";

export default class Mines extends Digits {
    /**
     * @type function
     * */
    #dispatch

    /**
     * @type function
     * */
    #getState

    constructor(root, additionalClasses, dispatch, getState) {
        super(root, getState().mineCount, additionalClasses);
        this.#dispatch = dispatch
        this.#getState = getState
    }

    addMine() {
        this.#dispatch(actions.INCREMENT_MINES)
        this._currentValue = this.#getState().mineCount
        this.render()
    }

    removeMine() {
        this.#dispatch(actions.DECREMENT_MINES)
        this._currentValue = this.#getState().mineCount
        this.render()
    }

    render = () => {
        this._currentValue = this.#getState().mineCount
        super.render();
    }
}