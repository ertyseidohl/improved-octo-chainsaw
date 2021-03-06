import { ComponentState, StateConfig } from "./component_state";
import { Constraints, INCINERATOR_BOUNDS, InventorySystem } from "./system";

import { PowerSubSystem } from "../systems/power_subsystem";
import { ConnectedWire } from "../wiring/wire";

export enum PowerType {
    None,
    Source,
    Sink,
}

export abstract class BaseComponent extends Phaser.Sprite {

    public tileWidth: number;
    public tileHeight: number;

    public onShip: boolean;

    protected powerPadsOffsets = [
        new Phaser.Point(12, 12),
        new Phaser.Point(18, 14),
        new Phaser.Point(14, 18),
        new Phaser.Point(20, 20),
    ];

    private inventorySystem: InventorySystem;

    private componentState: ComponentState;

    private oldX: number;
    private oldY: number;

    private wires: ConnectedWire[];

    constructor(game: Phaser.Game, inventorySystem: InventorySystem,
                key: string,
                tileWidth: number, tileHeight: number,
                position: Phaser.Point = new Phaser.Point(0, 0),
    ) {
        super(game, position.x, position.y, key, 0);

        this.inventorySystem = inventorySystem;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.inputEnabled = true;
        this.input.enableDrag();

        this.anchor.x = 0;
        this.anchor.y = 0;

        this.events.onDragStart.add(this.onDragStart, this);
        this.events.onDragStop.add(this.onDragStop, this);
        this.events.onDragUpdate.add(this.onDragUpdate, this);

        this.events.onInputOver.add(this.onInputOver, this);
        this.events.onInputOut.add(this.onInputOut, this);

        this.componentState = new ComponentState(this.getStateConfig());
        this.wires = [];

        game.add.existing(this);
    }

    public abstract getDescription(): string[];
    public abstract getStateConfig(): StateConfig;

    public isIncineratable(): boolean {
        return true;
    }

    public lockDrag(): void {
        this.input.disableDrag();
        this.inputEnabled = false;
    }

    public unlockDrag(): void {
        this.inputEnabled = true;
        this.input.enableDrag();
    }

    public getPowerType(): PowerType {
        if (this.getStateConfig().powerConsumer) {
            return PowerType.Sink;
        } else if (this.getStateConfig().powerSource) {
            return PowerType.Source;
        }
        return PowerType.None;
    }

    public getTileWidth(): number {
        return this.tileWidth;
    }

    public getTileHeight(): number {
        return this.tileHeight;
    }

    public getPlacementConstraint(): Constraints {
        return null;
    }

    public updatePower(power: number): void {
        return this.componentState.updatePower(power);
    }

    public getPower() {
        return this.componentState.getPower();
    }

    public getPotential() {
        return this.componentState.getPotential();
    }

    public isOnline() {
        return this.componentState.isOnline();
    }

    public getWeight(): number {
        return this.componentState.getWeight();
    }

    public getSpeed(): number {
        return 0;
    }

    public getPotentialSpeed(): number {
        return 0;
    }

    public getGuns(): number {
        return 0;
    }

    public getPotentialGuns(): number {
        return 0;
    }

    public getShielding(): number {
        return 0;
    }

    public getPowerHandlePoint(): Phaser.Point {
        return null;
    }

    public getNextPowerPadIndex(): number {
        return -1;
    }
    public getPowerPads(index: number): Phaser.Point {
        return null;
    }

    public disconnectAll(powerSystem: PowerSubSystem): void {

        if (this.getPowerType() === PowerType.None) {
            return;
        } else if (this.getPowerType() === PowerType.Source) {
            return;
        }

        while (this.wires.length) {
            const wire = this.wires.pop();
            powerSystem.detach(wire.getOriginComponent(), this, wire);
            wire.destroy();
        }
    }

    public plugOut(index: number, wire: ConnectedWire) {
        const i = this.wires.indexOf(wire);
        if (i > -1) {
            this.wires.splice(i, 1);
        }
    }

    public plugIn(index: number, wire: ConnectedWire): void {
        this.wires.push(wire);
    }

    public destroy() {
        this.disconnectAll(this.inventorySystem.powerSystem);
        super.destroy();
    }

    private onDragStart(game: any, pointer: Phaser.Pointer): void {
        this.inventorySystem.dragHandler.dragStart(this);

        if (this.getPowerType() === PowerType.Source) {
            this.disconnectAll(this.inventorySystem.powerSystem);
        }
    }

    private onDragStop(game: any, pointer: Phaser.Pointer): void {
        if (INCINERATOR_BOUNDS.contains(pointer.x, pointer.y) && this.isIncineratable()) {
            this.game.sound.play("burn");
            this.destroy();
            return;
        }
        this.inventorySystem.dragHandler.dragStop(this);

        if (this.getPowerType() === PowerType.Sink && !this.onShip) {
            this.disconnectAll(this.inventorySystem.powerSystem);
        }

    }

    private onDragUpdate(): void {
        this.inventorySystem.dragHandler.dragUpdate(this);
    }

    private onInputOver(): void {
        this.inventorySystem.setDisplayText(this.getDescription());
    }

    private onInputOut(): void {
        this.inventorySystem.clearText();
    }

}
