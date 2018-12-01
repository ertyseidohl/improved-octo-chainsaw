import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";
import BaseEnemy from "../enemies/base_enemy";
import Engineering from "../engineering/engineering";

// constants
const PLAYER_SPEED: number = 300;
const PLAYER_SCALE: number = 2;
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SPEED: number = 700;
const BULLET_SCALE: number = 1;
const ENEMY_COUNT = 30;

export default class Startup extends Phaser.State {
    // game objects
    private player: Phaser.Sprite;
    private enemy: Phaser.Sprite;
    private bullet: Phaser.Sprite;
    private playerBody: Phaser.Physics.P2.Body; // adding playerBody to make variables more accesible
    private enemyBody: Phaser.Physics.P2.Body; // same deal for enemy and all others
    private bulletBody: Phaser.Physics.P2.Body;
    private playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private enemyCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private worldCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    // game variables
    private shootCoolDwn: number = 200; // computer time, not frames
    private fireTime: number = 0;
    private enemyCreateCoolDwn = 1000;
    private enemyCreateTime = 0;

    // groups
    private groupEnemies: Phaser.Group;
    private groupBullets: Phaser.Group;

    // input keys
    private keyUp: Phaser.Key;
    private keyDown: Phaser.Key;
    private keyLeft: Phaser.Key;
    private keyRight: Phaser.Key;
    private keyShoot: Phaser.Key;

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
        // input
        this.keyUp = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.keyDown = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.keyLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyRight = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.keyShoot = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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
        this.player = this.game.add.sprite(200, 200, "player");
        this.player.scale.setTo(PLAYER_SCALE, PLAYER_SCALE);
        this.game.physics.p2.enable(this.player);

        // make body variable after physic enabled
        this.playerBody = this.player.body;
        this.playerBody.fixedRotation = true; // forbid rotation

        // groups

        // assign collision groups
        this.playerBody.setCollisionGroup(this.playerCollisionGroup);
        this.playerBody.collides(this.worldCollisionGroup);
        this.playerBody.collides(this.enemyCollisionGroup);

        // This part is vital if you want the objects
        // with their own collision groups to still collide with the world bounds
        // (which we do) - what this does is adjust the bounds to use its own collision group.
        this.game.physics.p2.updateBoundsCollisionGroup();

        // bullets
        this.groupBullets = this.game.add.group();
        this.groupBullets.createMultiple(30, "bullet");
        this.game.physics.p2.enable(this.groupBullets, true);
        this.groupBullets.setAll("outOfBoundsKill", true);
        this.groupBullets.setAll("checkWorldBounds", true);
        this.groupBullets.setAll("body.collideWorldBounds", false);
        this.groupBullets.setAll("scale.x", BULLET_SCALE);
        this.groupBullets.setAll("scale.y", BULLET_SCALE);
        this.groupBullets.forEach((bullet: Phaser.Sprite) => {
            const bulletBody: Phaser.Physics.P2.Body = bullet.body;
            bulletBody.setCollisionGroup(this.bulletCollisionGroup);
            bulletBody.collides(this.enemyCollisionGroup, this.bulletHitEnemy, this);
        });

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
        this.updatePlayer();
        this.updateEnemy();
    }

    private updatePlayer(): void {
        // reset player velocity and orientation
        this.playerBody.velocity.x = 0;
        this.playerBody.velocity.y = 0;
        this.playerBody.rotation = 0;

        // controls
        if (this.keyUp.isDown) {
            this.playerBody.velocity.y = -PLAYER_SPEED;
        }
        if (this.keyDown.isDown) {
            this.playerBody.velocity.y = PLAYER_SPEED;
        }
        if (this.keyLeft.isDown) {
            this.playerBody.velocity.x = -PLAYER_SPEED;
        }
        if (this.keyRight.isDown) {
            this.playerBody.velocity.x = PLAYER_SPEED;
        }
        if (this.keyShoot.isDown) {
            this.playerShoot();
        }
    }

    private updateEnemy(): void {
        // not implemented
    }

    private playerShoot(): void {
        if (this.game.time.now >= this.fireTime) {
            this.fireTime = this.game.time.now + this.shootCoolDwn;
            this.bullet = this.groupBullets.getFirstExists(false);
            if (this.bullet) {
                this.bulletBody = this.bullet.body;
                this.bullet.reset(this.player.x, this.player.y - 20);
                this.bulletBody.velocity.y = -BULLET_SPEED;
            }
        }
    }

    private bulletHitEnemy(bullet: Phaser.Physics.P2.Body, enemy: Phaser.Physics.P2.Body): void {
        bullet.sprite.kill();
        enemy.sprite.kill();
    }

}
