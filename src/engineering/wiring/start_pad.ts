
import { BaseComponent } from "../inventory/base_component";
import { InventorySystem } from "../inventory/system";

import { ConnectedWire, DraggingWire } from "./wire";

export class StartPad extends Phaser.Sprite {

    private wire: DraggingWire;
    private sourceComponent: BaseComponent;
    private inventorySystem: InventorySystem;

    constructor(game: Phaser.Game, sourceComponent: BaseComponent, inventorySystem: InventorySystem) {
        super(game, 0, 0, "enemyBullet", 0);
        this.inputEnabled = true;
        this.input.enableDrag();

        this.sourceComponent = sourceComponent;
        this.inventorySystem = inventorySystem;

        this.anchor.x = 0;
        this.anchor.y = 0;

        this.events.onDragStart.add(this.onDragStart, this);
        this.events.onDragStop.add(this.onDragStop, this);
        this.events.onDragUpdate.add(this.onDragUpdate, this);

        this.resetPosition();
        game.add.existing(this);
    }

    private onDragStart(game: any, pointer: Phaser.Pointer): void {
        this.wire = new DraggingWire(this.game, this.sourceComponent, this);
    }

    private onDragStop(): void {
        this.wire.destroy();
        this.wire = null;

        const component = this.inventorySystem.find(new Phaser.Point(this.x, this.y));

        const srcIndex = this.sourceComponent.getNextPowerPadIndex();
        let sinkIndex = component.getNextPowerPadIndex();

        if (sinkIndex === -1) {
            sinkIndex = srcIndex;
        }

        const connectable = component.getPowerPads(sinkIndex);

        if (connectable !== null) {
            const _ = new ConnectedWire(this.game, this.sourceComponent, srcIndex,  component, sinkIndex);
        }

        this.resetPosition();
    }

    private onDragUpdate(): void {
        // NOOP?
    }

    private resetPosition() {
        const pad = this.sourceComponent.getPowerHandlePoint();
        this.x = pad.x;
        this.y = pad.y;
    }

}
