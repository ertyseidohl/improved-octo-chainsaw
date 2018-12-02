import { BaseInput } from "./base_input";
import { Constraints, InventorySystem } from "./system";

export class InputC extends BaseInput {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "button_c");
    }

    public getDescription(): string[] {
        return ["This is a pirate's favorite button."];
    }

    public getPower(): number {
        return 0;
    }

}
