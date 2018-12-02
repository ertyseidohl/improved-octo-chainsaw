// DEPENDENCIES
import Chain from "./chain";

// CONSTANTS
const ENGINEERING_TILES_WIDTH = 8;
const ENGINEERING_TILES_HEIGHT = 8;

const NUM_TILE_SPRITES = 9;

// TYPES
class RopeWire extends Phaser.Rope {

    constructor(
        game: Phaser.Game,
        parent: PIXI.DisplayObjectContainer,
        name: string,
        private source: Phaser.Point,
        sink: Phaser.Point,
    ) {
        super(
            game,
            source.x,
            source.y,
            "wire",
            0,
            [
                new Phaser.Point(0, 0),
                new Phaser.Point(0, 0),
            ],
        );
        parent.addChild(this);
    }

    set sinkPoint(value: Phaser.Point) {
        this.points = [
            new Phaser.Point(0, 0),
            value.clone().subtract(this.x, this.y),
        ];
    }
}

type Wire = RopeWire;
const Wire = RopeWire;

interface PendingConnection {
    wire: Wire;
    start: Phaser.Sprite;
}

interface ConnectionState {
    wire: Wire;
}

interface Coordinate {
    x: number;
    y: number;
}

type TargetToState = Map<Phaser.Sprite, ConnectionState>;
type SourceToTarget = Map<Phaser.Sprite, TargetToState>;

class Connections {

    // PRIVATE DATA
    private entries: SourceToTarget = new Map();

    // PUBLIC METHODS
    public tryConnect(
        source: Phaser.Sprite,
        target: Phaser.Sprite,
        wire: Wire,
    ): boolean {
        let existing = this.entries.get(source);
        if (undefined === existing) {
            existing = new Map();
            this.entries.set(source, existing);
        }
        if (existing.has(target)) {
            return false;
        }
        existing.set(target, { wire });
        return true;
    }

}

                             // =================
                             // class Engineering
                             // =================

export default class Engineering {

    // PUBLIC DATA
    public bounds: Phaser.Rectangle;

    // PRIVATE DATA
    private tiles: Phaser.Group;
    private comps: Phaser.Group;

    private floorStartX: number;
    private floorStartY: number;

    private connections: Connections = new Connections();
    private mouseInBounds: boolean = false;
    private pendingConnect: PendingConnection | null = null;

    // CREATORS
    constructor(private state: Phaser.State) {
    }

    // PUBLIC METHODS
    public create(): void {

        this.createTiles();

        this.comps = this.game.add.group();
        this.createComps();

        // setup mouse for connections
        this.game.canvas.addEventListener(
            "mousemove",
            this.onMouseMove.bind(this),
        );
        this.game.canvas.addEventListener(
            "mousedown",
            this.onMouseDown.bind(this),
        );
        this.game.canvas.addEventListener(
            "mouseup",
            this.onMouseUp.bind(this),
        );
    }

    public preload(): void {
        this.game.load.spritesheet("engine_1", "../assets/engine_1.png", 32, 64, 5);

        this.game.load.spritesheet("gun_1", "../assets/gun_1.png", 32, 32 * 3, 5);

        this.game.load.spritesheet("energy_cell", "../assets/energy_cell.png", 35, 35, 5);

        for (let i: number = 1; i <= NUM_TILE_SPRITES; i++) {
            this.game.load.image(`floor_tile_${i}`, `../assets/floor_tile_${i}.png`);
        }

        this.game.load.spritesheet("wire", "../assets/wire.png", 4, 4, 2);
    }

    public update(): void {
        // TBD
    }

    // PUBLIC PROPERTIES
    public get game(): Phaser.Game {
        return this.state.game;
    }

    // PRIVATE METHODS
    private addComponent<C>(comp: C, name?: string): C {
        this.comps.add(comp);
        if (comp instanceof Phaser.Sprite) {
            comp.inputEnabled = true;
            if (name) {
                comp.name = name;
            }
        }
        return comp;
    }

    private createComps(): void {
        const energyCell = this.addComponent(
            this.game.add.sprite(
                this.floorStartX + 128,
                this.floorStartY + 128,
                "energy_cell",
            ),
            "energyCell",
        );
        energyCell.x -= 0;
        energyCell.y -= 4;

        const energyCellAnimation = energyCell.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(20, true);

        const engine1Live = this.addComponent(
            this.game.add.sprite(
                this.floorStartX + 32,
                this.floorStartY + (6 * 32),
                "engine_1",
            ),
            "engine1",
        );
        const engineAnimation: Phaser.Animation = engine1Live.animations.add("burn", [1, 2, 3, 4]);
        engineAnimation.play(20, true);

        const gunOne = this.addComponent(
            this.game.add.sprite(
                this.floorStartX + 64,
                this.floorStartY,
                "gun_1",
            ),
            "gunOne",
        );
        const gunFireAnimation: Phaser.Animation = gunOne.animations.add("fire");
        gunFireAnimation.play(20, true);
    }

    private createTiles(): void {
        this.tiles = this.game.add.group();
        this.floorStartX = this.bounds.left + 50;
        this.floorStartY = 100;

        for (let i: number = 0; i < ENGINEERING_TILES_WIDTH; i++) {
            for (let j: number = 0; j < ENGINEERING_TILES_HEIGHT; j++) {
                this.tiles.create(
                    this.floorStartX + (32 * i),
                    this.floorStartY + (32 * j),
                    this.getTileSprite(),
                );
            }
        }

    }

    private findComponent(p: Phaser.Pointer): Phaser.Sprite | null {
        const children = this.comps.children.slice();
        while (0 < children.length) {
            const child = children.shift();
            if (child instanceof Phaser.Sprite && child.input) {
                if (child.input.pointerOver(p.id)) {
                    return child;
                }
            } else if (child instanceof Phaser.Group) {
                children.push.apply(children, child.children);
            }
        }
        return null;
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }

    private onMouseDown(): void {
        if (!this.mouseInBounds) {
            return;
        }
        // find sprite
        const p = this.game.input.mousePointer;
        const sprite = this.findComponent(p);
        if (sprite) {
            this.pendingConnect = {
                start: sprite,
                wire: new Wire(
                    this.game,
                    this.comps,
                    "",
                    p.position,
                    p.position,
                ),
            };
        }
    }

    private onMouseMove(): void {
        const p = this.game.input.mousePointer;
        this.mouseInBounds = this.bounds.contains(p.x, p.y);
        if (this.pendingConnect) {
            const { wire } = this.pendingConnect;
            if (this.mouseInBounds) {  // update the endpoint
                wire.sinkPoint = p.position;
            } else {  // remove the rope
                this.comps.remove(wire, true);
                this.pendingConnect = null;
            }
        }
    }

    private onMouseUp(): void {
        if (!this.mouseInBounds || null === this.pendingConnect) {
            return;
        }
        const { start, wire } = this.pendingConnect;
        const p = this.game.input.mousePointer;
        const sprite = this.findComponent(p);
        if (null === sprite || sprite === start) {
            // nothing to connect to, or connected to start
            this.comps.remove(wire, true);
        }
        if (!this.connections.tryConnect(start, sprite, wire)) {
            // already connected
            this.comps.remove(wire, true);
        }
        this.pendingConnect = null;
    }
}
