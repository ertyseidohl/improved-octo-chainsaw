import { BaseComponent } from "./base_component";
import { InventorySystem } from "./system";

export class BasicGun extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "mario", 2, 2);
    }

}
