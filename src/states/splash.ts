export default class Splash extends Phaser.State {

    // DATA
    private enter: Phaser.Key;
    private start: Phaser.Button;
    private text: Phaser.Text;

    // METHODS
    public create(): void {
        this.text = this.game.add.text(0, 0, "Improved Octo Chainsaw", {
            boundsAlignH : "center",
            fill         : "white",
            fontSize     : 64,
        });
        this.text.setTextBounds(0,
                                this.game.height / 5,
                                this.game.width,
                                this.game.height);

        this.start = this.game.add.button(this.game.width / 2,
                                          this.game.height / 2,
                                          "",
                                          this.startGameplay,
                                          this);
        this.start.addChild(this.game.add.text(0,
                                               0,
                                               "Start",
                                               { fill: "white" }));

        this.enter = this.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enter.onDown.addOnce(this.startGameplay, this);

    }

    // PRIVATE METHODS
    private startGameplay(): void {
        this.state.start("gameplay");
    }

}
