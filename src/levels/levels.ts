import Gameplay from "../states/gameplay";
import Wave from "./wave";

import { WAVE_TYPE } from "../constants";

export interface Level {
    init: (gameState?: Gameplay) => void;
    update: (gameState?: Gameplay) => void;
    isOver: (gameState?: Gameplay, enemiesGroup?: Phaser.Group) => boolean;
    cleanup: (gameState?: Gameplay) => void;
}

function textLevel(text: string, duration: number): Level {
    return {
        init: (gameState: Gameplay) => {
            gameState.displayText(text, duration);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return !gameState.isDisplayingText();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    };
}

export const LEVELS: Level[] = [
    textLevel("[The Mining Guild] has invaded our system! [enter to progress]", 200),
    textLevel("They stole our [pri]mary [n]etwork [c]ontrol [e]lements, our only defense!", 200),
    textLevel("You two, with your scrappy ship, are our last hope to recover these [prince]s.", 200),
    textLevel("You should learn! Here's a dummy drone. Shoot it down.", 200),
    {
        init: (gameState: Gameplay) => {
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.DUMMY_DRONE),
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
    {
        init: (gameState: Gameplay) => {
            gameState.displayText("There was something inside! Helm, pick it up, quick!", 400);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.testPowerupPickedUp();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.displayText("Looks useful! Engineering, switch to power mode and connect it up!", 400);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.engineeringHasConnectedTestComponent();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    // LEVEL ONE
    {
        init: (gameState: Gameplay) => {
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.ROW_LEFT),
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
    // BOSS ONE
    {
        init: (gameState: Gameplay) => {
            console.log("INIT");
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BOSS),
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
    // LEVEL TWO
    {
        init: (gameState: Gameplay) => {
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.ROW_LEFT),
                new Wave(120, WAVE_TYPE.ROW_STRAIGHT),
                new Wave(120, WAVE_TYPE.ROW_RIGHT),
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
