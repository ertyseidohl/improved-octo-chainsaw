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

import { HandlerMode } from "./inventory/drag_handler/base";
import { MultiDragHandler } from "./inventory/drag_handler/multi";
import { BasicShip, InventorySystem, NUM_TILE_SPRITES} from "./inventory/system";

import { PowerSubSystem } from "./systems/power_subsystem";
import { System } from "./systems/system";

import { Point } from "phaser-ce";

import { COMPONENT_TYPES } from "../constants";

export interface ShipUpdateMessage {
    topSpeed: number;
    guns: number;
}

// =================
// class Engineering
// =================

export default class Engineering {

    public static preload(game: Phaser.Game): void {
        game.load.spritesheet("engine_1", "../assets/engine_1.png", 32, 64, 5);

        game.load.spritesheet("gun_1", "../assets/gun_1.png", 32, 32 * 3, 5);
        game.load.spritesheet("gun_small", "../assets/gun_small.png", 32, 32 * 2, 5);
        game.load.spritesheet("energy_cell", "../assets/energy_cell.png", 32, 32, 5);
        game.load.spritesheet("energy_cell_2", "../assets/energy_cell_2.png", 32, 32, 5);
        game.load.spritesheet("shield_generator", "../assets/shield_generator.png", 64, 32, 5);

        for (let i: number = 1; i <= NUM_TILE_SPRITES; i++) {
            game.load.image(`floor_tile_${i}`, `../assets/floor_tile_${i}.png`);
        }

        game.load.spritesheet("wire", "../assets/wire.png", 4, 4, 2);
    }

    // PUBLIC DATA
    public bounds: Phaser.Rectangle;

    private componentGroup: Phaser.Group;

    private mouseInBounds: boolean;

    private dragBitmap: Phaser.BitmapData;
    private dragHandler: MultiDragHandler;
    private inventorySystem: InventorySystem;
    private powerSystem: PowerSubSystem;
    private system: System;

    // CREATORS
    constructor(private state: Phaser.State) {
    }

    // PUBLIC METHODS
    public create(): void {

        this.inventorySystem = new InventorySystem(
            this.game,
            600, 100,
            32, 32,
            new BasicShip(),
        );

        this.mouseInBounds = false;

        this.powerSystem = new PowerSubSystem();
        this.system = new System(this.inventorySystem);

        this.componentGroup = this.game.add.group();
        this.dragHandler = new MultiDragHandler(
            this.game,
            this.inventorySystem,
            this.powerSystem,
        );
        this.inventorySystem.dragHandler = this.dragHandler;

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
    }

    public update(): ShipUpdateMessage {
        return this.system.update();
    }

    // PUBLIC PROPERTIES
    public get game(): Phaser.Game {
        return this.state.game;
    }

    public explode(): void {
        this.inventorySystem.explode();
    }

    public createComponentByName(componentType: COMPONENT_TYPES) {
        let newComponent: BaseComponent;
        switch (componentType) {
            case COMPONENT_TYPES.BASIC_GUN:
                newComponent = new BasicGun(this.game, this.inventorySystem);
                break;
            case COMPONENT_TYPES.ENGINE:
                newComponent = new Engine(this.game, this.inventorySystem);
                break;
            default:
                throw new Error(`unknown component type for createComponentByname: ${componentType}`);
        }
        return this.addComponent(newComponent, null, true);
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
        const firstGun = new BasicGun(this.game, this.inventorySystem);
        this.addComponent(firstGun);

        const secondGun = new BasicGun(this.game, this.inventorySystem);
        this.addComponent(secondGun);

        const firstPowerSource = new EnergyCell(this.game, this.inventorySystem);
        this.addComponent(firstPowerSource, new Phaser.Point(4, 4));

        const secondPowerSource = new EnergyCell(this.game, this.inventorySystem);
        this.addComponent(secondPowerSource, new Phaser.Point(5, 4));

        const firstEngine = new Engine(this.game, this.inventorySystem);
        this.addComponent(firstEngine, new Phaser.Point(3, 6));

        const secondEngine = new Engine(this.game, this.inventorySystem);
        this.addComponent(secondEngine, new Phaser.Point(6, 6));
    }

    private dragSwitchPressed(_: any, p: Phaser.Pointer) {
        switch (this.dragHandler.handler) {
            case HandlerMode.MOVE: // transition to 'CONNECT'
                this.dragBitmap.fill(0, 255, 0);
                this.dragHandler.setHandler(HandlerMode.CONNECT);
                break;
            case HandlerMode.CONNECT: // transition to 'MOVE'
                this.dragBitmap.fill(255, 0, 0);
                this.dragHandler.setHandler(HandlerMode.MOVE);
                break;
        }
    }

}
