import Gameplay from "../states/gameplay";
import Wave from "./wave";

import { WAVE_TYPE } from "../constants";

export interface Level {
    init: (gameState?: Gameplay) => void;
    update: (gameState?: Gameplay) => void;
    isOver: (gameState?: Gameplay, enemiesGroup?: Phaser.Group) => boolean;
    cleanup: (gameState?: Gameplay) => void;
}

export const LEVELS: Level[] = [
    // LEVEL ZERO (placeholder)
    {
        init: (gameState: Gameplay) => {
            gameState.displayText("Get Ready...", 120);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return !gameState.isDisplayingText();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    // LEVEL ONE
    {
        init: (gameState: Gameplay) => {
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.RANDOM),
                // new Wave(0, WAVE_TYPE.ROW_LEFT),
                // new Wave(120, WAVE_TYPE.ROW_STRAIGHT),
                // new Wave(120, WAVE_TYPE.ROW_RIGHT),
                // new Wave(120, WAVE_TYPE.BIGV),
                // new Wave(120, WAVE_TYPE.SWOOP_LEFT),
                // new Wave(120, WAVE_TYPE.SWOOP_RIGHT),
            ]);
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.waveIndexAllDead(0);
        },
        cleanup: () => {
            // todo
        },
    },
];
