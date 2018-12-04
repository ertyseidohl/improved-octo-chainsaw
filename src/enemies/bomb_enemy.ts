import { COMPONENT_TYPES } from "../constants";
import BaseEnemy from "./base_enemy";

const BOMB_DROP_Y: number = 200;

export default class BombEnemy extends BaseEnemy {
    protected actionTimeMin = 800;
    protected actionTimeMax = 1200;

    private movingBackAndForth: boolean = false;

    constructor(game: Phaser.Game, x: number, y: number, bulletsGroup: Phaser.Group) {
        super(game, x, y, "bomb_enemy", bulletsGroup);
    }

    public getPowerupToSpawn(): COMPONENT_TYPES | null {
        const options = [
            COMPONENT_TYPES.BASIC_GUN,
            COMPONENT_TYPES.BIG_ENGINE,
            COMPONENT_TYPES.ENGINE,
            COMPONENT_TYPES.SHIELD,
            COMPONENT_TYPES.ENERGY_CELL,
            COMPONENT_TYPES.ENERGY_CELL_HD,
        ];

        if (Math.random() < 0.7) {
            return null;
        }

        return options[Math.floor(Math.random() * options.length)];
    }

    public update(): void {
        if (!this.alive) {
            return;
        }
        if (this.y < BOMB_DROP_Y) {
            this.enemyBody.velocity.y = this.speedMin;
        } else {
            if (!this.movingBackAndForth) {
                this.movingBackAndForth = true;
                this.enemyBody.velocity.x += 200;
            }
            this.enemyBody.velocity.y = 0;
            if (this.game.time.now >= this.shootTime) {
                this.shootTime = this.game.time.now +
                        this.game.rnd.integerInRange(this.actionTimeMin, this.actionTimeMax);

                this.shoot();
            }
        }

        if (this.x < this.bound.x) {
            this.x = this.bound.x;
            this.enemyBody.velocity.x *= -1;
        } else if (this.x > this.bound.width - this.width) {
            this.x = this.bound.width - this.width;
            this.enemyBody.velocity.x *= -1;
        }
    }
}
