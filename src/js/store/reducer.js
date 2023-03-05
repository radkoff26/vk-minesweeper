import actions from "./actions";
import {CellStatus} from "../config/spriteConfig";
import {generateField} from "../functions/gameFunctions";

/**
 * @param state {State}
 * @param action {string}
 * @param payload {object}
 * */
export default function reducer(state, action, payload) {
    switch (action) {
        case actions.UPDATE_FIELD_STATE:
            return {...state, fieldState: payload}
        case actions.UPDATE_FIELD_MINES:
            return {...state, fieldMines: payload}
        case actions.GENERATE_FIELD_MINES:
            const fieldMines = generateField(40, payload[0], payload[1])
            return {...state, fieldMines}
        case actions.INCREMENT_TIME:
            return {...state, time: state.time + 1}
        case actions.RESET_TIME:
            return {...state, time: 0}
        case actions.INCREMENT_MINES:
            return {...state, mineCount: state.mineCount + 1}
        case actions.DECREMENT_MINES:
            return {...state, mineCount: state.mineCount - 1}
        case actions.RESTART_GAME:
            const fieldState = []
            for (let i = 0; i < 16; i++) {
                fieldState[i] = []
                for (let j = 0; j < 16; j++) {
                    fieldState[i][j] = CellStatus.DEFAULT
                }
            }
            return {...state, fieldState, time: 0, mineCount: 40}
    }
    return state
}