import { ComponentState, StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

import { Pointer } from "phaser-ce";

export enum PowerType {
    None,
    Source,
    Sink,
}

export abstract class BaseComponent extends Phaser.Sprite {

    public tileWidth: number;
    public tileHeight: number;

    public onShip: boolean;

    private inventorySystem: InventorySystem;

    private componentState: ComponentState;

    private oldX: number;
    private oldY: number;

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

        game.add.existing(this);
    }

    public abstract getDescription(): string[];
    public abstract getStateConfig(): StateConfig;

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

    public getWeight(): number {
        return this.componentState.getWeight();
    }

    public getSpeed(): number {
        return 0;
    }

    public getGuns(): number {
        return 0;
    }

    private onDragStart(game: any, pointer: Phaser.Pointer): void {
        this.inventorySystem.dragHandler.dragStart(this);
    }

    private onDragStop(): void {
        this.inventorySystem.dragHandler.dragStop(this);
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
