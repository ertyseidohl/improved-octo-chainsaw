import { BaseComponent } from "./base_component";
import { InventorySystem } from "./system";

export class EnergyCellHD extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "energy_cell_2", 1, 1);

        const energyCellAnimation = this.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(5, true);
    }

    public getDescription(): string[] {
        return [
            "This high-density energy cell requires at least fifteen people to lift (according to Space-OSHA)",
        ];
    }

    public getPower(): number {
        return 8;
    }

}