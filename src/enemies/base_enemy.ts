const ENEMY_SPEED_MIN: number = -200;
const ENEMY_SPEED_MAX: number = 200;
const ACTION_TIME_MIN: number = 200;
const ACTION_TIME_MAX: number = 1000;

export default class BaseEnemy extends Phaser.Sprite {
    private BOUND_X_MIN: number = 50;
    private BOUND_X_MAX: number = this.game.width / 2 - this.width;
    private BOUND_Y_MIN: number = 50;
    private BOUND_Y_MAX: number = this.game.height - this.height;
    private actionTime: number = 0;
    public update(): void {
        super.update();
        const thisBody: Phaser.Physics.P2.Body = this.body;

        if (!this.isInWindow()) {
            thisBody.velocity.y = ENEMY_SPEED_MAX;
        } else {
            if (this.game.time.now >= this.actionTime) {
                // re-assign action time
                this.actionTime = this.game.time.now +
                this.game.rnd.integerInRange(ACTION_TIME_MIN, ACTION_TIME_MAX);

                // assign random velocity
                thisBody.velocity.x = this.game.rnd.integerInRange(ENEMY_SPEED_MIN, ENEMY_SPEED_MAX);
                thisBody.velocity.y = this.game.rnd.integerInRange(ENEMY_SPEED_MIN, ENEMY_SPEED_MAX);
            }

            // boundaries
            if (thisBody.x < this.BOUND_X_MIN) {
                thisBody.x = this.BOUND_X_MIN;
                thisBody.velocity.x = -thisBody.velocity.x;
            }
            if (thisBody.x > this.BOUND_X_MAX) {
                thisBody.x = this.BOUND_X_MAX;
                thisBody.velocity.x = - thisBody.velocity.x;
            }
            if (thisBody.y < this.BOUND_Y_MIN) {
                thisBody.y = this.BOUND_Y_MIN;
                thisBody.velocity.y = -thisBody.velocity.y;
            }
            if (thisBody.y > this.BOUND_Y_MAX) {
                thisBody.y = this.BOUND_Y_MAX;
                thisBody.velocity.y = - thisBody.velocity.y;
            }
        }

    }

    private isInWindow(): boolean {
        let result: boolean = false;
        const thisBody: Phaser.Physics.P2.Body = this.body;
        if (thisBody.y > 0 + thisBody.sprite.height) {
            result = true;
        }
        return result;
    }
}
