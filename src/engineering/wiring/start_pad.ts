import { BaseComponent, PowerType } from "../inventory/base_component";
import { InventorySystem } from "../inventory/system";
import { PowerSubSystem } from "../systems/power_subsystem";
import { ConnectedWire, DraggingWire } from "./wire";

export class StartPad extends Phaser.Sprite {

    private wire: DraggingWire;
    private sourceComponent: BaseComponent;
    private inventorySystem: InventorySystem;
    private powerSystem: PowerSubSystem;
    private wireGroup: Phaser.Group;

    constructor(game: Phaser.Game, sourceComponent: BaseComponent,
                inventorySystem: InventorySystem, powerSystem: PowerSubSystem, wireGroup: Phaser.Group) {
        super(game, 0, 0, "enemyBullet", 0);
        this.inputEnabled = true;
        this.input.enableDrag();

        this.sourceComponent = sourceComponent;
        this.inventorySystem = inventorySystem;
        this.powerSystem = powerSystem;
        this.wireGroup = wireGroup;

        this.anchor.x = 0;
        this.anchor.y = 0;

        this.events.onDragStart.add(this.onDragStart, this);
        this.events.onDragStop.add(this.onDragStop, this);
        this.events.onDragUpdate.add(this.onDragUpdate, this);

        game.add.existing(this);
        this.resetPosition();
    }

    private onDragStart(game: any, pointer: Phaser.Pointer): void {
        this.wire = new DraggingWire(this.game, this.sourceComponent, this);
    }

    private onDragStop(): void {
        const sinkComponent = this.inventorySystem.find(new Phaser.Point(this.x, this.y));

        if (!sinkComponent || sinkComponent.getPowerType() === PowerType.Source) {
            this.resetPosition();
            return;
        }

        const srcIndex = this.sourceComponent.getNextPowerPadIndex();
        let sinkIndex = sinkComponent.getNextPowerPadIndex();

        if (sinkIndex === -1) {
            sinkIndex = srcIndex;
        }

        const sinkConnectable = sinkComponent.getPowerPads(sinkIndex);

        if (sinkConnectable !== null) {
            const wire = new ConnectedWire(this.game, this.sourceComponent,
                                            srcIndex,  sinkComponent, sinkIndex, this.wire.color);
            this.wireGroup.add(wire);
            this.powerSystem.attach(this.sourceComponent, sinkComponent, srcIndex);
        }
        this.wire.destroy();
        this.wire = null;

        this.resetPosition();
    }

    private destroy(): void {
        if (this.wire) {
            this.wire.destroy();
        }
        super.destroy();
    }

    private onDragUpdate(): void {
        // NOOP?
    }

    private resetPosition() {

        if (this.sourceComponent.getNextPowerPadIndex() === -1) {
            this.destroy();
        }

        const pad = this.sourceComponent.getPowerHandlePoint();

        this.x = pad.x;
        this.y = pad.y;
        this.bringToTop();
    }

}
