export default class Startup extends Phaser.State {
    public create(): void {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        this.game.physics.p2.setImpactEvents(true);
        this.game.physics.p2.restitution = 0.8;

        // Disable Multitouch
        this.input.maxPointers = 1;

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        this.state.start("splash");
    }
}
