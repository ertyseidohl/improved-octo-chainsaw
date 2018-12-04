export default class YouWin extends Phaser.State {
    public create(): void {
        this.game.add.text(
            this.game.width / 2,
            this.game.height / 2,
            "You win!",
            {font: "50px pixelsix", fill: "#FFFFFF"},
        );

        this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 + 100,
            `Points: ${document.location.hash} \n enter to restart`,
            {font: "20px pixelsix", fill: "#FFFFFF"},
        );

        const enter = this.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        enter.onDown.addOnce(this.restart, this);

    }

    // PRIVATE METHODS
    private restart(): void {
        this.state.start("splash");
    }
}
