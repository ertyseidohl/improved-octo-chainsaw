export default class Splash extends Phaser.State {

    // DATA
    private enter: Phaser.Key;
    private start: Phaser.Button;
    private text: Phaser.Text;

    public preload(): void {
        this.game.load.image("splash", "../assets/splash.png");
    }

    // METHODS
    public create(): void {
        this.game.add.image(0, 0, "splash");
        this.enter = this.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enter.onDown.addOnce(this.startGameplay, this);

        this.game.sound.stopAll();

        this.game.sound.play("visager_final");

    }

    // PRIVATE METHODS
    private startGameplay(): void {
        this.state.start("splash_2");
    }

}
