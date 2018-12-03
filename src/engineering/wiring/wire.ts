import { Color } from "phaser-ce";

const COLORS = [
    Color.BLUE,
    Color.GREEN,
    Color.RED,
];

abstract class Wire extends Phaser.Sprite {

    private points: Phaser.Point[];

    constructor(game: Phaser.Game) {
        super(game, 700, 400, "");
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.precalculate();
        this.texture = this.generateMyTexture(game, color);
        this.game.add.existing(this);
        this.bringToTop();
        this.renderable = true;
    }

    public abstract getOriginPoint(): Phaser.Point;
    public abstract getTerminalPoint(): Phaser.Point;

    public update(): void {
        console.log(this);
    }

    private precalculate(): void {

        const origin = this.getOriginPoint();
        const terminal = this.getTerminalPoint();

        const dx = terminal.x - origin.x;
        const dy = terminal.y - origin.y;

        const cornerSize = dx * 0.25;
        this.points = [origin];
        const corner1 = new Phaser.Point(origin.x + dx - cornerSize, origin.y);

        this.points.push(corner1);

        if (Math.abs(dy) > Math.abs(cornerSize) + 32) {
            const corner2 = new Phaser.Point(terminal.x, (origin.y + dy - cornerSize));
            this.points.push(corner2);
        }
        this.points.push(terminal);
    }

    private generateMyTexture(game: Phaser.Game, color: number): Phaser.RenderTexture {

        const graphics = game.add.graphics(0, 0);
        graphics.lineStyle(3, color, 1);

        graphics.moveTo(this.points[0].x, this.points[0].y);
        for (let p = 1; p < this.points.length; p += 1) {
            graphics.lineTo(this.points[p].x, this.points[p].y);
        }

        const tex =  graphics.generateTexture();
        graphics.destroy();
        return tex;
    }
}

export class ConnectedWire extends Wire {

    public getOriginPoint(): Phaser.Point {
        return new Phaser.Point(10, 10);
    }
    public getTerminalPoint(): Phaser.Point {
        return new Phaser.Point(300, 300);
    }
}
