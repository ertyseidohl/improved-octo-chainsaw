import { Game } from "phaser-ce";

// player constants
const PLAYER_SPEED: number = 300;
const PLAYER_SCALE: number = 2;
const ENEMY_SPEED: number = 100;
const ENEMY_SCALE: number = 1.5;

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

    private borderSprite: Phaser.Sprite;

    private shmupCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private engineeringCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    public preload(): void {
        this.game.load.image("player", "../assets/star.png");
        this.game.load.image("enemy", "../assets/diamond.png");
        this.game.load.image("border", "../assets/border.png");
    }

    public create(): void {
        // input
        this.keyUp = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.keyDown = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.keyLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyRight = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.keyShoot = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // play area bounds
        this.shmupBounds = new Phaser.Rectangle(0, 0, this.game.width / 2, this.game.height);
        this.engineeringBounds = new Phaser.Rectangle(this.game.width / 2, 0, this.game.width / 2, this.game.height);

        this.shmupCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.engineeringCollisionGroup = this.game.physics.p2.createCollisionGroup();

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
        // todo
    }
}
