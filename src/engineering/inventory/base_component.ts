import { ComponentState, StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

interface DragStateConfig {
    tint: number;
    alpha: number;
}

export abstract class BaseComponent extends Phaser.Sprite {

    public tileWidth: number;
    public tileHeight: number;

    private stateModifiers: { [s: string]: DragStateConfig} = {
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

    private dragState: string = "locked";
    private inventorySystem: InventorySystem;

    private componentState: ComponentState;

    private oldX: number;
    private oldY: number;

    constructor(game: Phaser.Game, inventorySystem: InventorySystem,
                x: number, y: number, key: string,
                tileWidth: number, tileHeight: number) {
        super(game, x, y, key, 0);

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
        this.events.onInputOut.add(this.onInputOver, this);

        this.componentState = new ComponentState(this.getStateConfig());

        game.add.existing(this);
    }

    public abstract getDescription(): string[];
    public abstract getStateConfig(): StateConfig;

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

    private updateFromState() {
        const modifiers = this.stateModifiers[this.dragState];

        this.tint = modifiers.tint;
        this.alpha = modifiers.alpha;
    }

    private onDragStart(sprite: Phaser.Sprite, pointer: Phaser.Pointer): void {
        this.dragState = "draggingOkay";
        this.bringToTop();

        this.oldX = this.x;
        this.oldY = this.y;

        this.inventorySystem.release(this);
        this.updateFromState();
    }

    private onDragStop(sprite: Phaser.Sprite, pointer: Phaser.Pointer): void {
        this.dragState = "locked";

        if (this.inventorySystem.test(this)) {
            const coord = this.inventorySystem.place(this);
            this.x = coord.x;
            this.y = coord.y;
        } else {
            this.x = this.oldX;
            this.y = this.oldY;
            this.inventorySystem.place(this);
        }

        this.updateFromState();
    }

    private onDragUpdate(sprite: Phaser.Sprite, pointer: Phaser.Pointer): void {
        if (! this.inventorySystem.test(this)) {
            this.dragState = "draggingBad";
        } else {
            this.dragState = "draggingOkay";
        }
        this.updateFromState();
    }

    private onInputOver(): void {
        this.inventorySystem.setDisplayText(this.getDescription());
    }

    private onInputOut(): void {
        this.inventorySystem.clearText();
    }

}
