import { COMPONENT_TYPES } from "../constants";
import BaseEnemy from "./base_enemy";

export default class BasicEnemy extends BaseEnemy {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "enemy");
    }

    public getPowerupToSpawn(): COMPONENT_TYPES | null {
        const options = [
            COMPONENT_TYPES.BASIC_GUN,
            COMPONENT_TYPES.ENGINE,
        ];

        if (Math.random() < 0.5) {
            return null;
        }

        return options[Math.floor(Math.random() * options.length)];
    }
}
