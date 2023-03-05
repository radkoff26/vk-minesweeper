import Controller from "./controller";
import reducer from "./store/reducer";
import {store} from "./store/store";

const game = document.querySelector("#game")
const gameStore = store(reducer)

const controller = new Controller(game, gameStore)
controller.initGame()
