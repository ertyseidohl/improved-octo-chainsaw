import { BaseComponent } from "./inventory/base_component";
import { BasicGun } from "./inventory/basic_gun";
import { EnergyCell } from "./inventory/energy_cell";
import { EnergyCellHD } from "./inventory/energy_cell_hd";
import { Engine } from "./inventory/engine";
import { InputC } from "./inventory/input_c";
import { InputX } from "./inventory/input_x";
import { InputZ } from "./inventory/input_z";
import { Prince } from "./inventory/prince";
import { ShieldGenerator } from "./inventory/shield_generator";
import { SmallGun } from "./inventory/small_gun";
// import { MissileLauncher } from "./inventory/missile_launcher";

import { PowerSubSystem } from "./inventory/power_subsystem";
import { BasicShip, InventorySystem, NUM_TILE_SPRITES} from "./inventory/system";
import { MultiDragHandler } from "./inventory/drag_handler/multi";

import Chain from "./chain";

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

    private comps: Phaser.Group;

    private connectTexture: Phaser.BitmapData;
    private connections: Connections = new Connections();
    private mouseInBounds: boolean = false;
    private pendingConnect: PendingConnection | null = null;

    private inventorySystem: InventorySystem;
    private powerSystem: PowerSubSystem;

    // CREATORS
    constructor(private state: Phaser.State) {
    }

    // PUBLIC METHODS
    public create(): void {

        this.inventorySystem = new InventorySystem(
            this.game,
            600, 100,
            32, 32,
            BasicShip,
        );
        this.inventorySystem.dragHandler = new MultiDragHandler(this.inventorySystem);

        this.powerSystem = new PowerSubSystem();

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
        this.game.load.spritesheet("gun_small", "../assets/gun_small.png", 32, 32 * 2, 5);
        this.game.load.spritesheet("energy_cell", "../assets/energy_cell.png", 32, 32, 5);
        this.game.load.spritesheet("energy_cell_2", "../assets/energy_cell_2.png", 32, 32, 5);
        this.game.load.spritesheet("shield_generator", "../assets/shield_generator.png", 64, 32, 5);

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

    public explode(): void {
        this.inventorySystem.explode();
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
        const gunCoord = this.inventorySystem.gridIndexToPixels(2, 4);
        const basicGun = new BasicGun(this.game, this.inventorySystem, gunCoord.x, gunCoord.y);
        this.inventorySystem.place(basicGun);

        const cellCoord = this.inventorySystem.gridIndexToPixels(5, 3);
        const cell = new EnergyCell(this.game, this.inventorySystem, cellCoord.x, cellCoord.y);
        this.inventorySystem.place(cell);

        this.powerSystem.attach(cell, basicGun);
        this.powerSystem.attach(cell, basicGun);
        this.powerSystem.updateAllComponents();
        const smallGunCoord = this.inventorySystem.gridIndexToPixels(1, 5);
        this.inventorySystem.place(new SmallGun(this.game, this.inventorySystem, smallGunCoord.x, smallGunCoord.y));

        // const cellHDCoord = this.inventorySystem.gridIndexToPixels(6, 3);
        // this.inventorySystem.place(new EnergyCellHD(this.game, this.inventorySystem, cellHDCoord.x, cellHDCoord.y));

        const engCoord1 = this.inventorySystem.gridIndexToPixels(3, 6);
        this.inventorySystem.place(new Engine(this.game, this.inventorySystem, engCoord1.x, engCoord1.y));

        const engCoord2 = this.inventorySystem.gridIndexToPixels(6, 6);
        this.inventorySystem.place(new Engine(this.game, this.inventorySystem, engCoord2.x, engCoord2.y));

        const inputZ = this.inventorySystem.gridIndexToPixels(7, 7);
        this.inventorySystem.place(new InputZ(this.game, this.inventorySystem, inputZ.x, inputZ.y));

        const inputX = this.inventorySystem.gridIndexToPixels(7, 6);
        this.inventorySystem.place(new InputX(this.game, this.inventorySystem, inputX.x, inputX.y));

        const inputC = this.inventorySystem.gridIndexToPixels(7, 5);
        this.inventorySystem.place(new InputC(this.game, this.inventorySystem, inputC.x, inputC.y));

        const shieldGenerator = this.inventorySystem.gridIndexToPixels(5, 5);
        this.inventorySystem.place(
            new ShieldGenerator(this.game, this.inventorySystem, shieldGenerator.x, shieldGenerator.y),
        );

        // const missileLauncher = this.inventorySystem.gridIndexToPixels(3, 2);
        // this.inventorySystem.place(new MissileLauncher(
        //     this.game,
        //     this.inventorySystem,
        //     missileLauncher.x,
        //     missileLauncher.y,
        // ));

        // const prince = this.inventorySystem.gridIndexToPixels(3, 1);
        // this.inventorySystem.place(new Prince(this.game, this.inventorySystem, prince.x, prince.y));
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
