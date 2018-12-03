// DEPENDENCIES
import { BaseComponent } from "../base_component";
import { InventorySystem } from "../system";
import { BaseDragHandler } from "./base";

// CONSTANTS
const STATE_MODIFIERS: { [s: string]: DragStateConfig} = {
    draggingOkay: {
        tint: Phaser.Color.WHITE,
        alpha: 0.5,
    },
    draggingBad: {
        tint: Phaser.Color.RED,
        alpha: 0.5,
    },
    locked : {
        tint: Phaser.Color.WHITE,
        alpha: 1.0,
    },
};

// TYPES
interface CompState {
    oldX: number;
    oldY: number;
    state: string;
}

interface DragStateConfig {
    tint: number;
    alpha: number;
}

type CompStateMap = WeakMap<BaseComponent, CompState>;

export class MoveDragHandler extends BaseDragHandler {

    // PRIVATE DATA
    private comps: CompStateMap = new WeakMap();

    // CREATORS
    constructor(private inventorySystem: InventorySystem) {
        super();
    }

    // PUBLIC METHODS
    public dragStart(comp: BaseComponent): void {
        // TBD - prevent draggin by right click
        const state = this.getState(comp);
        state.state = "draggingOkay";
        comp.bringToTop();

        state.oldX = comp.x;
        state.oldY = comp.y;

        this.inventorySystem.release(comp);
        this.updateFromState(comp, state);
    }

    public dragStop(comp: BaseComponent): void {
        const state = this.getState(comp);

        state.state = "locked";

        if (this.inventorySystem.test(comp)) {
            const coord = this.inventorySystem.place(comp);
            comp.x = coord.x;
            comp.y = coord.y;
        } else {
            comp.x = state.oldX;
            comp.y = state.oldY;
            this.inventorySystem.place(comp);
        }
        this.updateFromState(comp, state);
    }

    public dragUpdate(comp: BaseComponent): void {
        const state = this.getState(comp);

        if (! this.inventorySystem.test(comp)) {
            state.state = "draggingBad";
        } else {
            state.state = "draggingOkay";
        }
        this.updateFromState(comp, state);
    }

    // PRIVATE METHODS
    private getState(comp: BaseComponent): CompState {
        let state: CompState = this.comps.get(comp);
        if (undefined === state) {
            state = {
                oldX: 0,
                oldY: 0,
                state: "locked",
            };
            this.comps.set(comp, state);
        }
        return state;
    }

    private updateFromState(comp: BaseComponent, state: CompState): void {
        const modifiers = STATE_MODIFIERS[state.state];

        comp.tint = modifiers.tint;
        comp.alpha = modifiers.alpha;
    }

}
