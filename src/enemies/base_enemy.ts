import { ENEMY_WAVE } from "../constants";

const ENEMY_SPEED_MIN: number = 100;
const ENEMY_SPEED_MAX: number = 200;
const DIR_MIN: number = 0;
const DIR_MAX: number = 1;
const ACTION_TIME_MIN: number = 3000;
const ACTION_TIME_MAX: number = 3000;
const SHOOT_TIME_MIN: number = 4000;
const SHOOT_TIME_MAX: number = 6000;
const BULLET_SPEED: number = 500;
const HEALTH_MAX: number = 3;

export default class BaseEnemy extends Phaser.Sprite {
    private enemyBody: Phaser.Physics.P2.Body;
    private bulletsGroup: Phaser.Group;
    private BOUND_X_MIN: number = 50;
    private BOUND_X_MAX: number = this.game.width / 2 - this.width;
    private BOUND_Y_MIN: number = 50;
    private BOUND_Y_MAX: number = this.game.height - this.height;
    private actionTime: number;
    private shootTime: number;
    private waveType: number;

    public constructor(game: Phaser.Game, x: number, y: number, key: string) {
        super(game, x, y, key);
        this.game.physics.p2.enable(this);
        this.enemyBody = this.body;
        this.enemyBody.fixedRotation = true;
        this.actionTime = this.game.time.now + this.game.rnd.integerInRange(0, ACTION_TIME_MAX);
        this.shootTime = this.game.time.now + this.game.rnd.integerInRange(0, SHOOT_TIME_MAX);
        this.waveType = ENEMY_WAVE.NONE;

        this.maxHealth = HEALTH_MAX;

        // bullets
        this.bulletsGroup = this.game.add.group();
        this.bulletsGroup.createMultiple(30, "enemyBullet");
        this.game.physics.p2.enable(this.bulletsGroup);
        this.bulletsGroup.setAll("outOfBoundsKill", true);
        this.bulletsGroup.setAll("checkWorldBounds", true);
        this.bulletsGroup.setAll("body.collideWorldBounds", false);
        this.bulletsGroup.setAll("body.fixedRotation", true);
    }

    public randomizeTimes(): void {
        this.actionTime = this.game.time.now + this.game.rnd.integerInRange(0, ACTION_TIME_MAX);
        this.shootTime = this.game.time.now + this.game.rnd.integerInRange(0, SHOOT_TIME_MAX);
    }

    public setBulletsCollisionGroup(bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup): void {
        this.bulletsGroup.forEach((bullet: Phaser.Sprite) => bullet.body.setCollisionGroup(bulletCollisionGroup));
    }

    public setBulletsCollides(
        otherCollisionGroup: Phaser.Physics.P2.CollisionGroup,
        callback: (bullet: Phaser.Physics.P2.Body, player: Phaser.Physics.P2.Body) => void,
        bindTo: any,
    ): void {
        this.bulletsGroup.forEach(
            (bullet: Phaser.Sprite) => bullet.body.collides(otherCollisionGroup, callback, bindTo),
        );
    }

    public update(): void {
        if (!this.alive) {
            return;
        }
        super.update();

        switch (this.waveType) {
            case ENEMY_WAVE.NONE:
            break;
            case ENEMY_WAVE.RANDOM:
            if (!this.isInWindow()) {
                this.enemyBody.velocity.y = ENEMY_SPEED_MAX;
            } else {
                if (this.game.time.now >= this.actionTime) {
                    // re-assign action time
                    this.actionTime = this.game.time.now +
                        this.game.rnd.integerInRange(ACTION_TIME_MIN, ACTION_TIME_MAX);

                    // randomize velocities
                    let direction: number = this.game.rnd.integerInRange(DIR_MIN, DIR_MAX); // get either 0, or 1;
                    if (direction === 0) {
                        direction = -1;
                    }
                    let speed: number = this.game.rnd.integerInRange(ENEMY_SPEED_MIN, ENEMY_SPEED_MAX);
                    this.enemyBody.velocity.x = speed * direction;

                    direction = this.game.rnd.integerInRange(DIR_MIN, DIR_MAX); // get either -1, 0, or 1;
                    if (direction === 0) {
                        direction = -1;
                    }
                    speed = this.game.rnd.integerInRange(ENEMY_SPEED_MIN, ENEMY_SPEED_MAX);
                    this.enemyBody.velocity.y = speed * direction;
                }

                // shoot
                if (this.game.time.now >= this.shootTime) {
                    this.shootTime = this.game.time.now + this.game.rnd.integerInRange(SHOOT_TIME_MIN, SHOOT_TIME_MAX);
                    this.shoot();
                }

                // boundaries
                if (this.enemyBody.x < this.BOUND_X_MIN) {
                    this.enemyBody.x = this.BOUND_X_MIN;
                    this.enemyBody.velocity.x = -this.enemyBody.velocity.x;
                }
                if (this.enemyBody.x > this.BOUND_X_MAX) {
                    this.enemyBody.x = this.BOUND_X_MAX;
                    this.enemyBody.velocity.x = - this.enemyBody.velocity.x;
                }
                if (this.enemyBody.y < this.BOUND_Y_MIN) {
                    this.enemyBody.y = this.BOUND_Y_MIN;
                    this.enemyBody.velocity.y = -this.enemyBody.velocity.y;
                }
                if (this.enemyBody.y > this.BOUND_Y_MAX) {
                    this.enemyBody.y = this.BOUND_Y_MAX;
                    this.enemyBody.velocity.y = - this.enemyBody.velocity.y;
                }
            }
            break;
            case ENEMY_WAVE.SWOOP:
            break;
            case ENEMY_WAVE.BIGV:
            break;
            case ENEMY_WAVE.ROWS:
            break;
        }

    }

    public setWaveType(type: number): void {
        this.waveType = type;
    }

    private shoot(): void {
        const bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.y = BULLET_SPEED;
        }
    }

    private isInWindow(): boolean {
        let result: boolean = false;
        const buffer: number = 40;
        if (this.enemyBody.y > this.BOUND_Y_MIN + buffer) {
            result = true;
        }
        return result;
    }
}
