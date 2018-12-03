import { WAVE_TYPE } from "../constants";

export default class Wave {
    public enemyCreateTime: number = 0;
    public spawnEnemyNumber: number = 0;
    public allSpawned: boolean = false;

    public enemies: Phaser.Sprite[];

    constructor(public spawnDelay: number, public waveType: WAVE_TYPE) {
        this.enemies = [];
    }

    public addEnemy(enemy: Phaser.Sprite) {
        this.enemies.push(enemy);
    }

    public allDead(): boolean {
        this.enemies = this.enemies.filter((e: Phaser.Sprite) => e.alive);
        return this.enemies.length === 0;
    }
}
