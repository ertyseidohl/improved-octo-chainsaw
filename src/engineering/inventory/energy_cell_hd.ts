import { StateConfig } from "./component_state";
import { EnergyCell } from "./energy_cell";
import { InventorySystem } from "./system";

export class EnergyCellHD extends EnergyCell {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, position, "energy_cell_hd", 1, 1);
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
            // tslint:disable-next-line
            "This high-density energy cell requires at least fifteen people to lift (according to Space-OSHA). Has 8 wires.",
        ];
    }

}
