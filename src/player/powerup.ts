import { COMPONENT_TYPES } from "../constants";

const MAX_LIFE_TIME = 1000;

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

    // lifespan (builtin) is in ms, this is in frames
    private lifetime: number;

    constructor(game: Phaser.Game, x: number, y: number, key: string, maxLifetime?: number) {
        super(game, x, y, key);
        this.reset(x, y, 0, maxLifetime);
    }

    public reset(x: number, y: number, health?: number, maxLifetime?: number): Phaser.Sprite {
        super.reset(x, y, health);
        this.lifetime = maxLifetime ? maxLifetime : MAX_LIFE_TIME;
        return this;
    }

    public update() {
        this.lifetime --;
        if (this.lifetime <= 0) {
            this.destroy();
        } else if (this.lifetime < (MAX_LIFE_TIME / 3) ) {
            const lastDigit = this.lifetime % 10;
            this.visible = lastDigit > 2;
        }
    }

    public abstract getComponentName(): COMPONENT_TYPES;
}

export class BasicGunPowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "gun_1_powerup");
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
