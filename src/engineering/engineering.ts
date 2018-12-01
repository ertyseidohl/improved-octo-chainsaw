// CONSTANTS
const ENGINEERING_TILES_WIDTH = 8;
const ENGINEERING_TILES_HEIGHT = 8;

const NUM_TILE_SPRITES = 9;

// TYPES
interface PendingConnection {
    rope: Phaser.Rope;
    start: Phaser.Sprite;
}

interface ConnectionState {
    rope: Phaser.Rope;
}

type TargetToRope = Map<Phaser.Sprite, ConnectionState>;
type SourceToTarget = Map<Phaser.Sprite, TargetToRope>;

class Connections {

    // PRIVATE DATA
    private entries: SourceToTarget = new Map();

    // PUBLIC METHODS
    public tryConnect(
        source: Phaser.Sprite,
        target: Phaser.Sprite,
        rope: Phaser.Rope,
    ): boolean {
        let existing = this.entries.get(source);
        if (undefined === existing) {
            existing = new Map();
            this.entries.set(source, existing);
        }
        if (existing.has(target)) {
            return false;
        }
        existing.set(target, { rope });
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

    private connectTexture: Phaser.BitmapData;
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
        this.connectTexture = this.game.add.bitmapData();
        this.connectTexture.fill(0, 192, 255, 127);
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
        this.game.load.image("engine_1_dead", "../assets/engine_1_dead.png");
        this.game.load.image("engine_1_live", "../assets/engine_1_live.png");

        this.game.load.spritesheet("gun_1", "../assets/gun_1.png", 32, 32 * 3, 5);

        this.game.load.spritesheet("energy_cell", "../assets/energy_cell.png", 35, 35, 5);

        for (let i: number = 1; i <= NUM_TILE_SPRITES; i++) {
            this.game.load.image(`floor_tile_${i}`, `../assets/floor_tile_${i}.png`);
        }
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
        this.addComponent(
            this.game.add.sprite(
                this.floorStartX,
                this.floorStartY + (6 * 32),
                "engine_1_dead",
            ),
            "engine1Dead",
        );

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
                "engine_1_live",
            ),
            "engine1Live",
        );

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
            if (child instanceof Phaser.Sprite) {
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
        console.log("overEngineering?", this.mouseInBounds);
        if (!this.mouseInBounds) {
            return;
        }
        // find sprite
        const p = this.game.input.mousePointer;
        const sprite = this.findComponent(p);
        if (sprite) {
            console.log("got start", sprite.name);
            this.pendingConnect = {
                start: sprite,
                rope: this.comps.add(
                    this.game.add.rope(p.x, p.y, this.connectTexture, null, [
                        new Phaser.Point(0, 0),
                        new Phaser.Point(0, 0),
                    ]),
                ),
            };
            this.pendingConnect.rope.scale.set(0.025, 0.025);
        } else {
            console.log("no sprite found");
        }
    }

    private onMouseMove(): void {
        const p = this.game.input.mousePointer;
        this.mouseInBounds = this.bounds.contains(p.x, p.y);
        if (this.pendingConnect) {
            const { rope } = this.pendingConnect;
            if (this.mouseInBounds) {  // update the endpoint
                rope.points = [
                    new Phaser.Point(0, 0),
                    new Phaser.Point(40 * (p.x - rope.x), 40 * (p.y - rope.y)),
                ];
            } else {  // remove the rope
                this.comps.remove(rope, true);
                this.pendingConnect = null;
            }
        }
    }

    private onMouseUp(): void {
        if (!this.mouseInBounds || null === this.pendingConnect) {
            return;
        }
        const { start, rope } = this.pendingConnect;
        const p = this.game.input.mousePointer;
        const sprite = this.findComponent(p);
        if (null === sprite || sprite === start) {
            // nothing to connect to, or connected to start
            this.comps.remove(rope, true);
        }
        if (!this.connections.tryConnect(start, sprite, rope)) {
            // already connected
            this.comps.remove(rope, true);
        }
        this.pendingConnect = null;
    }
}
