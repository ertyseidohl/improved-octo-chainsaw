// DEPENDENCIES
import { BaseComponent } from "../base_component";
import { BaseDragHandler, GlobalDragState, HandlerMode } from "./base";
import { MoveDragHandler } from "./move";

import { PowerSubSystem } from "../../systems/power_subsystem";
import { InventorySystem } from "../system";

class NoopHandler extends BaseDragHandler {

    // PUBLIC METHODS
    public dragStart(comp: BaseComponent): void {
    }

    public dragStop(comp: BaseComponent): void {
    }

    public dragUpdate(comp: BaseComponent): void {
    }
}

export class MultiDragHandler extends BaseDragHandler {

    // PRIVATE DATA
    private currentHandlerMode: HandlerMode;
    private handlers: BaseDragHandler[] = [];

    private globalDragState: GlobalDragState;

    // CREATORS
    constructor(
        game: Phaser.Game,
        inventorySystem: InventorySystem,
        powerSystem: PowerSubSystem,
    ) {
        super();
        this.currentHandlerMode = HandlerMode.MOVE;

        this.globalDragState = new GlobalDragState();

        this.handlers[HandlerMode.MOVE] = new MoveDragHandler(inventorySystem);
        this.handlers[HandlerMode.CONNECT] = new NoopHandler();
    }

    // PUBLIC METHODS
    public dragStart(comp: BaseComponent): void {
        this.handlers[this.currentHandlerMode].dragStart(comp);
    }

    public dragStop(comp: BaseComponent): void {
        this.handlers[this.currentHandlerMode].dragStop(comp);
    }

    public dragUpdate(comp: BaseComponent): void {
        this.handlers[this.currentHandlerMode].dragUpdate(comp);
    }

    public setHandler(handler: HandlerMode): void {
        if (!this.globalDragState.currentlyActive) {
            this.handler = handler;
        }
    }

    // PUBLIC PROPERTIES
    get handler(): HandlerMode {
        return this.currentHandlerMode;
    }

    set handler(value: HandlerMode) {
        this.currentHandlerMode = value;
    }

}
