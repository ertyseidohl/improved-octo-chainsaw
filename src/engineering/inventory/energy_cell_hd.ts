import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class EnergyCellHD extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "energy_cell_2", 1, 1, position);

        const energyCellAnimation = this.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(5, true);
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 8,
            },
            powerConsumer: null,
            weight: 4,
        };
    }

    public getDescription(): string[] {
        return [
            "This high-density energy cell requires at least fifteen people to lift (according to Space-OSHA)",
        ];
    }

}
