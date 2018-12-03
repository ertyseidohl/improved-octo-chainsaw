import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export abstract class BaseInput extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, key: string, position: Phaser.Point) {
        super(game, inventorySystem, key, 1, 1, position);
    }

    public getPower(): number {
        return 0;
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 0,
            },
            powerConsumer: null,
        };
    }

}
