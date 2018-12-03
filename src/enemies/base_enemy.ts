import { WAVE_TYPE } from "../constants";

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
    private bound: Phaser.Rectangle;
    private actionTime: number;
    private shootTime: number;
    private waveType: number;

    private returningToTop: boolean;

    public constructor(game: Phaser.Game, x: number, y: number, key: string) {
        super(game, x, y, key);

        this.bound = new Phaser.Rectangle();
        this.bound.x = 30;
        this.bound.width = this.game.width / 2 - 30;
        this.bound.y = 0;
        this.bound.height = this.game.height - this.height;

        this.game.physics.p2.enable(this);
        this.enemyBody = this.body;
        this.enemyBody.fixedRotation = true;
        this.actionTime = this.game.time.now + this.game.rnd.integerInRange(0, ACTION_TIME_MAX);
        this.shootTime = this.game.time.now + this.game.rnd.integerInRange(0, SHOOT_TIME_MAX);
        this.waveType = WAVE_TYPE.NONE;

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
            case WAVE_TYPE.NONE:
                if (this.returningToTop) {
                    if (this.y < this.bound.y) {
                        this.waveType = WAVE_TYPE.RANDOM;
                        this.returningToTop = false;
                    }
                }
                break;
            case WAVE_TYPE.RANDOM:
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
            }
            break;
            case WAVE_TYPE.SWOOP_LEFT:
            case WAVE_TYPE.SWOOP_RIGHT:
                this.enemyBody.velocity.y = ENEMY_SPEED_MAX * 2;
                if (this.enemyBody.y > this.bound.height) {
                    this.returnToTop();
                }
                break;
            case WAVE_TYPE.BIGV:
            case WAVE_TYPE.ROW_LEFT:
            case WAVE_TYPE.ROW_RIGHT:
            case WAVE_TYPE.ROW_STRAIGHT:
                this.enemyBody.velocity.y = ENEMY_SPEED_MAX;
                if (this.enemyBody.y > this.bound.height) {
                    this.returnToTop();
                }
                break;
        }

        // boundaries
        if (this.enemyBody.y > this.bound.y) {
            if (this.enemyBody.x < this.bound.x) {
                this.enemyBody.x = this.bound.x;
                this.enemyBody.velocity.x = -this.enemyBody.velocity.x;
            }
            if (this.enemyBody.x > this.bound.width) {
                this.enemyBody.x = this.bound.width;
                this.enemyBody.velocity.x = - this.enemyBody.velocity.x;
            }
        }
        if (this.enemyBody.y > this.bound.height) {
            this.enemyBody.y = this.bound.height;
            this.enemyBody.velocity.y = -ENEMY_SPEED_MAX;
        }

        // shoot (shooting is always random regardless of wave)
        if (this.game.time.now >= this.shootTime) {
            this.shootTime = this.game.time.now + this.game.rnd.integerInRange(SHOOT_TIME_MIN, SHOOT_TIME_MAX);
            this.shoot();
        }
    }

    public setWaveType(type: number): void {
        this.waveType = type;
    }

    public setXVel(xVel: number): void {
        this.enemyBody.velocity.x = xVel;
    }

    private returnToTop(): void {
        this.returningToTop = true;
        this.enemyBody.velocity.x = 0;
        this.enemyBody.velocity.y = -ENEMY_SPEED_MAX;
        this.waveType = WAVE_TYPE.NONE;
    }

    private shoot(): void {
        const bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.y = BULLET_SPEED;
            if (this.waveType === WAVE_TYPE.SWOOP_LEFT || this.waveType === WAVE_TYPE.SWOOP_RIGHT) {
                bulletBody.velocity.x = this.enemyBody.velocity.x;
            }
        }
    }

    private isInWindow(): boolean {
        let result: boolean = false;
        const buffer: number = 40;
        if (this.enemyBody.y > this.bound.y + buffer) {
            result = true;
        }
        return result;
    }
}
