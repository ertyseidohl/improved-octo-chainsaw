import BaseEnemy from "../enemies/base_enemy";

import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";
import { BasicGun } from "../inventory/basic_gun";
import { InventorySystem } from "../inventory/system";

import Engineering from "../engineering/engineering";
import Player from "../player/player";

// constants
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SCALE: number = 1;
const ENEMY_COUNT = 30;

export default class Startup extends Phaser.State {
    // game objects
    private player: Player;
    private enemy: Phaser.Sprite;
    private bullet: Phaser.Sprite;
    private enemyBody: Phaser.Physics.P2.Body; // same deal for enemy and all others
    private bulletBody: Phaser.Physics.P2.Body;
    private playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private enemyCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private worldCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    // Enemy vars
    private enemyCreateCoolDwn = 1000;
    private enemyCreateTime = 0;

    // groups
    private groupEnemies: Phaser.Group;

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

    private liveComponents: Phaser.Group;

    private borderSprite: Phaser.Sprite;

    // engineering section
    private engineering = new Engineering(this);

    public preload(): void {
        this.game.load.image("player", "../assets/ship.png");
        this.game.load.image("enemy", "../assets/diamond.png");
        this.game.load.image("border", "../assets/border.png");
        this.game.load.image("bullet", "../assets/star.png");

        this.engineering.preload();
    }

    public create(): void {
        const { width, height } = this.game;

        // collision groups
        this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.bulletCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.worldCollisionGroup = this.game.physics.p2.createCollisionGroup();

        // play area bounds
        this.borderSprite = this.game.add.sprite(width / 2, height / 2, "border");
        this.game.physics.p2.enable(this.borderSprite, true);
        const borderSpriteBody: Phaser.Physics.P2.Body = this.borderSprite.body;
        borderSpriteBody.static = true;
        borderSpriteBody.setCollisionGroup(this.worldCollisionGroup);
        borderSpriteBody.collides([this.playerCollisionGroup, this.enemyCollisionGroup, this.bulletCollisionGroup]);

        this.shmupBounds = new Phaser.Rectangle(
            0,
            0,
            width / 2 - this.borderSprite.width / 2,
            height,
        );
        this.engineering.bounds = new Phaser.Rectangle(
            this.shmupBounds.width + this.borderSprite.width,
            0,
            this.shmupBounds.width,
            this.game.height,
        );

        // setup engineering
        this.engineering.create();

        // sprites and physics
        this.player = new Player(this.game, 200, 200, "player");
        this.game.add.existing(this.player);

        // groups

        // assign collision groups
        this.player.body.setCollisionGroup(this.playerCollisionGroup);
        this.player.body.collides(this.worldCollisionGroup);
        this.player.body.collides(this.enemyCollisionGroup);

        // This part is vital if you want the objects
        // with their own collision groups to still collide with the world bounds
        // (which we do) - what this does is adjust the bounds to use its own collision group.
        this.game.physics.p2.updateBoundsCollisionGroup();

        this.player.setBulletsCollisionGroup(this.bulletCollisionGroup);
        this.player.setBulletsCollides(this.enemyCollisionGroup, this.bulletHitEnemy, this);

        // enemies
        this.groupEnemies = this.game.add.group();
        for (let i: number = 0; i < ENEMY_COUNT; i++) {
            const newEnemy: BaseEnemy = new BaseEnemy(this.game, Math.random(), 0, "enemy");
            this.groupEnemies.add(newEnemy);
            newEnemy.kill();
        }
        this.game.physics.p2.enable(this.groupEnemies, true);
        this.groupEnemies.setAll("scale.x", ENEMY_SCALE);
        this.groupEnemies.setAll("scale.y", ENEMY_SCALE);
        this.groupEnemies.forEach((enemy: Phaser.Sprite) => {
            const enemyBody: Phaser.Physics.P2.Body = enemy.body;
            enemyBody.setCollisionGroup(this.enemyCollisionGroup);
            enemyBody.collides([this.playerCollisionGroup, this.enemyCollisionGroup,
                this.worldCollisionGroup, this.bulletCollisionGroup]);
            enemyBody.fixedRotation = true;
        });

        const inventorySystem = new InventorySystem(this.game.width / 2, 0, 32, 32, 20, 20);

        const basicGun1 = new BasicGun(this.game, inventorySystem, 600, 300);
        const basicGun2 = new BasicGun(this.game, inventorySystem, 700, 300);

        inventorySystem.place(basicGun1);
        inventorySystem.place(basicGun2);
    }

    public update(): void {
        this.updateShmup();
        this.engineering.update();
    }

    private updateShmup(): void {
        // generate enemies
        if (this.game.time.now >= this.enemyCreateTime) {
            this.enemyCreateTime = this.game.time.now + this.enemyCreateCoolDwn;
            this.enemy = this.groupEnemies.getFirstExists(false);
            if (this.enemy) {
                this.enemyBody = this.enemy.body;
                const minX: number = this.enemy.width;
                const maxX: number = this.shmupBounds.width - this.borderSprite.width / 2 - this.enemy.width;
                const minY: number = this.enemy.height;
                const maxY: number = this.shmupBounds.halfHeight;
                this.enemy.reset(this.game.rnd.integerInRange(minX, maxX), this.game.rnd.integerInRange(minY, maxY));
            }
        }
    }

    private bulletHitEnemy(bullet: Phaser.Physics.P2.Body, enemy: Phaser.Physics.P2.Body): void {
        bullet.sprite.kill();
        enemy.sprite.kill();
    }

}
