import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class SpaceJunk extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "space_junk", 1, 1, position);
    }

    public getDescription(): string[] {
        return [
            "This space junk is bogging you down!",
        ];
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: null,
            powerConsumer: null,
            weight: 1,
        };
    }

    public getPower(): number {
        return 0;
    }
}
