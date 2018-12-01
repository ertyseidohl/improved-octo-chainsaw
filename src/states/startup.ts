export default class Boot extends Phaser.State {
    public preload(): void {
        this.game.load.image("mario", "../assets/mario.png");
    }

    public create(): void {
        // Disable Multitouch
        this.input.maxPointers = 1;

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        // tslint:disable-next-line
        console.log("startup create");

        this.game.add.sprite(200, 200, "mario");

    }
}
