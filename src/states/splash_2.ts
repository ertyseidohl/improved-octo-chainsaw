export default class Splash2 extends Phaser.State {

    // DATA
    private enter: Phaser.Key;
    private start: Phaser.Button;
    private text: Phaser.Text;

    public preload(): void {
        this.game.load.image("splash_2", "./assets/splash_2.png");
    }

    // METHODS
    public create(): void {
        this.game.add.image(0, 0, "splash_2");
        this.enter = this.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enter.onDown.addOnce(this.startGameplay, this);

    }

    // PRIVATE METHODS
    private startGameplay(): void {
        this.state.start("gameplay");
    }

}
