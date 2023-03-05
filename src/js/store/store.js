import State from "./state";

/**
 * Store initialization method
 * @param rootReducer {function}
 * */
export function store(rootReducer) {
    let state = new State()
    const dispatch = (action, payload) => {
        state = rootReducer(state, action, payload)
    }
    const getState = () => state
    return {dispatch, getState}
}
