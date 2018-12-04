import { Color } from "phaser-ce";
import { BaseComponent } from "../inventory/base_component";

const COLORS = [
    Color.BLUE,
    Color.GREEN,
    Color.RED,
];

interface PointLine {
    origin: Phaser.Point;
    terminal: Phaser.Point;
}

abstract class Wire extends Phaser.Sprite {

    public color: Phaser.Color;
    private points: Phaser.Point[];

    private lastOrigin: Phaser.Point;
    private lastTerminal: Phaser.Point;

    constructor(game: Phaser.Game, color: Phaser.Color) {
        super(game, 700, 400, "");
        this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
        this.game.add.existing(this);
        this.bringToTop();
        this.renderable = true;
    }

    public abstract getOriginPoint(): Phaser.Point;
    public abstract getTerminalPoint(): Phaser.Point;

    public update(): void {
        const origin = this.getOriginPoint();
        const terminal = this.getTerminalPoint();

        const dirty = this.anyChanges(origin, terminal);

        if (dirty) {
            this.precalculate();
            this.texture = this.generateMyTexture(this.game, this.color);
        }

        this.setAnchor(this.calculateAnchor(origin, terminal));
        this.bringToTop();
    }

    private anyChanges(origin: Phaser.Point, terminal: Phaser.Point): boolean {

        if (this.lastOrigin && this.lastTerminal &&
            this.lastOrigin.x === origin.x && this.lastOrigin.y === origin.y &&
            this.lastTerminal.x === terminal.x && this.lastTerminal.y === terminal.y) {
                return false;
        }
        this.lastOrigin = origin;
        this.lastTerminal = terminal;
        return true;
    }

    private calculateAnchor(origin: Phaser.Point, terminal: Phaser.Point) {
        const x = Math.min(origin.x, terminal.x);
        const y = Math.min(origin.y, terminal.y);
        return new Phaser.Point(x, y);
    }

    private setAnchor(anchor: Phaser.Point) {
        this.x = anchor.x;
        this.y = anchor.y;
    }

    private precalculate(): void {

        const points = this.adjustTexture(this.getOriginPoint(), this.getTerminalPoint());
        const origin = points.origin;
        const terminal = points.terminal;

        const dx = terminal.x - origin.x;
        const dy = terminal.y - origin.y;

        this.points = [origin];

        if (Math.abs(dx) < Math.abs(dy)) {
            const cornerSize = Math.abs(dx * 0.35);
            const xdir = dx / Math.abs(dx);
            const ydir = dy / Math.abs(dy);

            const corner1 = new Phaser.Point(origin.x + dx - (cornerSize * xdir), origin.y);
            this.points.push(corner1);
            const corner2 = new Phaser.Point(terminal.x, terminal.y - dy + (cornerSize * ydir));
            this.points.push(corner2);
        } else {
            const cornerSize = Math.abs(dy * 0.35);
            const xdir = dx / Math.abs(dx);
            const ydir = dy / Math.abs(dy);

            const corner1 = new Phaser.Point(origin.x, origin.y + dy - (cornerSize * ydir) );
            this.points.push(corner1);
            const corner2 = new Phaser.Point(terminal.x - dx + (cornerSize * xdir), terminal.y);
            this.points.push(corner2);
        }

        this.points.push(terminal);
    }

    private adjustTexture(origin: Phaser.Point, terminal: Phaser.Point): PointLine {

        const anchor = this.calculateAnchor(origin, terminal);

        const newOrigin = new Phaser.Point(origin.x - anchor.x, origin.y - anchor.y);
        const newTerminal = new Phaser.Point(terminal.x - anchor.x, terminal.y - anchor.y);

        return  {
            origin: newOrigin,
            terminal: newTerminal,
        };
    }

    private generateMyTexture(game: Phaser.Game, color: Phaser.Color): Phaser.RenderTexture {

        const graphics = game.add.graphics(0, 0);
        graphics.lineStyle(3, color as number, 1);

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

    private origin: BaseComponent;
    private terminal: BaseComponent;

    private originPadIndex: number;
    private terminalPadIndex: number;

    constructor(game: Phaser.Game, originComponent: BaseComponent, originPadIndex: number,
                terminalComponent: BaseComponent, terminalPadIndex: number, color?: Phaser.Color) {
        super(game, color);
        this.origin = originComponent;
        this.terminal = terminalComponent;

        this.originPadIndex = originPadIndex;
        this.terminalPadIndex = terminalPadIndex;
    }

    public getOriginPoint(): Phaser.Point {
        const pad = this.origin.getPowerPads(this.originPadIndex);
        return pad;
    }

    public getTerminalPoint(): Phaser.Point {
        const pad = this.terminal.getPowerPads(this.terminalPadIndex);
        return pad;
    }

    public getOriginComponent(): BaseComponent {
        return this.origin;
    }

    public getTerminalComponent(): BaseComponent {
        return this.terminal;
    }

    public getOriginPadIndex(): number {
        return this.originPadIndex;
    }
}

export class DraggingWire extends Wire {

    private origin: BaseComponent;
    private handle: Phaser.Sprite;

    constructor(game: Phaser.Game, originComponet: BaseComponent, handle: Phaser.Sprite) {
        super(game, null);
        this.origin = originComponet;
        this.handle = handle;
    }

    public getOriginPoint(): Phaser.Point {
        const pad = this.origin.getPowerHandlePoint();
        return pad;
    }

    public getTerminalPoint(): Phaser.Point {
        return new Phaser.Point(
            this.handle.x,
            this.handle.y,
        );
    }
}
