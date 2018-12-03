// DEPENDENCIES
import { BaseComponent } from "../base_component";
import { BaseDragHandler, GlobalDragState, HandlerMode } from "./base";
import { ConnectDragHandler } from "./connect";

import { InventorySystem } from "../system";
import { MoveDragHandler } from "./move";

import { PowerSubSystem } from "../power_subsystem";

export class MultiDragHandler extends BaseDragHandler {

    // PRIVATE DATA
    private current: HandlerMode;
    private handlers: BaseDragHandler[] = [];

    private globalDragState: GlobalDragState;

    // CREATORS
    constructor(
        game: Phaser.Game,
        inventorySystem: InventorySystem,
        powerSystem: PowerSubSystem,
    ) {
        super();
        this.current = HandlerMode.MOVE;

        this.globalDragState = new GlobalDragState();

        this.handlers[HandlerMode.MOVE] = new MoveDragHandler(inventorySystem);
        this.handlers[HandlerMode.CONNECT] = new ConnectDragHandler(
            game,
            inventorySystem,
            powerSystem,
        );
    }

    // PUBLIC METHODS
    public dragStart(comp: BaseComponent): void {
        this.handlers[this.current].dragStart(comp);
        this.globalDragState.currentlyActive = true;
    }

    public dragStop(comp: BaseComponent): void {
        this.handlers[this.current].dragStop(comp);
        this.globalDragState.currentlyActive = false;
    }

    public dragUpdate(comp: BaseComponent): void {
        this.handlers[this.current].dragUpdate(comp);
    }

    public setHandler(handler: HandlerMode): void {
        if (!this.globalDragState.currentlyActive) {
            this.handler = handler;
        }
    }

    // PUBLIC PROPERTIES
    get handler(): HandlerMode {
        return this.current;
    }

    set handler(value: HandlerMode) {
        this.current = value;
    }

}
