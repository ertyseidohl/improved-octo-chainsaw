import { BaseComponent, PowerType } from "./inventory/base_component";
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
import { SpaceDiamond } from "./inventory/space_diamond";
import { SpaceJunk } from "./inventory/space_junk";
// import { MissileLauncher } from "./inventory/missile_launcher";

import { HandlerMode } from "./inventory/drag_handler/base";
import { MultiDragHandler } from "./inventory/drag_handler/multi";
import { BasicShip, InventorySystem, NUM_TILE_SPRITES} from "./inventory/system";

import { PowerSubSystem } from "./systems/power_subsystem";
import { System } from "./systems/system";

import { COMPONENT_TYPES, MAX_ENGINE, MAX_HEALTH, MAX_WEIGHT } from "../constants";

import { StartPad } from "./wiring/start_pad";
import { ConnectedWire } from "./wiring/wire";

export interface ShipUpdateMessage {
    topSpeed: number;
    guns: number;
    weight: number;
}

// HUD
const HEALTH_DISPLAY_Y: number = 20;
const HEALTH_DISPLAY_X: number = 80;

const ENGINE_DISPLAY_Y: number = 60;
const ENGINE_DISPLAY_X: number = 85;

const WEIGHT_DISPLAY_Y: number = 100;
const WEIGHT_DISPLAY_X: number = 85;

const POINTS_DISPLAY_Y: number = 768 - 24;

