import { ShipUpdateMessage } from "../engineering/engineering";

const PLAYER_SPEED: number = 50;
const PLAYER_SCALE: number = 2;

const BULLET_SPEED: number = 700;

export default class Player extends Phaser.Sprite {
    public playerBody: Phaser.Physics.P2.Body;
    private bulletsGroup: Phaser.Group;

    private docking: boolean;
    private dockingTarget: number;

    // input keys
    private keyUp: Phaser.Key;
    private keyDown: Phaser.Key;
    private keyLeft: Phaser.Key;
    private keyRight: Phaser.Key;
    private keyShoot: Phaser.Key;

    // game variables
    private shotCooldown: number = 12; // using frames
    private fireTime: number = 0;

    // from engineering
    private speedForce: number = 0;
    private gunCount: number = 0;

    public constructor(game: Phaser.Game, x: number, y: number, key: string) {
        super(game, x, y, key);
        game.physics.p2.enable(this);
        this.playerBody = this.body;

        this.docking = false;
        this.dockingTarget = 0;

        this.playerBody.fixedRotation = true; // forbid rotation

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

    public dock(target: number): void {
        this.docking = true;
        this.dockingTarget = target;
    }

    public undock(): void {
        this.docking = false;
    }

    public getUpdateMessage(updateMessage: ShipUpdateMessage): void {
        const { topSpeed, weight, guns } = updateMessage;
        const force = 2 * (6 + topSpeed) - weight / 2;
        this.speedForce = PLAYER_SPEED + Math.max(0, 20 * force);
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
        if (this.docking) {
            if (Math.abs(this.x - this.dockingTarget) > 1) {
                this.playerBody.velocity.x = -(this.x - this.dockingTarget) * 5;
            } else {
                this.playerBody.velocity.x *= 0.5;
            }
            if (this.y > 200) {
                this.playerBody.velocity.y = 200;
            }
            return;
        }
        // reset player velocity and orientation
        this.playerBody.velocity.x = 0;
        this.playerBody.velocity.y = 0;
        this.playerBody.rotation = 0;

        // controls
        if (this.keyUp.isDown) {
            this.playerBody.velocity.y = -this.speedForce;
        }
        if (this.keyDown.isDown) {
            this.playerBody.velocity.y = this.speedForce;
        }
        if (this.keyLeft.isDown) {
            this.playerBody.velocity.x = -this.speedForce;
        }
        if (this.keyRight.isDown) {
            this.playerBody.velocity.x = this.speedForce;
        }
        if (this.keyShoot.isDown) {
            if (this.alive) {
                this.shoot();
            }
        }

        this.fireTime--;
    }

    private shoot(): void {
        if (this.fireTime > 0) {
            return;
        }
        this.fireTime = this.shotCooldown;
        const width = 5;
        const start = this.x - width * this.gunCount / 2 + width / 2;
        for (let i: number = 0; i < this.gunCount; i++) {
            const bullet = this.bulletsGroup.getFirstExists(false);
            if (bullet) {
                const bulletBody: Phaser.Physics.P2.Body = bullet.body;
                bullet.reset(start + i * width, this.y - 20);
                bulletBody.velocity.y = -BULLET_SPEED;
                this.game.sound.play("blaster", 0.1);
            }
        }
    }
}
