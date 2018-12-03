export default class Startup extends Phaser.State {
    public preload(): void {
        // sound
        this.game.load.audio("blaster", "../assets/Laser_Shoot10.wav");
        this.game.load.audio("hit", "../assets/Explosion12.wav");
        this.game.load.audio("explosion", "../assets/Explosion30.wav");
        this.game.load.audio("hurt", "../assets/Hit_Hurt14.wav");
        this.game.load.audio("dead", "../assets/Explosion45.wav");
        this.game.load.audio("powerup", "../assets/Powerup.wav");
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

        const blaster: Phaser.Sound = this.game.add.audio("blaster", 0.1);
        const hit: Phaser.Sound = this.game.add.audio("hit");
        const explosion: Phaser.Sound = this.game.add.audio("explosion");
        const hurt: Phaser.Sound = this.game.add.audio("hurt");
        const dead: Phaser.Sound = this.game.add.audio("dead");
        const powerup: Phaser.Sound = this.game.add.audio("powerup");
        this.game.sound.setDecodedCallback([blaster, hit, explosion, hurt, dead, powerup], this.startGame, this);
    }

    private startGame(): void {
        this.state.start("splash");
    }
}
