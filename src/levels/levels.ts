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
            // tslint:disable-next-line
            gameState.displayText("There was something inside! Helm, use the arrow keys to pick it up. wire up some engines to go faster.", 400);
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.testPowerupPickedUp();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    {
        init: (gameState: Gameplay) => {
            // tslint:disable-next-line
            gameState.displayText("Hook it up! It looks like it needs 4 wires to run. pick up an energy cell to disconnect all of its wires", 400);
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
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => {
            gameState.displayText(
                "Great work! Now go get the other four [prince]s", 400);
        },
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
                "Another [prince] safe and sound - three to go!", 400);
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
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playBossMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BOSS),
                new Wave(0, WAVE_TYPE.BOMB),
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
                "Thanks! just one more prince!", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
    // LEVEL FOUR
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playFightMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.SWOOP_LEFT),
                new Wave(0, WAVE_TYPE.SWOOP_RIGHT),
                new Wave(120, WAVE_TYPE.BIGV),
                new Wave(60, WAVE_TYPE.BIGV),
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
            gameState.playBossMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BOSS),
                new Wave(0, WAVE_TYPE.BOMB),
                new Wave(0, WAVE_TYPE.BOMB),
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
                "Thanks! only one more prince to go!", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },

    // LEVEL FIVE
    {
        init: (gameState: Gameplay) => {
            gameState.stopAllMusic();
            gameState.playFightMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.SWOOP_LEFT),
                new Wave(0, WAVE_TYPE.SWOOP_RIGHT),
                new Wave(120, WAVE_TYPE.ROW_LEFT),
                new Wave(0, WAVE_TYPE.ROW_RIGHT),
                new Wave(120, WAVE_TYPE.ROW_STRAIGHT),
                new Wave(60, WAVE_TYPE.ROW_STRAIGHT),
                new Wave(60, WAVE_TYPE.ROW_STRAIGHT),
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
            gameState.playBossMusic();
            gameState.setUpcomingWaves([
                new Wave(0, WAVE_TYPE.BIGV),
                new Wave(30, WAVE_TYPE.BOSS),
                new Wave(30, WAVE_TYPE.BIGV),
                new Wave(30, WAVE_TYPE.BOMB),
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
                "You did it! Our planet is saved!", 400);
            gameState.generateBaseStation();
        },
        update: (gameState: Gameplay) => { /* empty */ },
        isOver: (gameState: Gameplay) => {
            return gameState.baseStationDone();
        },
        cleanup: (gameState: Gameplay) => { /* empty */ },
    },
];
