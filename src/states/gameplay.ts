import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";
import BaseEnemy from "../enemies/base_enemy";
import Player from "../player/player";

// constants
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SCALE: number = 1;
const ENEMY_COUNT = 30;

const NUM_TILE_SPRITES = 9;
const ENGINEERING_TILES_WIDTH = 8;
const ENGINEERING_TILES_HEIGHT = 8;

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
