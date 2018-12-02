export default class Startup extends Phaser.State {
    public create(): void {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        this.game.physics.p2.setImpactEvents(true);
        this.game.physics.p2.restitution = 0.8;

        // Disable Multitouch
        this.input.maxPointers = 1;

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        // preload font
        this.game.add.text(0, 0, " ", {font: "1px pixelsix", fill: "#FFFFFF"});

        this.game.canvas.oncontextmenu = (e) => e.preventDefault();

        this.state.start("splash");
    }
}
