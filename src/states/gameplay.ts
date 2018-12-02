import BaseEnemy from "../enemies/base_enemy";

import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";
import { BasicGun } from "../engineering/inventory/basic_gun";
import { InventorySystem } from "../engineering/inventory/system";

import Engineering from "../engineering/engineering";
import Player from "../player/player";

// constants
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SCALE: number = 1;
const ENEMY_COUNT = 10;
const ENEMY_SPAWN_TIME = 2000;
const ENEMY_Y_SPAWN = -50;
const EXPLOSION_X_OFFSET = -20;
const EXPLOSTION_Y_OFFSET = 0;

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
    private backgrounds: Phaser.TileSprite[] = [];
    private background: Phaser.Sprite;
    private playerDeathQueue: Phaser.Sprite[] = [];

    // Enemy vars
    private enemyCreateCoolDwn = ENEMY_SPAWN_TIME;
    private enemyCreateTime = 0;

    // groups
    private groupEnemies: Phaser.Group;
    private groupExplosions: Phaser.Group;
    private groupExplosionsSmall: Phaser.Group;
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
        this.game.load.image("powerup", "../assets/dude.png");

        this.game.load.spritesheet("prince", "../assets/prince.png", 128, 128, 4);
        this.game.load.spritesheet("explosion", "../assets/explosion.png", 64, 64, 6);
        this.game.load.spritesheet("explosion_small", "../assets/explosion_small.png", 32, 32, 4);
        this.game.load.image("background", "../assets/background.png");
        this.game.load.image("stars_1", "../assets/stars_1.png");
        this.game.load.image("stars_2", "../assets/stars_2.png");
        this.game.load.image("stars_3", "../assets/stars_3.png");
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

        // background
        this.background = this.game.add.sprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            "background",
        );

        this.backgrounds.push(this.game.add.tileSprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            this.shmupBounds.width,
            this.shmupBounds.height,
            "stars_1",
        ));

        this.backgrounds.push(this.game.add.tileSprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            this.shmupBounds.width,
            this.shmupBounds.height,
            "stars_2",
        ));

        this.backgrounds.push(this.game.add.tileSprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            this.shmupBounds.width,
            this.shmupBounds.height,
            "stars_3",
        ));

        // prince test
        const prince: Phaser.Sprite = this.game.add.sprite(100, 100, "prince");
        prince.animations.add("glow");
        prince.animations.getAnimation("glow").play(3, true);

        // setup engineering
        this.engineering.create();

        // sprites and physics
        this.player = new Player(this.game, this.game.width / 4, this.game.height - 50, "player");
        this.game.add.existing(this.player);

        this.groupPowerups = this.game.add.group();
        this.groupPowerups.createMultiple(30, "powerup");
        // groups

        // assign collision groups
        this.player.body.setCollisionGroup(this.playerCollisionGroup);
        this.player.body.collides(this.worldCollisionGroup);
        this.player.body.collides(this.enemyCollisionGroup);
        this.player.body.collides(this.bulletCollisionGroup);

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

        this.groupExplosions = this.game.add.group();
        this.groupExplosions.createMultiple(30, "explosion");
        this.groupExplosions.forEach((explosion: Phaser.Sprite) => explosion.animations.add("explode"));

        this.groupExplosionsSmall = this.game.add.group();
        this.groupExplosionsSmall.createMultiple(10, "explosion_small");
        this.groupExplosionsSmall.forEach((explosion: Phaser.Sprite) => explosion.animations.add("explode"));
    }

    public update(): void {
        this.updateShmup();
        for (let i: number = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].tilePosition.y += (i + 1);
        }
        this.engineering.update();

        if (this.playerDeathQueue.length && Math.random() < 0.2) {
            const playerDeathExplosion: Phaser.Sprite = this.playerDeathQueue.pop();
            playerDeathExplosion.visible = true;
            playerDeathExplosion.animations.getAnimation("explode").play(30, false, true);
        }
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
        const explosion: Phaser.Sprite = this.groupExplosionsSmall.getFirstExists(false);
        if (explosion) {
            explosion.reset(bullet.x, bullet.y);
            explosion.play("explode", 30, false, true);
        }

        if (bullet.sprite.alive) {
            enemy.sprite.damage(1);
        }

        if (enemy.sprite.health <= 0) {
            const deathExplosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
            if (deathExplosion) {
                deathExplosion.reset(enemy.x, enemy.y);
                deathExplosion.play("explode", 30, false, true);
            }
        }

        bullet.sprite.kill();
    }

    private bulletHitPlayer(bullet: Phaser.Physics.P2.Body, player: Phaser.Physics.P2.Body): void {
        const explosion: Phaser.Sprite = this.groupExplosionsSmall.getFirstExists(false);
        if (explosion) {
            explosion.reset(bullet.x, bullet.y);
            explosion.play("explode", 30, false, true);
        }

        player.sprite.damage(1);

        if (player.sprite.health <= 0) {
            this.playerIsDead(this.player);
        }

        bullet.sprite.kill();
    }

    private playerIsDead(player: Phaser.Sprite): void {
        for (let i: number = 0; i < 30; i++) {
            const deathExplosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
            if (deathExplosion) {
                deathExplosion.reset(
                    player.x + ((Math.random() * 200) - 100),
                    player.y + ((Math.random() * 200) - 100),
                );
                deathExplosion.visible = false;
                this.playerDeathQueue.push(deathExplosion);
            }
        }
    }

    private powerUpHitPlayer(): void {
        // not implemented
    }

}
