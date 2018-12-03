import { ShipUpdateMessage } from "../engineering/engineering";

const PLAYER_SPEED: number = 200; // EVAN wanted this faster
const PLAYER_SCALE: number = 2;

const BULLET_SPEED: number = 700;
const MAX_HEALTH: number = 4;

export default class Player extends Phaser.Sprite {
    public playerBody: Phaser.Physics.P2.Body;
    private bulletsGroup: Phaser.Group;

    // input keys
    private keyUp: Phaser.Key;
    private keyDown: Phaser.Key;
    private keyLeft: Phaser.Key;
    private keyRight: Phaser.Key;
    private keyShoot: Phaser.Key;

    // game variables
    private shotCooldown: number = 12; // using frames
    private fireTime: number = 0;
    private healthIcons: Phaser.Sprite[] = [];

    // from engineering
    private speedModifier: number = 0;
    private gunCount: number = 0;

    public constructor(game: Phaser.Game, x: number, y: number, key: string) {
        super(game, x, y, key);
        game.physics.p2.enable(this);
        this.playerBody = this.body;

        this.playerBody.fixedRotation = true; // forbid rotation

        this.maxHealth = MAX_HEALTH;
        this.health = this.maxHealth;

        // input
        this.keyUp = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.keyDown = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.keyLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.keyRight = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.keyShoot = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // bullets
        this.bulletsGroup = this.game.add.group();
        this.bulletsGroup.createMultiple(30, "bullet");
        this.game.physics.p2.enable(this.bulletsGroup);
        this.bulletsGroup.setAll("outOfBoundsKill", true);
        this.bulletsGroup.setAll("checkWorldBounds", true);
        this.bulletsGroup.setAll("body.collideWorldBounds", false);
        this.bulletsGroup.setAll("body.fixedRotation", true);

        for (let i = 0; i < MAX_HEALTH; i++) {
            this.healthIcons[i] =
            this.game.add.sprite(this.game.width / 2 + 5, this.game.height - 7 * i - 30, "health");
        }
    }

    public getUpdateMessage(updateMessage: ShipUpdateMessage): void {
        this.speedModifier = updateMessage.topSpeed;
        this.gunCount = updateMessage.guns;
    }

    public setBulletsCollisionGroup(bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup): void {
        this.bulletsGroup.forEach((bullet: Phaser.Sprite) => bullet.body.setCollisionGroup(bulletCollisionGroup));
    }

    public setBulletsCollides(
        otherCollisionGroup: Phaser.Physics.P2.CollisionGroup,
        callback: (bullet: Phaser.Physics.P2.Body, enemy: Phaser.Physics.P2.Body) => void,
        bindTo: any,
    ): void {
        this.bulletsGroup.forEach(
            (bullet: Phaser.Sprite) => bullet.body.collides(otherCollisionGroup, callback, bindTo),
        );
    }

    public getBody(): Phaser.Physics.P2.Body {
        return this.playerBody;
    }

    public update(): void {
        // reset player velocity and orientation
        this.playerBody.velocity.x = 0;
        this.playerBody.velocity.y = 0;
        this.playerBody.rotation = 0;

        // controls
        if (this.keyUp.isDown) {
            this.playerBody.velocity.y = -PLAYER_SPEED * this.speedModifier;
        }
        if (this.keyDown.isDown) {
            this.playerBody.velocity.y = PLAYER_SPEED * this.speedModifier;
        }
        if (this.keyLeft.isDown) {
            this.playerBody.velocity.x = -PLAYER_SPEED * this.speedModifier;
        }
        if (this.keyRight.isDown) {
            this.playerBody.velocity.x = PLAYER_SPEED * this.speedModifier;
        }
        if (this.keyShoot.isDown) {
            if (this.alive) {
                this.shoot();
            }
        }

        this.fireTime--;

        for (let i = 0; i < MAX_HEALTH; i++) {
            if (this.health > i) {
                this.healthIcons[i].alive = true;
            } else {
                this.healthIcons[i].kill();
            }
        }
    }

    private shoot(): void {
        if (this.fireTime > 0) {
            return;
        }
        this.fireTime = this.shotCooldown;
        for (let i: number = 0; i < this.gunCount; i++) {
            const bullet = this.bulletsGroup.getFirstExists(false);
            if (bullet) {
                const bulletBody: Phaser.Physics.P2.Body = bullet.body;
                bullet.reset(this.x + i * 5, this.y - 20);
                bulletBody.velocity.y = -BULLET_SPEED;
                this.game.sound.play("blaster");
            }
        }
    }
}
