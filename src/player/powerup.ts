import { COMPONENT_TYPES } from "../constants";

export abstract class Powerup extends Phaser.Sprite {
    public static createRandom(game: Phaser.Game, x: number, y: number): Powerup {
        const possibilities = [
            COMPONENT_TYPES.BASIC_GUN,
            COMPONENT_TYPES.ENGINE,
        ];

        const chosen: COMPONENT_TYPES = possibilities[Math.floor(Math.random() * possibilities.length)];

        switch (chosen) {
            case COMPONENT_TYPES.BASIC_GUN:
                return new BasicGunPowerup(game, x, y);
            case COMPONENT_TYPES.ENGINE:
                return new EnginePowerup(game, x, y);
            default:
            throw new Error(`Unknown component type for Powerup: ${chosen}`);
        }
    }

    public abstract getComponentName(): COMPONENT_TYPES;
}

export class BasicGunPowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "basic_gun_powerup");
    }

    public getComponentName(): COMPONENT_TYPES {
        return COMPONENT_TYPES.BASIC_GUN;
    }
}

export class EnginePowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "engine_1_powerup");
    }

    public getComponentName(): COMPONENT_TYPES {
        return COMPONENT_TYPES.ENGINE;
    }
}
