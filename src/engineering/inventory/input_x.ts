import { BaseInput } from "./base_input";
import { Constraints, InventorySystem } from "./system";

export class InputX extends BaseInput {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "button_x", position);
    }

    public getDescription(): string[] {
        return ["This lets the pilot hit the most mysterious 'x' key."];
    }

    public getPower(): number {
        return 0;
    }

}
