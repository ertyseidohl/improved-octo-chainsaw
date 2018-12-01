import { Game } from "phaser-ce";
import { PhaserTextStyle } from "phaser-ce";

// player constants
const PLAYER_SPEED: number = 300;
const PLAYER_SCALE: number = 2;
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;

const NUM_TILE_SPRITES = 9;
const ENGINEERING_TILES_WIDTH = 8;
const ENGINEERING_TILES_HEIGHT = 8;

export default class Startup extends Phaser.State {
    // game objects
    private player: Phaser.Sprite;
    private enemy: Phaser.Sprite;
    private playerBody: Phaser.Physics.P2.Body; // adding playerBody to make variables more accesible
    private enemyBody: Phaser.Physics.P2.Body; // same deal for enemy

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
        this.game.physics.p2.enable(this.player);
        this.game.physics.p2.enable(this.enemy, true);

        // make body variable after physic enabled
        this.playerBody = this.player.body;
        this.enemyBody = this.player.body;

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
        this.updatePlayer();
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
            // shoot not implemented
        }
    }

    private updateEnemy(): void {
        // not implemented
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
