import { BaseComponent } from "../base_component";

export enum HandlerMode {
    NONE,
    MOVE,
    CONNECT,
}

export abstract class BaseDragHandler {

    public abstract dragStart(comp: BaseComponent): void;

    public abstract dragStop(comp: BaseComponent): void;

    public abstract dragUpdate(comp: BaseComponent): void;

}

export class GlobalDragState {
    public currentlyActive: boolean = false;
}
