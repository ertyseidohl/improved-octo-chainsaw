import { InventorySystem } from "./system";

interface StateConfig {
    tint: number;
    alpha: number;
}

export class BaseComponent extends Phaser.Sprite {

    public tileWidth: number;
    public tileHeight: number;

    private stateModifiers: { [s: string]: StateConfig} = {
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

    private state: string = "locked";
    private inventorySystem: InventorySystem;

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
        this.input.enableSnap(8, 8, false, true);

        this.physicsEnabled = true;

        this.events.onDragStart.add(this.onDragStart, this);
        this.events.onDragStop.add(this.onDragStop, this);
        // this.events.onDragUpdate.add(this.onDragUpdate, this);

        game.add.existing(this);
    }

    public getTileWidth() {
        return this.tileWidth;
    }

    public getTileHeight() {
        return this.tileHeight;
    }

    private updateFromState() {
        const modifiers = this.stateModifiers[this.state];

        this.tint = modifiers.tint;
        this.alpha = modifiers.alpha;
    }

    private onDragStart(sprite: Phaser.Sprite, pointer: Phaser.Pointer) {
        this.state = "draggingOkay";

        this.oldX = this.x;
        this.oldY = this.y;

        this.updateFromState();
    }

    private onDragStop(sprite: Phaser.Sprite, pointer: Phaser.Pointer) {
        this.state = "locked";

        if (this.inventorySystem.test(this)) {
            this.inventorySystem.place(this);
        } else {
            this.x = this.oldX;
            this.y = this.oldY;
        }

        this.updateFromState();
    }

}
