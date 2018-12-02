import { BaseComponent } from "../base_component";

/**
 * @class
 * This class is a pure abstract interface for receiving notifications of a
 * drag operation starting on a single component, and acting appropriately.
 */
export abstract class BaseDragHandler {

    public abstract dragStart(comp: BaseComponent): void;

    public abstract dragStop(comp: BaseComponent): void;

    public abstract dragUpdate(comp: BaseComponent): void;

}
