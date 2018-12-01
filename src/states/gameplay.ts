import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";
import BaseEnemy from "../enemies/base_enemy";

// constants
const PLAYER_SPEED: number = 300;
const PLAYER_SCALE: number = 2;
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SPEED: number = 700;
const BULLET_SCALE: number = 1;
const ENEMY_COUNT = 30;

const NUM_TILE_SPRITES = 9;
const ENGINEERING_TILES_WIDTH = 8;
const ENGINEERING_TILES_HEIGHT = 8;

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

    private engineeringTiles: Phaser.Group;
    private liveComponents: Phaser.Group;

    private borderSprite: Phaser.Sprite;

    // "shake" for live components
    private liveComponentShake: Phaser.Point = new Phaser.Point(0, 0);

    public preload(): void {
        this.game.load.image("player", "../assets/ship.png");
        this.game.load.image("enemy", "../assets/diamond.png");
        this.game.load.image("border", "../assets/border.png");
        this.game.load.image("bullet", "../assets/star.png");

        this.game.load.image("engine_1_dead", "../assets/engine_1_dead.png");
        this.game.load.image("engine_1_live", "../assets/engine_1_live.png");

        this.game.load.spritesheet("gun_1", "../assets/gun_1.png", 32, 32 * 3, 5);

        this.game.load.spritesheet("energy_cell", "../assets/energy_cell.png", 35, 35, 5);

        for (let i: number = 1; i <= NUM_TILE_SPRITES; i++) {
            this.game.load.image(`floor_tile_${i}`, `../assets/floor_tile_${i}.png`);
        }
    }

    public create(): void {
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

        // engineering stuff
        this.engineeringTiles = this.game.add.group();
        const engineeringFloorStartX = this.game.width / 2 + 50;
        const engineeringFloorStartY = 100;

        for (let i: number = 0; i < ENGINEERING_TILES_WIDTH; i++) {
            for (let j: number = 0; j < ENGINEERING_TILES_HEIGHT; j++) {
                this.engineeringTiles.create(
                    engineeringFloorStartX + (32 * i),
                    engineeringFloorStartY + (32 * j),
                    this.getTileSprite(),
                );
            }
        }

        // play area bounds
        this.shmupBounds = new Phaser.Rectangle(0, 0, this.game.width / 2, this.game.height);
        this.engineeringBounds = new Phaser.Rectangle(this.game.width / 2, 0, this.game.width / 2, this.game.height);

        this.borderSprite = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "border");
        this.game.physics.p2.enable(this.borderSprite, true);
        const borderSpriteBody: Phaser.Physics.P2.Body = this.borderSprite.body;
        borderSpriteBody.static = true;
        borderSpriteBody.setCollisionGroup(this.worldCollisionGroup);
        borderSpriteBody.collides([this.playerCollisionGroup, this.enemyCollisionGroup, this.bulletCollisionGroup]);

        // sprites and physics
        this.player = this.game.add.sprite(200, 200, "player");
        this.player.scale.setTo(PLAYER_SCALE, PLAYER_SCALE);
        this.player.scale.setTo(ENEMY_SCALE, ENEMY_SCALE);
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

        // Component Testing
        this.game.add.sprite(
            engineeringFloorStartX,
            engineeringFloorStartY + (6 * 32),
            "engine_1_dead",
        );

        const energyCell: Phaser.Sprite = this.game.add.sprite(
            engineeringFloorStartX + 128,
            engineeringFloorStartY + 128,
            "energy_cell",
        );

        energyCell.x -= 0;
        energyCell.y -= 4;

        const energyCellAnimation: Phaser.Animation = energyCell.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(20, true);

        this.liveComponents = this.game.add.group();

        this.liveComponents.add(this.game.add.sprite(
            engineeringFloorStartX + 32,
            engineeringFloorStartY + (6 * 32),
            "engine_1_live",
        ));

        const gunOne: Phaser.Sprite = this.game.add.sprite(
            engineeringFloorStartX + 64,
            engineeringFloorStartY,
            "gun_1",
        );

        const gunFireAnimation: Phaser.Animation = gunOne.animations.add("fire");
        gunFireAnimation.play(20, true);
    }

    public update(): void {
        this.updateShmup();
        this.updateEngineering();
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

    private updateEngineering(): void {
        this.liveComponentShake.x = Math.floor(Math.random() * 3) - 1;
        this.liveComponents.x = this.liveComponentShake.x;
        this.liveComponents.y = this.liveComponentShake.y;
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }
}
