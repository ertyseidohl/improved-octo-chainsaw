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
    textLevel("The Mining Guild has invaded our system! [enter to progress]", 400),
    textLevel("They stole our [pri]mary [n]etwork [c]ontrol [e]lements, our only defence!", 400),
    {
        init: (gameState: Gameplay) => {
            gameState.displayText(
                "You two, with your scrappy ship, are our last hope to recover these [prince]s.", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.displayText(
                "Here's a dummy drone. Use wire mode to connect two wires to a gun, then press space to shoot.", 600);
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.DUMMY_DRONE),
            ]);
            gameState.stopAllMusic();
            gameState.playFightMusic();
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.displayText("There was something inside! Helm, use the arrow keys to pick it up, quick!", 400);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.testPowerupPickedUp();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.displayText("Looks useful! Engineering, use wire mode and connect it up!", 400);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.engineeringHasConnectedTestComponent();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    textLevel("Great! Now go retrieve those [prince]s and save our planet!", 400),
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
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    // BOSS ONE
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playBossMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BOSS),
            ]);
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.displayText("Grab that [prince] - make sure you have space for it!", 400);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.princeInInventory();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    textLevel("Now, get back to base so that we can start to repair our defences!", 400),
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playSafeMusic();
            gameState.displayText(
                "Great work! Now go get the other 8 [prince]s", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    // LEVEL TWO
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playFightMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.ROW_STRAIGHT),
                new Wave(60, WAVE_TYPE.ROW_STRAIGHT),
                new Wave(240, WAVE_TYPE.BOMB),
            ]);
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    // BOSS TWO
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playBossMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BOSS),
            ]);
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playSafeMusic();
            gameState.displayText(
                "Another [prince] safe and sound - seven to go!", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    // LEVEL THREE
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playFightMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.SWOOP_LEFT),
                new Wave(60, WAVE_TYPE.SWOOP_RIGHT),
                new Wave(240, WAVE_TYPE.BIGV),
                new Wave(60, WAVE_TYPE.BOMB),
            ]);
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    // BOSS TWO
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playBossMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BOSS),
            ]);
        },
        update: () => {
            // todo
        },
        isOver: (gameState: Gameplay) => {
            return gameState.allWavesDead();
        },
        cleanup: () => {
            // todo
        },
    },
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playSafeMusic();
            gameState.displayText(
                "Thanks! Six more [prince]s left!", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
];
