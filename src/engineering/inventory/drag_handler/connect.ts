// DEPENDENCIES
import { BaseComponent } from "../base_component";
import { BaseDragHandler, GlobalDragState } from "./base";

import { InventorySystem } from "../system";

import { PowerSubSystem } from "../power_subsystem";

// TYPES
class RopeWire extends Phaser.Group {
    public sinkPad: Phaser.Sprite;

    private rope: Phaser.Rope;

    constructor(
        game: Phaser.Game,
        parent: PIXI.DisplayObjectContainer,
        name: string,
        private source: Phaser.Point,
        sink: Phaser.Point,
    ) {
        super(game);
        parent.addChild(this);

        this.rope = this.add(this.game.add.rope(
            source.x,
            source.y,
            "wire",
            0,
            [
                new Phaser.Point(0, 0),
                new Phaser.Point(0, 0),
            ],
        ));
        const padBitmap = this.game.add.bitmapData(10, 10);
        padBitmap.fill(0, 0, 255);
        this.sinkPad = this.add(this.game.add.sprite(source.x - 5,
                                                     source.y - 5,
                                                     padBitmap));
        parent.addChild(this);
    }

    set sinkPoint(value: Phaser.Point) {
        this.rope.points = [
            new Phaser.Point(0, 0),
            value.clone().subtract(this.rope.x, this.rope.y),
        ];
        this.sinkPad.position = value.clone().subtract(5, 5);
    }
}

interface ConnectionState {
    wire: RopeWire;
}

interface ConnectionLink {
    source: BaseComponent;
    sink: BaseComponent;
}

interface Coordinate {
    x: number;
    y: number;
}

interface PendingConnect {
    source: BaseComponent;
    start: Coordinate;
    wire: RopeWire;
}

type TargetToState = Map<Phaser.Sprite, ConnectionState>;
type SourceToTarget = Map<Phaser.Sprite, TargetToState>;

class Connections {

    // PRIVATE DATA
    private entries: SourceToTarget = new Map();

    // PUBLIC METHODS
    public tryConnect(
        source: Phaser.Sprite,
        sink: Phaser.Sprite,
        wire: RopeWire,
    ): boolean {
        let existing = this.entries.get(source);
        if (undefined === existing) {
            existing = new Map();
            this.entries.set(source, existing);
        }
        if (existing.has(sink)) {
            return false;
        }
        existing.set(sink, { wire });
        return true;
    }

    public disconnect(source: Phaser.Sprite, sink: Phaser.Sprite) {
        const existing = this.entries.get(source);
        if (existing) {
            existing.delete(sink);
        }
    }

}

export class ConnectDragHandler extends BaseDragHandler {

    // PRIVATE DATA
    private connections: Connections = new Connections();
    private pendingConnect: PendingConnect | null = null;
    private wiresGroup: Phaser.Group;
    private connectedWires = new Map<RopeWire, ConnectionLink>();

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
        if (!comp.onShip) {
            return;
        }
        // find sprite
        const p = this.game.input.mousePointer;
        this.pendingConnect = {
            source: comp,
            start: { x: comp.x, y: comp.y },
            wire: new RopeWire(
                this.game,
                this.wires,
                "",
                p.position,
                p.position,
            ),
        };
    }

    public dragStop(comp: BaseComponent): void {
        if (!comp.onShip || null === this.pendingConnect) {
            return;
        }
        const { wire } = this.pendingConnect;
        const p = this.game.input.mousePointer;
        const sink = this.inventorySystem.find(p.position);
        if (undefined === sink) {
            this.wires.remove(wire, true);
        } else if (comp === sink) {
            this.wires.remove(wire, true);
        } else if (!this.connections.tryConnect(comp, sink, wire)) {
            this.wires.remove(wire, true);
        } else {
            wire.sinkPad.data = { wire };
            wire.sinkPad.inputEnabled = true;
            wire.sinkPad.input.enableDrag();
            wire.sinkPad.events.onDragStart.add(this.wireDragStart, this);
            wire.sinkPad.events.onDragStop.add(this.wireDragStop, this);
            wire.sinkPad.events.onDragUpdate.add(this.wireDragUpdate, this);
            this.connectedWires.set(wire, { source: comp, sink });
            this.powerSystem.attach(comp, sink);
            this.powerSystem.updateAllComponents();
        }
        this.pendingConnect = null;
    }

    public dragUpdate(comp: BaseComponent): void {
        if (!comp.onShip || null === this.pendingConnect) {
            // TBD - if not on ship, need to move back to its original
            // location.
            return;
        }
        const { start, wire } = this.pendingConnect;
        wire.sinkPoint = this.game.input.mousePointer.position;
        comp.x = start.x;
        comp.y = start.y;
    }

    // PUBLIC PROPERTIES
    get wires(): Phaser.Group {
        return this.wiresGroup;
    }

    // PRIVATE METHODS
    private wireDragStart(pad: Phaser.Sprite, pointer: Phaser.Pointer) {
        const wire = pad.data.wire as RopeWire;
        const p = this.game.input.mousePointer;
        const { source, sink } = this.connectedWires.get(wire);
        this.connectedWires.delete(wire);
        this.connections.disconnect(source, sink);
        this.powerSystem.detach(source, sink);
        this.pendingConnect = {
            source,
            start: { x: wire.x, y: wire.y },
            wire,
        };
    }

    private wireDragStop(pad: Phaser.Sprite, p: Phaser.Pointer) {
        if (this.pendingConnect) {
            this.dragStop(this.pendingConnect.source);
        }
    }

    private wireDragUpdate(pad: Phaser.Sprite, p: Phaser.Pointer) {
        const wire = pad.data.wire as RopeWire;
        wire.sinkPoint = p.position;
    }

}
