import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";

// constants
const PLAYER_SPEED: number = 300;
const PLAYER_SCALE: number = 2;
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;
const BULLET_SPEED: number = 500;
const BULLET_SCALE: number = 1;

const NUM_TILE_SPRITES = 9;
const ENGINEERING_TILES_WIDTH = 10;
const ENGINEERING_TILES_HEIGHT = 10;

export default class Startup extends Phaser.State {
    // game objects
    private player: Phaser.Sprite;
    private enemy: Phaser.Sprite;
    private bullet: Phaser.Sprite;
    private playerBody: Phaser.Physics.P2.Body; // adding playerBody to make variables more accesible
    private enemyBody: Phaser.Physics.P2.Body; // same deal for enemy and all others
    private bulletBody: Phaser.Physics.P2.Body;
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

    private borderSprite: Phaser.Sprite;

    public preload(): void {
        this.game.load.image("player", "../assets/star.png");
        this.game.load.image("enemy", "../assets/diamond.png");
        this.game.load.image("border", "../assets/border.png");
        this.game.load.image("bullet", "../assets/star.png");

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

        // sprites and physics
        this.player = this.game.add.sprite(200, 200, "player");
        this.player.scale.setTo(PLAYER_SCALE, PLAYER_SCALE);
        this.enemy = this.game.add.sprite(100, 100, "enemy");
        this.player.scale.setTo(ENEMY_SCALE, ENEMY_SCALE);
        this.game.physics.p2.enable(this.player, true);
        this.game.physics.p2.enable(this.enemy, true);

        // make body variable after physic enabled
        this.playerBody = this.player.body;
        this.enemyBody = this.player.body;
        // this.bulletBody = this.bullet.body;

        // groups
        this.groupBullets = this.game.add.group();
        this.groupBullets.createMultiple(30, "bullet");
        this.game.physics.p2.enable(this.groupBullets, true);
        this.groupBullets.setAll("outOfBoundsKill", true);
        this.groupBullets.setAll("checkWorldBounds", true);
        this.groupBullets.setAll("body.collideWorldBounds", false);
        this.groupBullets.setAll("scale.x", BULLET_SCALE);
        this.groupBullets.setAll("scale.y", BULLET_SCALE);
    }

    public update(): void {
        this.updateShmup();
        this.updateEngineering();
    }

    private updateShmup(): void {
        this.updatePlayer();
        this.updateEnemy();
    }

    private updatePlayer(): void {
        // reset player physics each update. Gives us a solid responsive player
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
        if (this.keyShoot.justDown) {
            this.playerShoot();
        }
    }

    private updateEnemy(): void {
        // not implemented
    }

    private playerShoot(): void {
        this.bullet = this.groupBullets.getFirstExists(false);
        if (this.bullet) {
            this.bulletBody = this.bullet.body;
            this.bullet.reset(this.player.x, this.player.y - 20);
            this.bulletBody.velocity.y = -BULLET_SPEED;
        }
    }

    private updateEngineering(): void {
        // todo
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }
}
