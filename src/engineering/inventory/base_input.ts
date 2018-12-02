import { BaseComponent } from "./base_component";
import { Constraints, InventorySystem } from "./system";

export abstract class BaseInput extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number, key: string) {
        super(game, inventorySystem, x, y, key, 1, 1);
    }

    public getPower(): number {
        return 0;
    }

}
