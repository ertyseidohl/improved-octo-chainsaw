import { COMPONENT_TYPES } from "../constants";
import BaseEnemy from "./base_enemy";

export default class BasicEnemy extends BaseEnemy {
    constructor(game: Phaser.Game, x: number, y: number, bulletsGroup: Phaser.Group) {
        super(game, x, y, "enemy", bulletsGroup);
    }

    public getPowerupToSpawn(): COMPONENT_TYPES | null {
        const options = [
            COMPONENT_TYPES.BASIC_GUN,
            COMPONENT_TYPES.ENGINE,
            COMPONENT_TYPES.SHIELD,
            COMPONENT_TYPES.ENERGY_CELL,
            COMPONENT_TYPES.ENERGY_CELL_HD,
        ];

        if (Math.random() < 0.95) {
            const randomJunk = Math.random();
            if (randomJunk < 0.5) {
                return COMPONENT_TYPES.SPACE_JUNK;
            } else if (randomJunk < 0.6) {
                return COMPONENT_TYPES.SPACE_DIAMOND;
            }
        }

        return options[Math.floor(Math.random() * options.length)];
    }
}
