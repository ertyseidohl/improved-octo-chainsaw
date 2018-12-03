import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class SpaceDiamond extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "space_diamond", 1, 1, position);
    }

    public getDescription(): string[] {
        return [
            "This space diamond is heavy, but valuable...",
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
