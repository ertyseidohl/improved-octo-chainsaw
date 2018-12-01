export default class Startup extends Phaser.State {
    public create(): void {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // Disable Multitouch
        this.input.maxPointers = 1;

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        this.state.start("gameplay");
    }
}
