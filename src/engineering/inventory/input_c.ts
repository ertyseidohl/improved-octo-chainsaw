import { BaseInput } from "./base_input";
import { Constraints, InventorySystem } from "./system";

export class InputC extends BaseInput {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "button_c", position);
    }

    public getDescription(): string[] {
        return ["This is a pirate's favorite button."];
    }

    public getPower(): number {
        return 0;
    }

}
