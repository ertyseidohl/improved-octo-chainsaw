import { BaseComponent } from "./base_component";
import { InventorySystem } from "./system";

export class Engine extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "engine_1_live", 1, 2);
    }

}
