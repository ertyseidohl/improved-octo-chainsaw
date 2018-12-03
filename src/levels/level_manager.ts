import { LEVELS } from "./levels";

import Gameplay from "../states/gameplay";

export default class LevelManager {
    private currentLevelNum: number;

    constructor(private gameplayState: Gameplay) {
        this.currentLevelNum = 5;
        LEVELS[this.currentLevelNum].init(this.gameplayState);
    }

    public update() {
        if (LEVELS[this.currentLevelNum].isOver(this.gameplayState)) {
            LEVELS[this.currentLevelNum].cleanup(this.gameplayState);
            this.currentLevelNum ++;

            if (this.currentLevelNum === LEVELS.length) {
                this.gameplayState.game.state.start("youwin");
                return;
            }

            console.log(`Now on level ${this.currentLevelNum}`);

            LEVELS[this.currentLevelNum].init(this.gameplayState);
        } else {
            LEVELS[this.currentLevelNum].update(this.gameplayState);
        }
    }
}
