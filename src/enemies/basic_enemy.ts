import BaseEnemy from "./base_enemy";

export default class BasicEnemy extends BaseEnemy {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "enemy");
    }

    public shouldSpawnPowerup(): boolean {
        return Math.random() < 0.05;
    }

    public shouldSpawnPrince(): boolean {
        return false;
    }
}
