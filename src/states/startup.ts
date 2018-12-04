export default class Startup extends Phaser.State {
    public preload(): void {
        // sound
        this.game.load.audio("blaster", "../assets/Laser_Shoot10.wav");
        this.game.load.audio("hit", "../assets/Explosion12.wav");
        this.game.load.audio("explosion", "../assets/Explosion30.wav");
        this.game.load.audio("hurt", "../assets/Hit_Hurt14.wav");
        this.game.load.audio("dead", "../assets/Explosion45.wav");
        this.game.load.audio("powerup", "../assets/Powerup.wav");
        this.game.load.audio("burn", "../assets/Explosion5.wav");

        this.game.load.audio("visager_final", "../assets/visager_final.mp3");
        this.game.load.audio("visager_game", "../assets/visager_game.mp3");
        this.game.load.audio("visager_boss", "../assets/visager_boss.mp3");
    }

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

        const visagerGame: Phaser.Sound = this.game.add.audio("visager_game");
        const visagerFinal: Phaser.Sound = this.game.add.audio("visager_final");
        const visagerBoss: Phaser.Sound = this.game.add.audio("visager_boss");

        const blaster: Phaser.Sound = this.game.add.audio("blaster");
        const burn: Phaser.Sound = this.game.add.audio("burn");
        const hit: Phaser.Sound = this.game.add.audio("hit");
        const explosion: Phaser.Sound = this.game.add.audio("explosion");
        const hurt: Phaser.Sound = this.game.add.audio("hurt");
        const dead: Phaser.Sound = this.game.add.audio("dead");
        const powerup: Phaser.Sound = this.game.add.audio("powerup");
        this.game.sound.setDecodedCallback(
            [blaster, burn, hit, explosion, hurt, dead, powerup, visagerBoss, visagerFinal, visagerGame],
            this.startGame,
            this);
    }

    private startGame(): void {
        this.state.start("splash");
    }
}
