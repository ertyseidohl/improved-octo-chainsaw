import { BaseComponent } from "./inventory/base_component";
import { BasicGun } from "./inventory/basic_gun";
import { EnergyCell } from "./inventory/energy_cell";
import { EnergyCellHD } from "./inventory/energy_cell_hd";
import { Engine } from "./inventory/engine";
import { InputC } from "./inventory/input_c";
import { InputX } from "./inventory/input_x";
import { InputZ } from "./inventory/input_z";
import { Prince } from "./inventory/prince";
import { ShieldGenerator } from "./inventory/shield_generator";
import { SmallGun } from "./inventory/small_gun";
// import { MissileLauncher } from "./inventory/missile_launcher";

import { HandlerType, MultiDragHandler } from "./inventory/drag_handler/multi";
import { PowerSubSystem } from "./inventory/power_subsystem";
import { BasicShip, InventorySystem, NUM_TILE_SPRITES} from "./inventory/system";

// =================
// class Engineering
// =================

export default class Engineering {

    // PUBLIC DATA
    public bounds: Phaser.Rectangle;

    private componentGroup: Phaser.Group;

    private mouseInBounds: boolean = false;

    private dragBitmap: Phaser.BitmapData;
    private dragHandler: MultiDragHandler;
    private inventorySystem: InventorySystem;
    private powerSystem: PowerSubSystem;

    // CREATORS
    constructor(private state: Phaser.State) {
    }

    // PUBLIC METHODS
    public create(): void {

        this.inventorySystem = new InventorySystem(
            this.game,
            600, 100,
            32, 32,
            BasicShip,
        );
        this.dragHandler = new MultiDragHandler(this.game, this.inventorySystem);
        this.inventorySystem.dragHandler = this.dragHandler;

        this.powerSystem = new PowerSubSystem();

        this.componentGroup = this.game.add.group();
        this.createStartingComponents();

        // button to switch drag modes
        const corner = this.bounds.topRight;
        this.dragBitmap = this.game.add.bitmapData(32, 32);
        this.dragBitmap.fill(255, 0, 0);
        const dragSwitch = this.game.add.sprite(
            corner.x - 32,
            corner.y,
            this.dragBitmap,
        );
        dragSwitch.inputEnabled = true;
        dragSwitch.events.onInputDown.add(this.dragSwitchPressed, this);

        this.game.canvas.addEventListener(
            "mousedown",
            this.onMouseDown.bind(this),
        );
    }

    public preload(): void {
        this.game.load.spritesheet("engine_1", "../assets/engine_1.png", 32, 64, 5);

        this.game.load.spritesheet("gun_1", "../assets/gun_1.png", 32, 32 * 3, 5);
        this.game.load.spritesheet("gun_small", "../assets/gun_small.png", 32, 32 * 2, 5);
        this.game.load.spritesheet("energy_cell", "../assets/energy_cell.png", 32, 32, 5);
        this.game.load.spritesheet("energy_cell_2", "../assets/energy_cell_2.png", 32, 32, 5);
        this.game.load.spritesheet("shield_generator", "../assets/shield_generator.png", 64, 32, 5);

        for (let i: number = 1; i <= NUM_TILE_SPRITES; i++) {
            this.game.load.image(`floor_tile_${i}`, `../assets/floor_tile_${i}.png`);
        }

        this.game.load.spritesheet("wire", "../assets/wire.png", 4, 4, 2);
    }

    public update(): void {
        // TBD
    }

    // PUBLIC PROPERTIES
    public get game(): Phaser.Game {
        return this.state.game;
    }

    public explode(): void {
        this.inventorySystem.explode();
    }

    // PRIVATE METHODS
    private addComponent(
        newComponent: BaseComponent, gridPos?: Phaser.Point, destroyOnFail: boolean = false,
    ): BaseComponent {
        const originalPosition: Phaser.Point = new Phaser.Point(newComponent.x, newComponent.y);
        if (gridPos) {
            const newPos = this.inventorySystem.gridIndexToPixels(gridPos.x, gridPos.y);
            newComponent.x = newPos.x;
            newComponent.y = newPos.y;
            this.inventorySystem.place(newComponent);
        } else {
            if (!this.inventorySystem.placeInFirstAvailable(newComponent)) {
                if (destroyOnFail) {
                    newComponent.destroy();
                } else {
                    newComponent.x = originalPosition.x;
                    newComponent.y = originalPosition.y;
                }
                return null;
            }
        }
        this.componentGroup.add(newComponent);
        return newComponent;
    }

    private createStartingComponents(): void {
        const firstGun = new BasicGun(this.game, this.inventorySystem, new Phaser.Point(0, 0));
        this.addComponent(firstGun, null, true);

        const secondGun = new BasicGun(this.game, this.inventorySystem, new Phaser.Point(0, 0));
        this.addComponent(secondGun, null, true);
    }

    private onMouseDown() {
        const p = this.game.input.mousePointer;
        if (this.bounds.contains(p.x, p.y) && p.rightButton.isDown) {
            this.dragSwitchPressed(null, this.game.input.mousePointer);
        }
    }

    private dragSwitchPressed(_: any, p: Phaser.Pointer) {
        switch (this.dragHandler.handler) {
            case HandlerType.MOVE: // transition to 'CONNECT'
                this.dragBitmap.fill(0, 255, 0);
                this.dragHandler.handler = HandlerType.CONNECT;
                break;
            case HandlerType.CONNECT: // transition to 'MOVE'
                this.dragBitmap.fill(255, 0, 0);
                this.dragHandler.handler = HandlerType.MOVE;
                break;
        }
    }

}
