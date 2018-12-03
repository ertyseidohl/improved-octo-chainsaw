import { BaseInput } from "./base_input";
import { Constraints, InventorySystem } from "./system";

export class InputZ extends BaseInput {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "button_z", position);
    }

    public getDescription(): string[] {
        return ["The z button is the most luxurious button."];
    }

    public getPower(): number {
        return 0;
    }

}
