export abstract class Powerup extends Phaser.Sprite {
    public abstract getComponentName(): string;
}

export class BasicGunPowerup extends Powerup {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "basic_gun_powerup");
    }

    public getComponentName(): string {
        return "basic_gun";
    }
}