const HUD_TEXT_STYLE: Phaser.PhaserTextStyle = {
    fill: "white",
    font: "pixelsix",
    fontSize: 20,
};

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

    public bounds: Phaser.Rectangle;

    private points: number;
    private pointsText: Phaser.Text;

    private componentGroup: Phaser.Group;
    private powerHandleGroup: Phaser.Group;
    private wireGroup: Phaser.Group;

    private mouseInBounds: boolean;

    private playerHealth: number;

    private dragBitmap: Phaser.BitmapData;
    private dragHandler: MultiDragHandler;
    private inventorySystem: InventorySystem;
    private powerSystem: PowerSubSystem;
    private system: System;

    private healthIcons: Phaser.Sprite[];
    private engineIcons: Phaser.Sprite[];
    private weightIcons: Phaser.Sprite[];

    private testComponent: BaseComponent;

    private cargoHoldText: Phaser.Text;

    // CREATORS
    constructor(private state: Phaser.State) {
    }

    // PUBLIC METHODS
    public create(): void {

        this.points = 0;

        this.inventorySystem = new InventorySystem(
            this.game,
            600, 100,
            32, 32,
            new BasicShip(),
        );

        this.mouseInBounds = false;

        this.playerHealth = MAX_HEALTH;

        this.powerSystem = new PowerSubSystem();
        this.system = new System(this.inventorySystem);

        this.componentGroup = this.game.add.group();
        this.powerHandleGroup = this.game.add.group();
        this.wireGroup = this.game.add.group();

        this.dragHandler = new MultiDragHandler(
            this.game,
            this.inventorySystem,
            this.powerSystem,
        );
        this.inventorySystem.dragHandler = this.dragHandler;

        this.healthIcons = [];
        this.engineIcons = [];
        this.weightIcons = [];

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

        this.game.add.text(
            this.game.width / 2 + 10,
            HEALTH_DISPLAY_Y,
            "Health: ",
            HUD_TEXT_STYLE,
        );

        for (let i = 0; i < MAX_HEALTH; i++) {
            this.healthIcons[i] = this.game.add.sprite(
                this.game.width / 2 + (5 * i) + HEALTH_DISPLAY_X,
                HEALTH_DISPLAY_Y,
                "health",
            );
        }

        this.game.add.text(
            this.game.width / 2 + 10,
            ENGINE_DISPLAY_Y,
            "Engine: ",
            HUD_TEXT_STYLE,
        );

        for (let i = 0; i < MAX_ENGINE; i++) {
            this.engineIcons[i] = this.game.add.sprite(
                this.game.width / 2 + (5 * i) + ENGINE_DISPLAY_X,
                ENGINE_DISPLAY_Y,
                "engine",
            );
        }

        this.game.add.text(
            this.game.width / 2 + 10,
            WEIGHT_DISPLAY_Y,
            "Weight: ",
            HUD_TEXT_STYLE,
        );

        for (let i = 0; i < MAX_ENGINE; i++) {
            this.weightIcons[i] = this.game.add.sprite(
                this.game.width / 2 + (5 * i) + WEIGHT_DISPLAY_X,
                WEIGHT_DISPLAY_Y,
                "weight",
            );
        }

        this.cargoHoldText = this.game.add.text(
            this.game.width / 2 + 195, // dOnT uSe mAgiC nUmBErS
            440, // MAGIC NUMBER
            "Cargo Hold",
            {
                ...HUD_TEXT_STYLE,
                fill: "#555",
            },
        );

        this.pointsText = this.game.add.text(
            this.game.width / 2 + 10,
            POINTS_DISPLAY_Y,
            "Points: 0",
            HUD_TEXT_STYLE,
        );

        // do this last so they go on top of the text
        this.componentGroup = this.game.add.group();
        this.createStartingComponents();
    }

    public update(): ShipUpdateMessage {
        const updateMessage: ShipUpdateMessage = this.system.update();

        for (let i: number = 0; i < MAX_ENGINE; i++)  {
            this.engineIcons[i].visible = i < updateMessage.topSpeed;
        }
        for (let i = 0; i < MAX_HEALTH; i++) {
            this.healthIcons[i].visible = i < this.playerHealth;
        }
        for (let i = 0; i < MAX_ENGINE; i++) {
            this.weightIcons[i].visible = i < updateMessage.weight;
        }

        return updateMessage;
    }

    public damagePlayer(damage: number) {
        this.playerHealth -= damage;
    }

    public getPlayerHealth(): number {
        return this.playerHealth;
    }

    public dropOffCargo(): void {
        this.componentGroup.forEach((c: BaseComponent) => {
            if (c instanceof Prince) {
                this.points += 100;
                this.componentGroup.remove(c);
                c.destroy();
            }
            if (c instanceof SpaceDiamond) {
                this.points += 20;
                this.componentGroup.remove(c);
                c.destroy();
            }
        });
        this.pointsText.setText(`Points: ${this.points}`);
    }

    public hasConnectedTestComponent(): boolean {
        // TODO
        return true;
    }

    public princeInInventory(): boolean {
        for (const c of this.componentGroup.children) {
            if (c instanceof Prince) {
                return true;
            }
        }
        return false;
    }

    // PUBLIC PROPERTIES
    public get game(): Phaser.Game {
        return this.state.game;
    }

    public explode(): void {
        this.cargoHoldText.visible = false;
        this.inventorySystem.explode();
        this.game.physics.enable(this.componentGroup);
        this.componentGroup.forEach((c: BaseComponent) => {
            c.body.velocity.x = (Math.random() * 128) - 64;
            c.body.velocity.y = (Math.random() * 128) - 64;
        });
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
            case COMPONENT_TYPES.PRINCE:
                newComponent = new Prince(this.game, this.inventorySystem);
                break;
            case COMPONENT_TYPES.SPACE_JUNK:
                newComponent = new SpaceJunk(this.game, this.inventorySystem);
                break;
            case COMPONENT_TYPES.SPACE_DIAMOND:
                newComponent = new SpaceDiamond(this.game, this.inventorySystem);
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
        if (!this.testComponent) {
            this.testComponent = newComponent;
        }
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

                this.powerHandleGroup = this.game.add.group();

                for (const c of this.inventorySystem.getAllComponents()) {
                    c.lockDrag();
                    if (c.getPowerType() === PowerType.Source && c.getNextPowerPadIndex() >= 0) {
                        const pad = new StartPad(this.game, c, this.inventorySystem, this.powerSystem, this.wireGroup);
                        this.powerHandleGroup.add(pad);
                    }
                }

                this.wireGroup.visible = true;

                break;
            case HandlerMode.CONNECT: // transition to 'MOVE'
                this.dragBitmap.fill(255, 0, 0);
                this.dragHandler.setHandler(HandlerMode.MOVE);

                for (const c of this.inventorySystem.getAllComponents()) {
                    c.unlockDrag();
                }

                this.powerHandleGroup.destroy();
                this.wireGroup.visible = false;

                break;
        }
    }

}
