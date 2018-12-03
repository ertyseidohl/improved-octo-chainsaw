import { COMPONENT_TYPES } from "../constants";

export abstract class Powerup extends Phaser.Sprite {
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
