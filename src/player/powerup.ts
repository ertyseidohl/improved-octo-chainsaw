import { COMPONENT_TYPES } from "../constants";

export abstract class Powerup extends Phaser.Sprite {
    // lifespan (builtin) is in ms, this is in frames
    private lifetime: number;
    private maxLifetime: number;

    constructor(game: Phaser.Game, x: number, y: number, key: string, maxLifetime: number = 1000) {
        super(game, x, y, key);
        this.maxLifetime = maxLifetime;
        this.reset(x, y, 0);
    }

    public reset(x: number, y: number, health?: number): Phaser.Sprite {
        super.reset(x, y, health);
        this.lifetime = this.maxLifetime;
        return this;
    }

    public update() {
        this.lifetime --;
        if (this.lifetime <= 0) {
            this.destroy();
        } else if (this.lifetime < (this.maxLifetime / 3) ) {
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

export class PrincePowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "prince", Infinity);
    }

    public getComponentName(): COMPONENT_TYPES {
        return COMPONENT_TYPES.PRINCE;
    }
}

export class SpaceJunkPowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "space_junk");
    }

    public getComponentName(): COMPONENT_TYPES {
        return COMPONENT_TYPES.SPACE_JUNK;
    }
}

export class SpaceDiamondPowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "space_diamond");
    }

    public getComponentName(): COMPONENT_TYPES {
        return COMPONENT_TYPES.SPACE_DIAMOND;
    }
}
