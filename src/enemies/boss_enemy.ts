import { COMPONENT_TYPES } from "../constants";
import { Powerup } from "../player/powerup";
import BaseEnemy from "./base_enemy";

export default class BossEnemy extends BaseEnemy {
    public maxHealth: number = 30;

    protected speedMin: number = 100;
    protected speedMax: number = 300;

    protected shootTimeMin = 600;
    protected shootTimeMax = 600;

    constructor(game: Phaser.Game, x: number, y: number, bulletsGroup: Phaser.Group) {
        super(game, x, y, "boss_enemy", bulletsGroup);

        const glow: Phaser.Animation = this.animations.add("glow", [0, 1, 2]);
        glow.play(5, true);
    }

    public getPowerupToSpawn(): COMPONENT_TYPES {
        return COMPONENT_TYPES.PRINCE;
    }

    public update(): void {
        if (!this.alive) {
            return;
        }

        if (!this.isInWindow()) {
            this.enemyBody.velocity.y = this.speedMin;
        } else {
            if (this.game.time.now >= this.actionTime) {
                // re-assign action time
                this.actionTime = this.game.time.now +
                    this.game.rnd.integerInRange(this.actionTimeMin, this.actionTimeMax);

                // randomize velocities
                let direction: number = this.game.rnd.integerInRange(this.dirMin, this.dirMax);
                if (direction === 0) {
                    direction = -1;
                }
                let speed: number = this.game.rnd.integerInRange(this.speedMin, this.speedMax);
                this.enemyBody.velocity.x = speed * direction;

                direction = this.game.rnd.integerInRange(this.dirMin, this.dirMax);
                if (direction === 0) {
                    direction = -1;
                }
                speed = this.game.rnd.integerInRange(this.speedMin, this.speedMax);
                this.enemyBody.velocity.y = speed * direction;
            }

            this.bounceOffWalls();

            if (this.game.time.now >= this.shootTime) {
                this.shootTime = this.game.time.now + this.game.rnd.integerInRange(
                    this.shootTimeMin, this.shootTimeMax);
                this.shoot();
            }
        }
    }

    protected shoot(): void {
        let bullet;

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = this.bulletSpeed;
            bulletBody.velocity.y = this.bulletSpeed;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = 0;
            bulletBody.velocity.y = this.bulletSpeed;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = -this.bulletSpeed;
            bulletBody.velocity.y = this.bulletSpeed;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = -this.bulletSpeed;
            bulletBody.velocity.y = 0;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = -this.bulletSpeed;
            bulletBody.velocity.y = -this.bulletSpeed;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = 0;
            bulletBody.velocity.y = -this.bulletSpeed;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = this.bulletSpeed;
            bulletBody.velocity.y = -this.bulletSpeed;
        }

        bullet = this.bulletsGroup.getFirstExists(false);
        if (bullet) {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bullet.reset(this.x, this.y + 20);
            bulletBody.velocity.x = this.bulletSpeed;
            bulletBody.velocity.y = 0;
        }
    }
}
