import { BaseComponent } from "./base_component";
import { InventorySystem } from "./system";

export class EnergyCell extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "energy_cell", 1, 1);

        const energyCellAnimation = this.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(20, true);
    }

}
