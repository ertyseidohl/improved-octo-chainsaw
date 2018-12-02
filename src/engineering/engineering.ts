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

import { PowerSubSystem } from "./inventory/power_subsystem";
import { BasicShip, InventorySystem, NUM_TILE_SPRITES} from "./inventory/system";

import { HandlerType, MultiDragHandler } from "./inventory/drag_handler/multi";

// =================
// class Engineering
// =================

export default class Engineering {

    // PUBLIC DATA
    public bounds: Phaser.Rectangle;

    private comps: Phaser.Group;

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

        this.comps = this.game.add.group();
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
    private addComponent<C>(comp: C, name?: string): C {
        this.comps.add(comp);
        if (comp instanceof Phaser.Sprite) {
            comp.inputEnabled = true;
            if (name) {
                comp.name = name;
            }
        }
        return comp;
    }

    private createStartingComponents(): void {
        const gunCoord = this.inventorySystem.gridIndexToPixels(2, 4);
        const basicGun = new BasicGun(this.game, this.inventorySystem, gunCoord.x, gunCoord.y);
        this.inventorySystem.place(basicGun);

        const cellCoord = this.inventorySystem.gridIndexToPixels(5, 3);
        const cell = new EnergyCell(this.game, this.inventorySystem, cellCoord.x, cellCoord.y);
        this.inventorySystem.place(cell);

        this.powerSystem.attach(cell, basicGun);
        this.powerSystem.attach(cell, basicGun);
        this.powerSystem.updateAllComponents();

        const smallGunCoord = this.inventorySystem.gridIndexToPixels(1, 5);
        const smallGun = new SmallGun(this.game, this.inventorySystem, smallGunCoord.x, smallGunCoord.y);

        // const cellHDCoord = this.inventorySystem.gridIndexToPixels(6, 3);
        // this.inventorySystem.place(new EnergyCellHD(this.game, this.inventorySystem, cellHDCoord.x, cellHDCoord.y));

        const engCoord1 = this.inventorySystem.gridIndexToPixels(3, 6);

        const b: Engine = new Engine(this.game, this.inventorySystem, engCoord1.x, engCoord1.y);
        this.inventorySystem.place(b);

        const engCoord2 = this.inventorySystem.gridIndexToPixels(6, 6);
        this.inventorySystem.place(new Engine(this.game, this.inventorySystem, engCoord2.x, engCoord2.y));

        const inputZ = this.inventorySystem.gridIndexToPixels(7, 7);
        this.inventorySystem.place(new InputZ(this.game, this.inventorySystem, inputZ.x, inputZ.y));

        const inputX = this.inventorySystem.gridIndexToPixels(7, 6);
        this.inventorySystem.place(new InputX(this.game, this.inventorySystem, inputX.x, inputX.y));

        const inputC = this.inventorySystem.gridIndexToPixels(7, 5);
        this.inventorySystem.place(new InputC(this.game, this.inventorySystem, inputC.x, inputC.y));

        const shieldGenerator = this.inventorySystem.gridIndexToPixels(5, 5);
        this.inventorySystem.place(
            new ShieldGenerator(this.game, this.inventorySystem, shieldGenerator.x, shieldGenerator.y),
        );

        // const missileLauncher = this.inventorySystem.gridIndexToPixels(3, 2);
        // this.inventorySystem.place(new MissileLauncher(
        //     this.game,
        //     this.inventorySystem,
        //     missileLauncher.x,
        //     missileLauncher.y,
        // ));

        // const prince = this.inventorySystem.gridIndexToPixels(3, 1);
        // this.inventorySystem.place(new Prince(this.game, this.inventorySystem, prince.x, prince.y));
    }

    private dragSwitchPressed(dragSwitch: Phaser.Sprite, p: Phaser.Pointer) {
        switch (this.dragHandler.handler) {
            case HandlerType.MOVE:  // transition to 'CONNECT'
                this.comps.setAll("alpha", 0.5);
                this.dragBitmap.fill(0, 255, 0);
                this.dragHandler.handler = HandlerType.CONNECT;
                break;
            case HandlerType.CONNECT:  // transition to 'MOVE'
                this.comps.setAll("alpha", 1);
                this.dragBitmap.fill(255, 0, 0);
                this.dragHandler.handler = HandlerType.MOVE;
                break;
        }
    }

}
