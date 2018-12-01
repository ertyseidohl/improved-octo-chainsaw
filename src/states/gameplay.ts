export default class Startup extends Phaser.State {
    private cursors: Phaser.CursorKeys;
    private mario: Phaser.Sprite;

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

    private borderSprite: Phaser.Sprite;

    private shmupCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private engineeringCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    public preload(): void {
        this.game.load.image("mario", "../assets/mario.png");
        this.game.load.image("border", "../assets/border.png");
    }

    public create(): void {

        this.shmupBounds = new Phaser.Rectangle(0, 0, this.game.width / 2, this.game.height);
        this.engineeringBounds = new Phaser.Rectangle(this.game.width / 2, 0, this.game.width / 2, this.game.height);

        this.shmupCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.engineeringCollisionGroup = this.game.physics.p2.createCollisionGroup();

        this.borderSprite = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "border");
        this.game.physics.p2.enable(this.borderSprite, true);
        const borderSpriteBody: Phaser.Physics.P2.Body = this.borderSprite.body;
        borderSpriteBody.static = true;

        this.mario = this.game.add.sprite(200, 200, "mario");
        this.mario.scale = new Phaser.Point(0.2, 0.2);
        this.game.physics.p2.enable(this.mario, true);
        const marioBody: Phaser.Physics.P2.Body = this.mario.body;

        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    public update(): void {
        this.updateShmup();
        this.updateEngineering();
    }

    private updateShmup(): void {
        if (this.cursors.left.isDown) {
            this.mario.body.rotateLeft(100);
        } else if (this.cursors.right.isDown) {
            this.mario.body.rotateRight(100);
        } else {
            this.mario.body.setZeroRotation();
        }
        if (this.cursors.up.isDown) {
            this.mario.body.thrust(400);
        } else if (this.cursors.down.isDown) {
            this.mario.body.reverse(400);
        }
    }

    private updateEngineering(): void {
        // todo
    }
}
