import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";
import BaseEnemy from "../enemies/base_enemy";
import Engineering from "../engineering/engineering";
import Player from "../player/player";

// constants
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SCALE: number = 1;
const ENEMY_COUNT = 10;
const ENEMY_SPAWN_TIME = 2000;
const ENEMY_Y_SPAWN = -50;
const EXPLOSION_X_OFFSET = -70;
const EXPLOSTION_Y_OFFSET = -100;

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
    private powerupCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    // Enemy vars
    private enemyCreateCoolDwn = ENEMY_SPAWN_TIME;
    private enemyCreateTime = 0;

    // groups
    private groupEnemies: Phaser.Group;
    private groupExplosions: Phaser.Group;
    private groupPowerups: Phaser.Group;

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

    private liveComponents: Phaser.Group;

    private borderSprite: Phaser.Sprite;

    // engineering section
    private engineering = new Engineering(this);

    public preload(): void {
        this.game.load.image("player", "../assets/ship.png");
        this.game.load.image("enemy", "../assets/enemy_1.png");
        this.game.load.image("border", "../assets/border.png");
        this.game.load.image("bullet", "../assets/laser.png");
        this.game.load.image("enemyBullet", "../assets/enemy-bullet.png");
        this.game.load.spritesheet("kaboom", "../assets/explode.png", 128, 128);
        this.game.load.image("powerup", "../assets/firstaid.png");

        this.engineering.preload();
    }

    public create(): void {
        const { width, height } = this.game;

        // collision groups
        this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.bulletCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.worldCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.powerupCollisionGroup = this.game.physics.p2.createCollisionGroup();

        // This part is vital if you want the objects
        // with their own collision groups to still collide with the world bounds
        // (which we do) - what this does is adjust the bounds to use its own collision group.
        this.game.physics.p2.updateBoundsCollisionGroup();

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
        this.player = new Player(this.game, this.game.width / 4, this.game.height - 50, "player");
        this.game.add.existing(this.player);

        this.groupExplosions = this.game.add.group();
        this.groupExplosions.createMultiple(30, "kaboom");
        this.groupExplosions.forEach(this.setupEnemy, this);

        this.groupPowerups = this.game.add.group();
        this.groupPowerups.createMultiple(30, "powerup");
        // groups

        // assign collision groups
        this.player.body.setCollisionGroup(this.playerCollisionGroup);
        this.player.body.collides(this.worldCollisionGroup);
        this.player.body.collides(this.enemyCollisionGroup);

        this.player.setBulletsCollisionGroup(this.bulletCollisionGroup);
        this.player.setBulletsCollides(this.enemyCollisionGroup, this.bulletHitEnemy, this);

        // enemies
        this.groupEnemies = this.game.add.group();
        for (let i: number = 0; i < ENEMY_COUNT; i++) {
            const newEnemy: BaseEnemy = new BaseEnemy(this.game, Math.random(), 0, "enemy");
            newEnemy.setBulletsCollisionGroup(this.bulletCollisionGroup);
            newEnemy.setBulletsCollides(this.playerCollisionGroup, this.bulletHitPlayer, this);
            this.groupEnemies.add(newEnemy);
            newEnemy.kill();
        }
        this.game.physics.p2.enable(this.groupEnemies);
        this.groupEnemies.setAll("body.collideWorldBounds", false);
        this.groupEnemies.forEach((enemy: Phaser.Sprite) => {
            const enemyBody: Phaser.Physics.P2.Body = enemy.body;
            enemyBody.setCollisionGroup(this.enemyCollisionGroup);
            enemyBody.collides([this.playerCollisionGroup, this.bulletCollisionGroup]);
            enemyBody.fixedRotation = true;
        });

        // powerups

    }

    public update(): void {
        this.updateShmup();
        this.engineering.update();
    }

    private updateShmup(): void {
        // generate enemies
        if (this.game.time.now >= this.enemyCreateTime) {
            this.enemyCreateTime = this.game.time.now + this.enemyCreateCoolDwn;
            const rndEnemySpawn: number = this.game.rnd.integerInRange(1, 5);
            for (let i: number = 0; i < rndEnemySpawn; i++) {
                const currEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
                if (currEnemy) {
                    currEnemy.randomizeTimes();
                    const currEnemyBody = currEnemy.body;
                    const minX: number = currEnemy.width;
                    const maxX: number = this.shmupBounds.width - this.borderSprite.width / 2 - currEnemy.width;
                    currEnemy.reset(this.game.rnd.integerInRange(minX, maxX), ENEMY_Y_SPAWN, currEnemy.maxHealth);
                }
            }
        }
    }

    private bulletHitEnemy(bullet: Phaser.Physics.P2.Body, enemy: Phaser.Physics.P2.Body): void {
        const explosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
        explosion.reset(enemy.x + EXPLOSION_X_OFFSET, enemy.y + EXPLOSTION_Y_OFFSET);
        explosion.play("kaboom", 30, false, true);

        if (bullet.sprite.alive) {
            console.log("Enemy Health before: ", enemy.sprite.health);
            enemy.sprite.damage(1);
            console.log("Enemy Health after: ", enemy.sprite.health);
            console.log(enemy.sprite.width);
        }
        bullet.sprite.kill();
        // if (enemy.sprite.health)
        // enemy.sprite.kill();
    }

    private bulletHitPlayer(bullet: Phaser.Physics.P2.Body, player: Phaser.Physics.P2.Body): void {
        bullet.sprite.kill();
        player.sprite.kill();
    }

    private powerUpHitPlayer(): void {
        // not implemented
    }

    private setupEnemy(enemy: BaseEnemy): void {
        enemy.animations.add("kaboom");
    }

}
