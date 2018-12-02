const PLAYER_SPEED: number = 400; // EVAN wanted this faster
const PLAYER_SCALE: number = 2;

const BULLET_SPEED: number = 700;
const MAX_HEALTH: number = 1;

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
    private shotCooldown: number = 200; // computer time, not frames
    private fireTime: number = 0;

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
            if (this.alive) {
                this.shoot();
            }
        }
    }

    private shoot(): void {
        if (this.game.time.now >= this.fireTime) {
            this.fireTime = this.game.time.now + this.shotCooldown;
            const bullet = this.bulletsGroup.getFirstExists(false);
            if (bullet) {
                const bulletBody: Phaser.Physics.P2.Body = bullet.body;
                bullet.reset(this.x, this.y - 20);
                bulletBody.velocity.y = -BULLET_SPEED;
            }
        }
    }
}
