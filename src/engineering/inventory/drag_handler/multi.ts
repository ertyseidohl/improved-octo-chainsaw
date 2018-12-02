// DEPENDENCIES
import { BaseComponent } from "../base_component";
import { BaseDragHandler } from "./base";
import { InventorySystem } from "../system";
import { MoveDragHandler } from "./move";

// TYPES
export enum HandlerType {
    MOVE = 0,
}

export class MultiDragHandler extends BaseDragHandler {

    // PRIVATE DATA
    private current: HandlerType;
    private handlers: BaseDragHandler[] = [];

    // CREATORS
    constructor(private inventorySystem: InventorySystem) {
        super();
        this.current = HandlerType.MOVE;

        this.handlers[HandlerType.MOVE] = new MoveDragHandler(inventorySystem);
    }

    // PUBLIC METHODS
    public dragStart(comp: BaseComponent): void {
        this.handlers[this.current].dragStart(comp);
    }

    public dragStop(comp: BaseComponent): void {
        this.handlers[this.current].dragStop(comp);
    }

    public dragUpdate(comp: BaseComponent): void {
        this.handlers[this.current].dragUpdate(comp);
    }

    // PUBLIC PROPERTIES
    get handler(): HandlerType {
        return this.current;
    }

    set handler(value: HandlerType) {
        this.current = value;
    }

}
