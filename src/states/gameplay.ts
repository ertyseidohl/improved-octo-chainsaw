export default class Startup extends Phaser.State {
    private cursors: Phaser.CursorKeys;
    private mario: Phaser.Sprite;

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

    private shmupSprite: Phaser.Sprite;
    private engineeringSprite: Phaser.Sprite;

    private shmupCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private engineeringCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    public preload(): void {
        this.game.load.image("mario", "../assets/mario.png");
        this.game.load.image("shmup_bg", "../assets/shmup_bg.png");
        this.game.load.image("engineering_bg", "../assets/engineering_bg.png");
    }

    public create(): void {
        this.game.physics.p2.setImpactEvents(true);
        this.game.physics.p2.restitution = 0.8;

        this.shmupBounds = new Phaser.Rectangle(0, 0, this.game.width / 2, this.game.height);
        this.engineeringBounds = new Phaser.Rectangle(this.game.width / 2, 0, this.game.width / 2, this.game.height);

        this.shmupCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.engineeringCollisionGroup = this.game.physics.p2.createCollisionGroup();

        // this.shmupSprite = this.game.add.sprite(0, 0, "shmup_bg");
        // this.game.physics.p2.enable(this.shmupSprite);
        // this.shmupSprite.body.static = true;
        // this.shmupSprite.anchor = new Phaser.Point(0, 0);
        // this.shmupSprite.body.setCollisionGroup(this.engineeringCollisionGroup);

        this.engineeringSprite = this.game.add.sprite(this.game.width * 0.75, this.game.height / 2, "engineering_bg");
        this.game.physics.p2.enable(this.engineeringSprite, true);
        const engineeringSpriteBody: Phaser.Physics.P2.Body = this.engineeringSprite.body;
        engineeringSpriteBody.static = true;

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
