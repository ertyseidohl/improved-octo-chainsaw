import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class EnergyCell extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "energy_cell", 1, 1, position);

        const energyCellAnimation = this.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(20, true);
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 4,
            },
        };
    }

    public getDescription(): string[] {
        return [
            "The ZZ-55000 is a real hair-raiser! Make sure to ground yourself before coming within 100 meters...",
        ];
    }

}
