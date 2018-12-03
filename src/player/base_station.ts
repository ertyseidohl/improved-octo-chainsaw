export default class BaseStation extends Phaser.Sprite {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "base_station");
    }

    public update(): void {
        this.y += 5;
    }

    public getDockPoint(): number {
        return this.x + 110; // magic number
    }
}
