import BaseEnemy from "./base_enemy";

const STOP_POINT = 300;

export default class DummyDrone extends BaseEnemy {
    constructor(game: Phaser.Game, x: number, y: number) {
        super(game, x, y, "dummy_drone");

        const glow: Phaser.Animation = this.animations.add("rotate", [0, 1, 2]);
        glow.play(5, true);
    }

    public shouldSpawnPowerup(): boolean {
        return true;
    }

    public shouldSpawnPrince(): boolean {
        return false;
    }

    public shoot(): void {
        return;
    }

    public update(): void {
        if (!this.alive) {
            return;
        }
        super.update();

        if (!this.isInWindow()) {
            this.enemyBody.velocity.y = this.speedMin;
        } else if (this.y > STOP_POINT) {
            this.enemyBody.velocity.y = 0;
        }
    }
}
