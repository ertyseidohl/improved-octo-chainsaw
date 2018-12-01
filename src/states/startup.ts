export default class Startup extends Phaser.State {
    private cursors: Phaser.CursorKeys;
    private mario: Phaser.Sprite;

    public preload(): void {
        this.game.load.image("mario", "../assets/mario.png");
    }

    public create(): void {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // Disable Multitouch
        this.input.maxPointers = 1;

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        // tslint:disable-next-line
        console.log("startup create");

        this.mario = this.game.add.sprite(200, 200, "mario");

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.game.physics.p2.enable(this.mario);
    }

    public update(): void {
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
}
