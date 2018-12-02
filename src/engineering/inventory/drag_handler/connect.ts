// DEPENDENCIES
import { BaseComponent } from "../base_component";
import { BaseDragHandler } from "./base";
import { InventorySystem } from "../system";
import { PowerSubSystem } from "../power_subsystem";

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

interface ConnectionState {
    wire: Wire;
}

interface Coordinate {
    x: number;
    y: number;
}

interface PendingConnect {
    start: Coordinate;
    wire: Wire;
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

export class ConnectDragHandler extends BaseDragHandler {

    // PRIVATE DATA
    private connections: Connections = new Connections();
    private pendingConnect: PendingConnect | null = null;
    private wiresGroup: Phaser.Group;

    // CREATORS
    constructor(
        private game: Phaser.Game,
        private inventorySystem: InventorySystem,
        private powerSystem: PowerSubSystem,
    ) {
        super();
        this.wiresGroup = this.game.add.group();
    }

    // PUBLIC METHODS
    public dragStart(comp: BaseComponent): void {
        // find sprite
        const p = this.game.input.mousePointer;
        this.pendingConnect = {
            start: { x: comp.x, y: comp.y },
            wire: new Wire(
                this.game,
                this.wires,
                "",
                p.position,
                p.position,
            ),
        };
    }

    public dragStop(comp: BaseComponent): void {
        if (null === this.pendingConnect) {
            return;
        }
        const { wire } = this.pendingConnect;
        const p = this.game.input.mousePointer;
        const sink = this.inventorySystem.find(p);
        if (undefined === sink) {
            this.wires.remove(wire, true);
        } else if (comp === sink) {
            this.wires.remove(wire, true);
        } else if (!this.connections.tryConnect(comp, sink, wire)) {
            this.wires.remove(wire, true);
        } else {
            this.powerSystem.attach(comp, sink);
            this.powerSystem.updateAllComponents();
        }
        this.pendingConnect = null;
    }

    public dragUpdate(comp: BaseComponent): void {
        const p = this.game.input.mousePointer;
        if (this.pendingConnect) {
            const { start, wire } = this.pendingConnect;
            wire.sinkPoint = p.position;
            comp.x = start.x;
            comp.y = start.y;
        }
    }

    // PUBLIC PROPERTIES
    get wires(): Phaser.Group {
        return this.wiresGroup;
    }

}
